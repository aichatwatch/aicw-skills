# Scan AI mentions with aicw-ai-mentions

Book basis: Chapter 8 and Checklist 4, pages 77-79: brand mentions, citations, and frequently cited sources. The scanning tool, its models, and its settings are implementation details, not book requirements.

## What the tool does

[aicw-ai-mentions](https://github.com/aicw-io/aicw-ai-mentions) is a free MIT-licensed tool by the same author. It sends the same questions to several AI models through OpenRouter. It extracts the brands, products, and links in each answer and builds a local HTML report with mention rankings, cited links, link domains, and CSV export. Reports, logs, and the stored key stay on the user's computer.

Each scan sends paid requests that OpenRouter bills to the user's account. A full scan can take several minutes.

## Choose the answer sources

Two sources are available. Offer the ones that apply and let the user choose:

- **OpenRouter scan:** aicw-ai-mentions asks several models through OpenRouter. It needs the user's OpenRouter API key.
- **Local AI CLIs:** if `claude` (Claude Code) or `codex` (Codex CLI) is installed and signed in, the bundled helper asks them the same questions. They use the user's own Claude or ChatGPT account and plan limits. No OpenRouter key is needed. See [ask local AI CLIs](#ask-local-ai-clis).

For the OpenRouter scan, use the first option that is available:

1. **MCP tools.** If tools named `aicw_scan`, `aicw_list_projects`, `aicw_get_project`, `aicw_openrouter_key_status`, and `aicw_set_openrouter_api_key` are available, use them.
2. **Command line.** With command access, Node.js 18+, and network access, run `npx -y aicw-ai-mentions@latest <command>`. The first run downloads the package.
3. **Neither.** Explain the [setup](#set-up-the-tool) for the user's client. Meanwhile, offer the manual worksheet from [monitoring](monitoring.md).

## Ask for the OpenRouter API key

Never start a scan without the user's OpenRouter API key and approval. Do not look for keys in environment files, shell profiles, credential stores, or other projects, and never invent one. Do not print, repeat, or write the key to project files.

- **MCP tools:** call `aicw_openrouter_key_status`. If a key is configured, ask the user to confirm the scan. Otherwise ask for an OpenRouter API key from https://openrouter.ai/keys. When the user gives it, call `aicw_set_openrouter_api_key`. The tool stores the key in an encrypted local file and does not return it.
- **Command line:** ask the user to store the key themselves with `npx -y aicw-ai-mentions@latest setup-api-key`. In Claude Code they can type `! npx -y aicw-ai-mentions@latest setup-api-key`, so the key stays out of the conversation. If the user pastes a key instead, pass it only as the `OPENROUTER_API_KEY` environment variable of the scan command. If a scan reports that no API keys are set, ask again.

## Plan the scan

Agree on these before running:

- **Subject:** the brand, product, person, or category to track. For a website, use the brand name its audience uses.
- **Questions:** real audience tasks such as learning, comparing, buying, or solving a problem. Include unbranded questions where the brand should appear, such as "What are the best tools for X?". Put one question per line. `{{SUBJECT}}` inserts the subject and is optional. Without custom questions, the tool uses its default question template.
- **Size:** `--questions N`, or `questions` in MCP, runs only the first N questions. Each question runs on every model in the preset. State the number of questions before running.

## Run the scan

With MCP tools, call `aicw_scan` with `subject` and, for custom questions, `templateText`. Full scans can exceed a client's default tool timeout.

With the command line, write `\n` between questions inside the quoted text:

```sh
npx -y aicw-ai-mentions@latest scan "Subject" --template-text "What are the best tools for X?\nHow does {{SUBJECT}} compare with alternatives?"
```

## Ask local AI CLIs

Check for the CLIs with `claude --version` and `codex --version`. Before running, tell the user which CLIs were found, the number of questions, and that each answer uses their own account. Get approval.

Write the final question text to a private file outside the website, one question per line. `{{SUBJECT}}` is not replaced here. Then run the bundled helper by its absolute path:

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" ask-local --online --questions "/absolute/private/questions.txt" --brand "Brand Name" --domain brand.tld --output "/absolute/private/reports/answers-1"
```

The helper starts each question in a new empty folder with web search only: no project files, user settings, or MCP servers. It records the model when the CLI reports it, whether web search ran, the cited links, whether a `--brand` name appears, and whether a link points to a `--domain`. Separate several names or domains with commas. `--engines claude` or `--engines codex` selects one CLI. `--max-budget-usd` caps each Claude answer; the default is 0.5. One answer can take a minute or more. Existing output files are not overwritten, so use a new output folder for each run.

In a sandboxed agent such as Codex, the command needs network access. Request it and let the user approve. The helper supports macOS and Linux; on Windows, use WSL. Coding-agent CLIs answer differently from the consumer ChatGPT and Claude apps; record them as separate engines.

## Read the results

- **MCP tools:** call `aicw_list_projects`, then `aicw_get_project` for the scan.
- **Local AI CLIs:** read `answers.json` in the output folder. `answers.md` has a summary table and the full answers.
- **Command line:** `npx -y aicw-ai-mentions@latest show-user-data-location` prints the data folder. Reports are in its `reports/` folder. `npx -y aicw-ai-mentions@latest serve` shows the reports in a local browser page.

Inspect the actual files and fields before analysis. For each answer, record: query, engine (the model ID), observed_at (scan date), brand_mentioned, cited_urls, and evidence_path (the report file). Keep brand mentions and citations separate. For Checklist 4, list the competitor and community sources the answers cite most.

## Limits

API answers differ from consumer chat apps. They have no account history or personalization, and web search depends on the model. Record the model and whether it searched the web. A scan is a sample of answers, not a ranking guarantee. For before and after comparisons, repeat the same questions on the same models and follow [monitoring](monitoring.md).

## Set up the tool

The aicw-skills plugin for Claude Code and Codex includes the MCP server. Other setups:

- **Claude Code:** `claude mcp add --transport stdio aicw-ai-mentions -- npx -y aicw-ai-mentions@latest mcp`
- **Codex:** `codex mcp add aicw-ai-mentions -- npx -y aicw-ai-mentions@latest mcp`
- **Claude Desktop and other local MCP clients:** add a stdio server with the command `npx` and the arguments `-y`, `aicw-ai-mentions@latest`, and `mcp`.
- **ChatGPT and Claude on the web:** these need a public HTTPS address. Run `npx -y aicw-ai-mentions@latest mcp --http --port 8787 --path /mcp-<long-random-text>`, expose port 8787 with a tunnel you trust, and add the full `https://` address, including the path, as a custom connector. The server has no login. Anyone with the address can run paid scans with the stored key, so keep the address private and stop the server after use.
