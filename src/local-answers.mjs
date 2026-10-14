import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, rm, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
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

export function siteName(value) {
  let host;
  try { host = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`).hostname.toLowerCase().replace(/^www\./, ''); } catch {}
  if (!host || !/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(host)) throw new Error(`--site needs a domain such as example.com, not: ${value}`);
  return host;
}
const day = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Each site keeps one question list and all its scans in one folder, so later scans reuse the questions and can be compared.
export async function prepareSite({ site, reportsDir, questionsFile, now = new Date() }) {
  const dir = path.join(reportsDir, site), saved = path.join(dir, 'questions.txt');
  await mkdir(dir, { recursive: true });
  let text;
  if (questionsFile) {
    text = await readFile(questionsFile, 'utf8'); readQuestions(text);
    await writeFile(saved, text, { flag: 'wx' }).catch(e => { if (e.code !== 'EEXIST') throw e; });
  } else {
    text = await readFile(saved, 'utf8').catch(e => { throw e.code === 'ENOENT' ? new Error(`No saved questions for ${site}. Write them to ${saved}, one per line, or pass --questions FILE.`) : e; });
  }
  const taken = new Set(await readdir(dir));
  let name = `${day(now)}-mentions`;
  for (let n = 2; taken.has(name); n++) name = `${day(now)}-mentions-${n}`;
  const questions = readQuestions(text);
  return { dir, savedQuestions: saved, questions, output: path.join(dir, name), previous: await latestScan(dir, questions) };
}
// The newest earlier scan that asked at least one of these questions.
export async function latestScan(dir, questions) {
  const scans = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    try {
      const result = JSON.parse(await readFile(path.join(dir, entry.name, 'answers.json'), 'utf8'));
      if (result.tool === 'ask-local' && result.answers?.some(a => questions.includes(a.question))) scans.push({ folder: entry.name, result, at: result.answers[0].observed_at });
    } catch {}
  }
  return scans.sort((a, b) => a.at.localeCompare(b.at)).at(-1) ?? null;
}

// Counts per engine and the most-cited sites, so every agent reports the same numbers.
export function summarize(r, previous = null) {
  const host = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; } };
  const engines = [...new Set(r.answers.map(a => a.engine))].map(name => {
    const all = r.answers.filter(a => a.engine === name), ok = all.filter(a => !a.error);
    const count = (list, key) => list.some(a => a[key] === null) ? null : list.filter(a => a[key]).length;
    const before = previous?.result.answers.filter(a => a.engine === name && !a.error) ?? [];
    const same = ok.filter(a => before.some(b => b.question === a.question));
    const mentioned = count(ok, 'brand_mentioned');
    return {
      engine: name, answers: ok.length, errors: all.length - ok.length, mentioned, cited: count(ok, 'brand_cited'), web_search: ok.filter(a => a.web_search_used).length,
      before: same.length && mentioned !== null ? { questions: same.length, mentioned_before: before.filter(b => same.some(a => a.question === b.question) && b.brand_mentioned).length, mentioned_now: count(same, 'brand_mentioned') } : null,
    };
  });
  const sites = new Map();
  for (const a of r.answers) for (const h of new Set(a.cited_urls.map(host).filter(Boolean))) sites.set(h, (sites.get(h) ?? 0) + 1);
  return { engines, top_cited_sites: [...sites].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10).map(([site, answers]) => ({ site, answers })), compared_with: previous?.folder ?? null };
}

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

export async function askLocal({ questions, engines, brands = [], domains = [], timeout = 300_000, maxBudgetUSD = 0.5, claudeModel, codexModel, log = () => {} }) {
  if (process.platform === 'win32') throw new Error('ask-local supports macOS and Linux. On Windows, run it in WSL.');
  const requested = engines ?? Object.keys(ENGINES);
  for (const name of requested) if (!ENGINES[name]) throw new Error(`Unknown engine: ${name}. Use ${Object.keys(ENGINES).join(', ')}.`);
  const found = requested.map(name => ({ name, version: engineVersion(name) }));
  const usable = found.filter(e => e.version);
  if (!usable.length) throw new Error(`None of these CLIs is installed and working: ${requested.join(', ')}.`);
  // Codex marks commands it runs in its sandbox. A nested codex cannot start there, and every engine needs the network.
  if (process.env.CODEX_SANDBOX_NETWORK_DISABLED === '1') throw new Error('Network access is off in this Codex sandbox. Run ask-local outside the sandbox, or with network access, after the user approves.');
  if (process.env.CODEX_SANDBOX && usable.some(e => e.name === 'codex')) throw new Error('The codex CLI cannot start inside the Codex sandbox, which blocks writes to its ~/.codex folder. Ask to run ask-local outside the sandbox, so Codex asks the user to approve, or use --engines claude.');
  const ask = async (engine, question) => {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'aicw-ask-'));
    const started = Date.now();
    log(`${engine.name}: ${question}`);
    try {
      const result = await run(engine.name, ENGINES[engine.name].args(question, { maxBudgetUSD, claudeModel, codexModel }), { cwd, timeout });
      const events = result.stdout.split('\n').flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
      const parsed = ENGINES[engine.name].parse(events);
      const failure = result.code === 0 ? null : result.stderr.trim().split('\n').at(-1) || `Exit code ${result.code}.`;
      const error = result.timedOut ? `Timed out after ${timeout} ms.` : [parsed.error, failure].filter(Boolean).join(' ') || null;
      const urls = citedURLs(parsed.answer);
      return { engine: engine.name, engine_version: engine.version, model: parsed.model, question, observed_at: new Date(started).toISOString(), web_search_used: parsed.webSearch, brand_mentioned: brands.length ? mentions(parsed.answer, brands) : null, brand_cited: cites(urls, domains), cited_urls: urls, answer: parsed.answer, cost_usd: parsed.costUSD, duration_ms: Date.now() - started, error };
    } finally { await rm(cwd, { recursive: true, force: true }); }
  };
  // One answer at a time: slower, but no CLI ever runs beside another copy of itself or the other engine.
  const answers = [];
  for (const engine of usable) for (const question of questions) answers.push(await ask(engine, question));
  return {
    version: 1, tool: 'ask-local', book: BOOK_SOURCE, bookPages: '77-79', brands, domains,
    engines: found, answers,
    limitation: 'Answers come from local coding-agent CLIs with web search, using the user’s own accounts. They are samples, not consumer chat results or rankings. Model, tools, and search results change over time.',
  };
}

export function answersMarkdown(r) {
  const cell = v => v === null ? 'n/a' : v === true ? 'yes' : v === false ? 'no' : String(v).replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const s = r.summary ?? summarize(r);
  const line = e => [
    `- **${e.engine}:** ${e.mentioned === null ? 'brand not set' : `named the brand in ${e.mentioned} of ${e.answers} answers`}`,
    e.cited === null ? '' : `, linked the site in ${e.cited}`, `, searched the web in ${e.web_search}`, e.errors ? `; ${e.errors} failed` : '', '.',
    e.before ? ` Same questions in ${s.compared_with}: named in ${e.before.mentioned_before}, now ${e.before.mentioned_now} of ${e.before.questions}.` : '',
  ].join('');
  return [
    '# Local AI answers', '',
    `Based on ${r.book.author}’s [${r.book.title}](${r.book.url}), pages ${r.bookPages}.`, '',
    `Brands: ${r.brands.join(', ') || 'not set'}. Domains: ${r.domains.join(', ') || 'not set'}.`, '',
    '## Summary', '', ...s.engines.map(line), '',
    s.top_cited_sites.length ? `Most-cited sites, by number of answers linking them: ${s.top_cited_sites.map(x => `${x.site} (${x.answers})`).join(', ')}.` : 'No answer linked to a website.', '',
    'Book checklist: these answers record C4.1 (visibility in AI answers) and sample C4.2 (frequently cited sources). C4.3 to C4.6 need other evidence and are not assessed here.', '',
    '## Answers', '',
    '| Engine | Model | Question | Web search | Mentioned | Cited | Links | Error |', '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...r.answers.map(a => `| ${cell(a.engine)} | ${cell(a.model)} | ${cell(a.question)} | ${cell(a.web_search_used)} | ${cell(a.brand_mentioned)} | ${cell(a.brand_cited)} | ${a.cited_urls.length} | ${cell(a.error)} |`), '',
    ...r.answers.flatMap(a => [`## ${a.engine}: ${a.question}`, '', `Observed ${a.observed_at}. Model: ${a.model ?? 'not reported'}.`, '', a.answer || `_No answer: ${a.error}_`, '']),
    r.limitation, '',
  ].join('\n');
}
