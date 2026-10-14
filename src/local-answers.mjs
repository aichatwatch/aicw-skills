import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { BOOK_SOURCE } from './book.mjs';

// Session variables of a parent agent. A child CLI must start as a fresh, unrelated session.
const PARENT_SESSION = ['CLAUDECODE', 'CLAUDE_PID', 'CLAUDE_EFFORT', 'CLAUDE_CODE_ENTRYPOINT', 'CLAUDE_CODE_EXECPATH', 'CLAUDE_CODE_SESSION_ID', 'CLAUDE_CODE_CHILD_SESSION', 'CLAUDE_CODE_SESSION_ATTENDED', 'CLAUDE_CODE_MESSAGING_SOCKET', 'CLAUDE_CODE_MESSAGING_TOKEN'];

// Each engine answers in an empty folder with web search only: no project files, user settings, or MCP servers.
export const ENGINES = {
  claude: {
    args: (question, o) => ['-p', question, '--output-format', 'stream-json', '--verbose', '--no-session-persistence', '--setting-sources', 'project', '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}', '--no-chrome', '--permission-mode', 'dontAsk', '--tools', 'WebSearch,WebFetch', '--allowedTools', 'WebSearch,WebFetch', '--max-budget-usd', String(o.maxBudgetUSD), ...(o.claudeModel ? ['--model', o.claudeModel] : [])],
    parse(events) {
      const result = events.findLast(e => e.type === 'result');
      const tools = events.flatMap(e => e.type === 'assistant' ? e.message?.content ?? [] : []).filter(c => c.type === 'tool_use');
      const ok = result?.is_error === false && result.subtype === 'success';
      return { model: events.find(e => e.type === 'system' && e.subtype === 'init')?.model ?? null, answer: ok ? result.result ?? '' : '', error: ok ? null : String(result?.result || result?.subtype || 'No result event.'), webSearch: tools.some(t => /^Web(?:Search|Fetch)$/.test(t.name)), costUSD: result?.total_cost_usd ?? null };
    },
  },
  codex: {
    args: (question, o) => ['exec', '--json', '--ephemeral', '--skip-git-repo-check', '--ignore-user-config', '--sandbox', 'read-only', '--color', 'never', '-c', 'web_search="live"', ...(o.codexModel ? ['--model', o.codexModel] : []), question],
    parse(events) {
      const messages = events.filter(e => e.type === 'item.completed' && e.item?.type === 'agent_message');
      const failed = events.find(e => e.type === 'turn.failed' || e.type === 'error');
      return { model: null, answer: messages.at(-1)?.item.text ?? '', error: failed ? String(failed.error?.message ?? failed.message ?? 'Turn failed.') : messages.length ? null : 'No answer message.', webSearch: events.some(e => e.item?.type === 'web_search'), costUSD: null };
    },
  },
};

export function readQuestions(text) {
  const questions = text.split(/\r?\n/).map(x => x.trim().replace(/^(?:[-*]|\d+[.)])\s+/, '')).filter(x => x && !x.startsWith('#'));
  if (!questions.length || questions.length > 20) throw new Error('Supply 1 to 20 questions, one per line.');
  return questions;
}
export function citedURLs(text) {
  const urls = new Set();
  for (let [url] of text.matchAll(/https?:\/\/[^\s<>"'`\]\[]+/g)) {
    url = url.replace(/[.,;:!?*_]+$/, '');
    while (url.endsWith(')') && (url.match(/\(/g) ?? []).length < (url.match(/\)/g) ?? []).length) url = url.slice(0, -1);
    try { urls.add(new URL(url).href); } catch {}
  }
  return [...urls];
}
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function mentions(text, brands) { return brands.some(b => new RegExp(`(?<![\\p{L}\\p{N}])${escape(b)}(?![\\p{L}\\p{N}])`, 'iu').test(text)); }
export function cites(urls, domains) { return domains.length ? urls.some(u => { const host = new URL(u).hostname.replace(/^www\./, ''); return domains.some(d => host === d || host.endsWith('.' + d)); }) : null; }

export function engineVersion(name) {
  const r = spawnSync(name, ['--version'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 20_000 });
  return r.status === 0 ? r.stdout.trim().split('\n')[0] : null;
}
function run(command, args, { cwd, timeout }) {
  const env = { ...process.env }; for (const k of PARENT_SESSION) delete env[k];
  return new Promise(resolve => {
    const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '', timedOut = false;
    child.stdout.on('data', b => { stdout += b; }); child.stderr.on('data', b => { stderr += b; });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); }, timeout);
    child.on('error', e => { stderr += e.message; });
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr, timedOut }); });
  });
}

