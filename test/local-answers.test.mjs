import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile, chmod } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

// Fake CLIs record how they were started and print canned events, so no real model is called.
const fake = (events, version) => `#!/usr/bin/env node
const fs = require('node:fs');
if (process.argv[2] === '--version') { console.log(${JSON.stringify(version)}); process.exit(0); }
const started = Date.now(); Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 400);
fs.appendFileSync(process.env.FAKE_LOG, JSON.stringify({ name: require('node:path').basename(process.argv[1]), argv: process.argv.slice(2), cwd: process.cwd(), files: fs.readdirSync(process.cwd()), parentSession: process.env.CLAUDECODE ?? null, started, ended: Date.now() }) + '\\n');
for (const e of ${JSON.stringify(events)}) console.log(JSON.stringify(e));
`;
const claudeEvents = [
  { type: 'system', subtype: 'init', model: 'claude-test' },
  { type: 'assistant', message: { content: [{ type: 'tool_use', name: 'WebSearch', input: { query: 'x' } }] } },
  { type: 'result', subtype: 'success', is_error: false, total_cost_usd: 0.01, result: 'Try [Example Mail](https://www.example-mail.test/) or Other Inbox at https://other.test/.' },
];
const codexEvents = [
  { type: 'item.completed', item: { type: 'web_search', query: 'x' } },
  { type: 'item.completed', item: { type: 'agent_message', text: 'Checking.' } },
  { type: 'item.completed', item: { type: 'agent_message', text: 'Other Inbox: https://other.test/' } },
];

test('ask-local runs each installed CLI in an empty folder and records mentions and citations', { skip: process.platform === 'win32' }, async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'aicw ask '));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bin = path.join(root, 'bin'); await mkdir(bin);
  for (const [name, events] of [['claude', claudeEvents], ['codex', codexEvents]]) {
    await writeFile(path.join(bin, name), fake(events, `${name} 9.9.9`)); await chmod(path.join(bin, name), 0o755);
  }
  const questions = path.join(root, 'questions.txt');
  await writeFile(questions, '# audience tasks\n- Which inbox services suit AI agents?\n2. How can an agent receive files by email?\n');
  const log = path.join(root, 'calls.jsonl'), output = path.join(root, 'report');
  const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, FAKE_LOG: log, CLAUDECODE: '1' };
  const cli = path.resolve('src/cli.mjs');
  const run = args => spawnSync(process.execPath, [cli, 'ask-local', ...args], { cwd: root, env, encoding: 'utf8' });

  assert.equal(run(['--questions', questions]).status, 2, 'ask-local must require explicit --online');
  const result = run(['--questions', questions, '--online', '--brand', 'Example Mail', '--domain', 'www.example-mail.test', '--output', output]);
  assert.equal(result.status, 0, result.stderr);
  const report = JSON.parse(await readFile(path.join(output, 'answers.json'), 'utf8'));
  assert.deepEqual(report.engines, [{ name: 'claude', version: 'claude 9.9.9' }, { name: 'codex', version: 'codex 9.9.9' }]);
  assert.deepEqual(report.answers.map(a => [a.engine, a.question]), [
    ['claude', 'Which inbox services suit AI agents?'], ['claude', 'How can an agent receive files by email?'],
    ['codex', 'Which inbox services suit AI agents?'], ['codex', 'How can an agent receive files by email?'],
  ]);
  const [claude, , codex] = report.answers;
  assert.equal(claude.model, 'claude-test');
  assert.equal(claude.web_search_used, true);
  assert.equal(claude.brand_mentioned, true);
  assert.equal(claude.brand_cited, true);
  assert.deepEqual(claude.cited_urls, ['https://www.example-mail.test/', 'https://other.test/']);
  assert.equal(codex.answer, 'Other Inbox: https://other.test/');
  assert.equal(codex.brand_mentioned, false);
  assert.equal(codex.brand_cited, false);
  assert.equal(codex.error, null);
  assert.match(await readFile(path.join(output, 'answers.md'), 'utf8'), /AI Search Engine Optimization Guide/);

  const calls = (await readFile(log, 'utf8')).trim().split('\n').map(x => JSON.parse(x));
  assert.equal(calls.length, 4);
  const question = c => c.argv.at(c.name === 'claude' ? 1 : -1);
  const overlap = (a, b) => a.started < b.ended && b.started < a.ended;
  const byName = Object.fromEntries(calls.filter(c => question(c).startsWith('Which')).map(c => [c.name, c]));
  assert.ok(overlap(byName.claude, byName.codex), 'engines must run in parallel');
  const claudeCalls = calls.filter(c => c.name === 'claude');
  assert.ok(overlap(...claudeCalls), 'questions must run in parallel');
  assert.equal(new Set(calls.map(c => c.cwd)).size, 4, 'each question needs its own folder');
  for (const call of calls) {
    assert.notEqual(call.cwd, root, 'engine must not run in the caller folder');
    assert.deepEqual(call.files, [], 'engine folder must be empty');
    assert.equal(call.parentSession, null, 'parent agent session must not leak');
  }
  assert.ok(byName.claude.argv.includes('--strict-mcp-config') && byName.claude.argv.includes('WebSearch,WebFetch'));
  assert.ok(byName.codex.argv.includes('web_search="live"') && byName.codex.argv.includes('read-only'));

  const again = run(['--questions', questions, '--online', '--output', output]);
  assert.equal(again.status, 2, 'existing answers must not be overwritten');
});
