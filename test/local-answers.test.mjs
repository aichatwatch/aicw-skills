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
  delete env.CODEX_SANDBOX; delete env.CODEX_SANDBOX_NETWORK_DISABLED;
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
  assert.deepEqual(calls.map(c => [c.name, question(c)]), report.answers.map(a => [a.engine, a.question]), 'answers run in engine, then question order');
  for (let i = 1; i < calls.length; i++) assert.ok(calls[i].started >= calls[i - 1].ended, 'only one CLI may run at a time');
  assert.equal(new Set(calls.map(c => c.cwd)).size, 4, 'each question needs its own folder');
  for (const call of calls) {
    assert.notEqual(call.cwd, root, 'engine must not run in the caller folder');
    assert.deepEqual(call.files, [], 'engine folder must be empty');
    assert.equal(call.parentSession, null, 'parent agent session must not leak');
  }
  const byName = Object.fromEntries(calls.map(c => [c.name, c]));
  assert.ok(byName.claude.argv.includes('--strict-mcp-config') && byName.claude.argv.includes('WebSearch,WebFetch'));
  assert.ok(byName.codex.argv.includes('web_search="live"') && byName.codex.argv.includes('read-only'));

  const again = run(['--questions', questions, '--online', '--output', output]);
  assert.equal(again.status, 2, 'existing answers must not be overwritten');
});

test('ask-local stops inside the Codex sandbox and keeps the CLI error line', { skip: process.platform === 'win32' }, async t => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'aicw sandbox '));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bin = path.join(root, 'bin'); await mkdir(bin);
  await writeFile(path.join(bin, 'claude'), fake(claudeEvents, 'claude 9.9.9')); await chmod(path.join(bin, 'claude'), 0o755);
  // This codex starts, then fails the way a nested codex fails in a sandbox.
  await writeFile(path.join(bin, 'codex'), `#!/bin/sh\n[ "$1" = --version ] && { echo "codex 9.9.9"; exit 0; }\necho "Error: failed to initialize in-process app-server client: Operation not permitted (os error 1)" >&2\nexit 1\n`);
  await chmod(path.join(bin, 'codex'), 0o755);
  const questions = path.join(root, 'questions.txt'); await writeFile(questions, 'Which inbox services suit AI agents?\n');
  const log = path.join(root, 'calls.jsonl');
  const base = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH}`, FAKE_LOG: log };
  delete base.CODEX_SANDBOX; delete base.CODEX_SANDBOX_NETWORK_DISABLED;
  const run = (args, extra = {}) => spawnSync(process.execPath, [path.resolve('src/cli.mjs'), 'ask-local', '--questions', questions, '--online', ...args], { cwd: root, env: { ...base, ...extra }, encoding: 'utf8' });

  const offline = run([], { CODEX_SANDBOX: 'seatbelt', CODEX_SANDBOX_NETWORK_DISABLED: '1' });
  assert.equal(offline.status, 2); assert.match(offline.stderr, /Network access is off/);
  const sandboxed = run([], { CODEX_SANDBOX: 'seatbelt' });
  assert.equal(sandboxed.status, 2); assert.match(sandboxed.stderr, /codex CLI cannot start inside the Codex sandbox/);
  await assert.rejects(readFile(log), 'no engine may start before the sandbox check');

  const claudeOnly = run(['--engines', 'claude'], { CODEX_SANDBOX: 'seatbelt' });
  assert.equal(claudeOnly.status, 0, claudeOnly.stderr);
  assert.equal(JSON.parse(claudeOnly.stdout).answers[0].error, null);

  const failed = JSON.parse(run(['--engines', 'codex']).stdout).answers[0];
  assert.equal(failed.error, 'No answer message. Error: failed to initialize in-process app-server client: Operation not permitted (os error 1)');
});
