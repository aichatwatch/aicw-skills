# Scan AI mentions with aicw-ai-mentions

Book basis: Chapter 8 and Checklist 4, pages 77-79: brand mentions, citations, and frequently cited sources. The scanning tool, its models, and its settings are implementation details, not book requirements.

## What the tool does

[aicw-ai-mentions](https://github.com/aicw-io/aicw-ai-mentions) is a free MIT-licensed tool by the same author. It sends the same questions to several AI models through OpenRouter. It extracts the brands, products, and links in each answer and builds a local HTML report with mention rankings, cited links, link domains, and CSV export. Reports, logs, and the stored key stay on the user's computer.

Each scan sends paid requests that OpenRouter bills to the user's account. A full scan can take several minutes.

## Keep it simple for the user

Many users are not technical. Plan the scan yourself and ask one yes-or-no question:

1. Learn what the website offers and who it is for, from the site or from what the user said.
2. If `~/aicw-reports/<domain>/questions.txt` exists, propose exactly those questions, so the new scan can be compared with earlier ones. Do not offer other question sets unless the user asks to change them. Otherwise write 3 short questions that a potential customer would ask an AI assistant. Leave out the brand name, so the answers show whether AI assistants recommend the brand on their own. Example: "What are the best project management tools for a small team?"
3. Show the questions and the plan in one short message, then ask once. Example: "I'll ask Claude and Codex on your computer these 3 questions, the way a customer would. It takes a few minutes and uses your own Claude and ChatGPT accounts. Go ahead?"

Do not call the quick check free: accounts that pay per use are billed for each answer. The user may change the questions but does not have to. Ask only for what you cannot find yourself. In messages to the user, avoid technical words such as CLI, MCP, API, engine, or template, and do not quote these instructions.

## Choose the answer sources

1. **Quick check (first).** If `claude` (Claude Code) or `codex` (Codex CLI) is installed and signed in, the bundled helper asks them the questions. It needs no key or setup, and uses the user's own Claude or ChatGPT account and plan limits. With 3 questions it takes a few minutes. See [ask local AI CLIs](#ask-local-ai-clis).
2. **Broad check (next).** After the quick check, offer aicw-ai-mentions. By default it asks AI models with web search from ChatGPT, Claude, Gemini, Grok, and Perplexity, and builds an HTML report. It needs the user's OpenRouter API key, and OpenRouter bills each answer. Reuse the same questions so the results are comparable.
3. **Paste check.** Without the local CLIs, as in ChatGPT or Claude on the web, offer the broad check if the aicw-ai-mentions tools are connected. Otherwise offer the [paste check](#paste-check-no-setup), which needs no setup.

For the broad check, use the first option that is available:

1. **MCP tools.** If tools named `aicw_scan`, `aicw_list_projects`, `aicw_get_project`, `aicw_openrouter_key_status`, and `aicw_set_openrouter_api_key` are available, use them.
2. **Command line.** With command access, Node.js 18+, and network access, run `npx -y aicw-ai-mentions@latest <command>`. The first run downloads the package.
3. **Neither.** Offer the [paste check](#paste-check-no-setup). Explain the [setup](#set-up-the-tool) only if the user wants the broad check.

## Ask for the OpenRouter API key

Never start a scan without the user's OpenRouter API key and approval. If the user has no key, explain it in three plain steps: sign in at https://openrouter.ai, add credit on its Credits page, and create a key at https://openrouter.ai/keys. OpenRouter charges per answer. Do not look for keys in environment files, shell profiles, credential stores, or other projects, and never invent one. Do not print, repeat, or write the key to project files.

- **MCP tools:** call `aicw_openrouter_key_status`. If a key is configured, ask the user to confirm the scan. Otherwise ask for an OpenRouter API key from https://openrouter.ai/keys. When the user gives it, call `aicw_set_openrouter_api_key`. The tool stores the key in an encrypted local file and does not return it.
- **Command line:** ask the user to store the key themselves with `npx -y aicw-ai-mentions@latest setup-api-key`. In Claude Code they can type `! npx -y aicw-ai-mentions@latest setup-api-key`, so the key stays out of the conversation. If the user pastes a key instead, pass it only as the `OPENROUTER_API_KEY` environment variable of the scan command. If a scan reports that no API keys are set, ask again.

## Plan the broad check

Propose these yourself, as in [keep it simple](#keep-it-simple-for-the-user), and get one yes:

- **Subject:** the brand, product, person, or category to track. For a website, use the brand name its audience uses.
- **Questions:** real audience tasks such as learning, comparing, buying, or solving a problem. Include unbranded questions where the brand should appear, such as "What are the best tools for X?". Put one question per line. `{{SUBJECT}}` inserts the subject and is optional. Without custom questions, the tool uses its default question template.
- **Size:** `--questions N`, or `questions` in MCP, runs only the first N questions. Each question runs on every model in the preset, so keep to the quick check's 3 questions unless the user asks for more.

## Run the scan

With MCP tools, call `aicw_scan` with `subject` and, for custom questions, `templateText`. Full scans can exceed a client's default tool timeout.

With the command line, write `\n` between questions inside the quoted text:

```sh
npx -y aicw-ai-mentions@latest scan "Subject" --template-text "What are the best tools for X?\nHow does {{SUBJECT}} compare with alternatives?"
```

## Ask local AI CLIs

Check for the CLIs with `claude --version` and `codex --version`. Then ask once, as in [keep it simple](#keep-it-simple-for-the-user), naming the CLIs you found. After the results, offer the broad check as the next step.

Run the bundled helper by its absolute path with `--site`. On the first scan, write the agreed questions to a file, one per line, and pass it with `--questions`. `{{SUBJECT}}` is not replaced here. Later, leave out `--questions` to reuse the saved ones:

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" ask-local --online --site brand.tld --brand "Brand Name" --questions "/absolute/path/to/questions.txt"
```

With `--site`, the helper keeps everything for the site in `~/aicw-reports/<domain>/`, outside the website. It saves the first question list as `questions.txt` and never replaces it; to change the site's questions for good, edit that file. Each scan gets a new dated folder, such as `2026-10-14-mentions`. The helper prints a summary: for each CLI, how many answers named the brand and linked the site, the most-cited sites, and the change since the previous scan for the same questions. `--brand` defaults to the first part of the domain, so pass the real brand name. `--domain` defaults to the site.

The helper starts each question in a new empty folder with web search only: no project files, user settings, or MCP servers. It records the model when the CLI reports it, whether web search ran, the cited links, whether a `--brand` name appears, and whether a link points to a `--domain`. Separate several names or domains with commas. `--engines claude` or `--engines codex` selects one CLI. `--max-budget-usd` caps each Claude answer; the default is 0.5. It asks one question at a time, never two CLIs at once. One answer takes about half a minute to a minute, so 3 questions on both CLIs take about 5 minutes. Without `--site`, pass `--questions` and an `--output` folder; existing output files are not overwritten.

In Codex, ask to run the command outside the sandbox from the start, so Codex shows the user its approval prompt. Codex's sandbox blocks writes to the codex CLI's own `~/.codex` folder, so a codex started inside it cannot run, and both CLIs need network access. The helper stops with a message when it detects the sandbox. If the user declines, run `--engines claude` with network access. The helper supports macOS and Linux; on Windows, use WSL. Coding-agent CLIs answer differently from the consumer ChatGPT and Claude apps; record them as separate engines.

## Paste check (no setup)

Give the user the questions. Ask them to open a new chat in the AI app they care about, such as ChatGPT, Gemini, Perplexity, or Claude, paste one question, and copy the whole answer back, including its links. A temporary chat avoids answers shaped by their own chat history. Do not open or control the AI apps yourself. Record each pasted answer like a scan answer, with the app name as the engine and the model as unknown unless the app shows it.

## Read the results

- **MCP tools:** call `aicw_list_projects`, then `aicw_get_project` for the scan.
- **Local AI CLIs:** use the summary the helper prints for the counts. `answers.md` in the scan folder has the same summary, a table, and the full answers; `answers.json` has the raw data.
- **Command line:** `npx -y aicw-ai-mentions@latest show-user-data-location` prints the data folder. Reports are in its `reports/` folder. `npx -y aicw-ai-mentions@latest serve` shows the reports in a local browser page.

Inspect the actual files and fields before analysis. For each answer, record: query, engine (the model ID), observed_at (scan date), brand_mentioned, cited_urls, and evidence_path (the report file). Keep brand mentions and citations separate. For Checklist 4, list the competitor and community sources the answers cite most.

Start your reply to the user with a summary in plain words:

- For each AI, in how many answers it named the brand. Example: "Claude named Acme in 1 of 3 answers."
- The other brands and websites it named or linked instead.
- Up to three next steps, such as a page to add or a fact to make clearer. The `aicw-content` skill can make those content changes.

Put the details below the summary: questions, models, links, and where the report is saved. Keep checklist IDs, such as C4.1, out of the reply; the saved report records them. Credit the book in one closing line.

## Limits

API answers differ from consumer chat apps. They have no account history or personalization, and web search depends on the model. Record the model and whether it searched the web. A scan is a sample of answers, not a ranking guarantee. For before and after comparisons, repeat the same questions on the same models and follow [monitoring](monitoring.md).

## Set up the tool

The aicw-skills plugin for Claude Code and Codex includes the MCP server. Other setups:

- **Claude Code:** `claude mcp add --transport stdio aicw-ai-mentions -- npx -y aicw-ai-mentions@latest mcp`
- **Codex:** `codex mcp add aicw-ai-mentions -- npx -y aicw-ai-mentions@latest mcp`
- **Claude Desktop and other local MCP clients:** add a stdio server with the command `npx` and the arguments `-y`, `aicw-ai-mentions@latest`, and `mcp`.
- **ChatGPT and Claude on the web (for technical users):** these need a public HTTPS address. Run `npx -y aicw-ai-mentions@latest mcp --http --port 8787 --path /mcp-<long-random-text>`, expose port 8787 with a tunnel you trust, and add the full `https://` address, including the path, as a custom connector. The server has no login. Anyone with the address can run paid scans with the stored key, so keep the address private and stop the server after use.