export async function askLocal({ questions, engines, brands = [], domains = [], timeout = 300_000, maxBudgetUSD = 0.5, parallel = 3, claudeModel, codexModel, log = () => {} }) {
  if (process.platform === 'win32') throw new Error('ask-local supports macOS and Linux. On Windows, run it in WSL.');
  const requested = engines ?? Object.keys(ENGINES);
  for (const name of requested) if (!ENGINES[name]) throw new Error(`Unknown engine: ${name}. Use ${Object.keys(ENGINES).join(', ')}.`);
  const found = requested.map(name => ({ name, version: engineVersion(name) }));
  const usable = found.filter(e => e.version);
  if (!usable.length) throw new Error(`None of these CLIs is installed and working: ${requested.join(', ')}.`);
  const ask = async (engine, question) => {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'aicw-ask-'));
    const started = Date.now();
    log(`${engine.name}: ${question}`);
    try {
      const result = await run(engine.name, ENGINES[engine.name].args(question, { maxBudgetUSD, claudeModel, codexModel }), { cwd, timeout });
      const events = result.stdout.split('\n').flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
      const parsed = ENGINES[engine.name].parse(events);
      const error = result.timedOut ? `Timed out after ${timeout} ms.` : parsed.error ?? (result.code === 0 ? null : (result.stderr.trim().split('\n').at(-1) || `Exit code ${result.code}.`));
      const urls = citedURLs(parsed.answer);
      return { engine: engine.name, engine_version: engine.version, model: parsed.model, question, observed_at: new Date(started).toISOString(), web_search_used: parsed.webSearch, brand_mentioned: brands.length ? mentions(parsed.answer, brands) : null, brand_cited: cites(urls, domains), cited_urls: urls, answer: parsed.answer, cost_usd: parsed.costUSD, duration_ms: Date.now() - started, error };
    } finally { await rm(cwd, { recursive: true, force: true }); }
  };
  // Engines run in parallel, each with up to `parallel` questions at a time. Results keep engine, then question order.
  const answers = (await Promise.all(usable.map(async engine => {
    const own = new Array(questions.length); let next = 0;
    await Promise.all(Array.from({ length: Math.min(parallel, questions.length) }, async () => {
      while (next < questions.length) { const i = next++; own[i] = await ask(engine, questions[i]); }
    }));
    return own;
  }))).flat();
  return {
    version: 1, tool: 'ask-local', book: BOOK_SOURCE, bookPages: '77-79', brands, domains,
    engines: found, answers,
    limitation: 'Answers come from local coding-agent CLIs with web search, using the user’s own accounts. They are samples, not consumer chat results or rankings. Model, tools, and search results change over time.',
  };
}

export function answersMarkdown(r) {
  const cell = v => v === null ? 'n/a' : v === true ? 'yes' : v === false ? 'no' : String(v).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  return [
    '# Local AI answers', '',
    `Based on ${r.book.author}’s [${r.book.title}](${r.book.url}), pages ${r.bookPages}.`, '',
    `Brands: ${r.brands.join(', ') || 'not set'}. Domains: ${r.domains.join(', ') || 'not set'}.`, '',
    '| Engine | Model | Question | Web search | Mentioned | Cited | Links | Error |', '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...r.answers.map(a => `| ${cell(a.engine)} | ${cell(a.model)} | ${cell(a.question)} | ${cell(a.web_search_used)} | ${cell(a.brand_mentioned)} | ${cell(a.brand_cited)} | ${a.cited_urls.length} | ${cell(a.error)} |`), '',
    ...r.answers.flatMap(a => [`## ${a.engine}: ${a.question}`, '', `Observed ${a.observed_at}. Model: ${a.model ?? 'not reported'}.`, '', a.answer || `_No answer: ${a.error}_`, '']),
    r.limitation, '',
  ].join('\n');
}
