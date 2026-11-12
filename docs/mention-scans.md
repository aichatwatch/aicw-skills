---
title: Mention scans
description: Check how AI assistants mention and cite your brand, with a quick check first and a broad check next.
---

A mention scan sends the same questions to AI models. It then records which brands and links the answers name. The [aicw-mentions](/skills/aicw-mentions) skill runs the scan for you.

A scan is a sample of answers. It is not a ranking guarantee. Answers from the API differ from answers in the consumer chat apps, because the API has no account history and no personal settings.

## Choose a path

| Path | What you need | What it covers |
| --- | --- | --- |
| Quick check | Claude Code or Codex CLI, signed in, and Node.js 22 or newer | Claude and Codex answers, with web search |
| Broad check | aicw-ai-mentions, Node.js 18 or newer, and your OpenRouter API key | ChatGPT, Claude, Gemini, Grok, and Perplexity models |
| Paste check | Nothing | The AI apps that you choose |

Start with the quick check. Then offer the broad check, with the same questions, so the results are comparable.

Both the quick check and the broad check bill you. The quick check uses your own Claude and ChatGPT accounts. Accounts that pay per use are billed for each answer. OpenRouter bills each answer of the broad check.

## The questions

The agent writes 3 short questions that a customer would ask an AI assistant. The questions leave out your brand name. Then the answers show if AI assistants recommend your brand on their own. An example is "What are the best project management tools for a small team?"

If the site has a saved `questions.txt`, the agent proposes those questions. The agent shows the questions and the plan, then asks you once.

## Quick check

The `ask-local` command sends each question to the installed `claude` and `codex` CLIs. It starts each question in a new empty folder with web search only. It uses no project files, user settings, or MCP servers. It asks one question at a time.

This command runs the quick check for a site.

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" ask-local --online --site brand.tld --brand "Brand Name" --questions "/absolute/path/to/questions.txt"
```

The first time, pass `--questions` with one question on each line. Later, leave out `--questions` to reuse the saved questions.

| Flag | Meaning |
| --- | --- |
| `--online` | Required. It allows the requests. |
| `--site DOMAIN` | The site. Files go in `~/aicw-reports/<domain>/`. |
| `--questions FILE` | The questions, one on each line. The first list is saved as `questions.txt` and is never replaced. |
| `--reports-dir DIR` | Use another folder than `~/aicw-reports`. |
| `--brand NAME` | The brand name to look for. Separate several names with commas. The default is the first part of the site name. |
| `--domain DOMAIN` | The domain to look for in links. Separate several with commas. The default is the site. |
| `--engines LIST` | `claude`, `codex`, or both. |
| `--claude-model MODEL` | A model for Claude. |
| `--codex-model MODEL` | A model for Codex. |
| `--max-budget-usd N` | The cost limit for each Claude answer. The default is 0.5. |
| `--timeout MS` | The time limit in milliseconds. The default is 300000. The minimum is 1000. |
| `--output DIR` | The output folder. Use it with `--questions` and without `--site`. |

Each scan gets a new dated folder, such as `2026-10-14-mentions`. It holds `answers.md` and `answers.json`. The command prints a summary. The summary shows, for each CLI, how many answers named the brand and linked the site. It also shows the most cited sites and the change since the previous scan.

One answer takes about half a minute to a minute. Three questions on both CLIs take about 5 minutes.

If you use Codex, ask it to run the command outside the sandbox. The sandbox blocks the codex CLI, and the command stops with a message. If you decline, run with `--engines claude`. The command supports macOS and Linux. On Windows, use WSL.

## Broad check

The broad check uses the free [aicw-ai-mentions](https://github.com/aichatwatch/aicw-ai-mentions) tool. It sends the questions through OpenRouter. It builds a local HTML report with mention rankings, cited links, link domains, and a CSV export. Reports, logs, and your stored key stay on your computer.

The plugin includes the tool as an MCP server. The server needs Node.js 18 or newer. The agent uses these tools when they exist: `aicw_scan`, `aicw_list_projects`, `aicw_get_project`, `aicw_openrouter_key_status`, and `aicw_set_openrouter_api_key`.

Without MCP tools, the agent can use the command line. This command starts a scan with your questions. Put `\n` between questions.

```sh
npx -y aicw-ai-mentions@latest scan "Subject" --template-text "What are the best tools for X?\nHow does {{SUBJECT}} compare with alternatives?"
```

`{{SUBJECT}}` inserts the subject. It is optional.

### OpenRouter API key

The broad check needs your OpenRouter API key. If you have no key, do these steps:

1. Sign in at [openrouter.ai](https://openrouter.ai).
2. Add credit on the Credits page.
3. Create a key at [openrouter.ai/keys](https://openrouter.ai/keys).

To store the key yourself, run this command. The key stays out of the conversation.

```sh
npx -y aicw-ai-mentions@latest setup-api-key
```

The agent never looks for keys in your files. It does not print or save your key in project files.

## Paste check

If no tool is connected, the agent gives you the questions. Open a new chat in the AI app that you care about, paste one question, and copy the whole answer back, with its links. A temporary chat avoids answers shaped by your chat history.

## Read the results

The agent starts its reply with a summary in plain words. For each AI, it says how many answers named your brand. It lists the other brands and sites that the AI named. It gives up to three next steps. The details come after the summary.

With the command line tool, run this command to find the data folder.

```sh
npx -y aicw-ai-mentions@latest show-user-data-location
```

Reports are in its `reports` folder. To view them in a local browser page, run this command.

```sh
npx -y aicw-ai-mentions@latest serve
```

To compare scans before and after a change, repeat the same questions on the same models. Use [aicw-monitor](/skills/aicw-monitor).
