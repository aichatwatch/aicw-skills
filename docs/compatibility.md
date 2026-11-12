---
title: Compatibility
description: Which agents work with AICW Skills, where skill folders go, and how to use the skills in web clients.
---

The seven skills use the [Agent Skills format](https://agentskills.io/specification). The agent needs file, web, or CMS connector access to your site. The bundled scripts need command access and Node.js 22 or newer. Browser comparisons need a browser. Content review needs no special framework or connector.

If the agent cannot run a check, it must say so in its report.

## Install for your agent

Use the installer or the plugin from the [Install](/install) page. A project install works in a local workspace, also when the site itself is remote.

You can also copy one complete `skills/aicw-*` folder into the skill folder of your agent. Keep the scripts, references, and license files together. Each skill works alone.

| Agent | Project skill folder | How to start |
| --- | --- | --- |
| Claude Code | `.claude/skills/` | `/aicw-jsonld Audit my selected website` |
| Codex | `.agents/skills/` | `$aicw-jsonld Audit my selected website` |
| Cursor | `.agents/skills/` or `.cursor/skills/` | Ask to use `aicw-jsonld` |
| GitHub Copilot | `.github/skills/` or `.agents/skills/` | Ask to use `aicw-jsonld` in an agent client |
| Gemini CLI | `.gemini/skills/` or `.agents/skills/` | Ask to use `aicw-jsonld` |

These folders come from the documentation of [Claude Code](https://code.claude.com/docs/en/skills), [Codex](https://learn.chatgpt.com/docs/build-skills), [Cursor](https://cursor.com/docs/skills), [Copilot](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills), and [Gemini CLI](https://geminicli.com/docs/cli/skills/). The maintainers checked them on 2026-10-09.

For Claude Code, the file `skills/aicw-jsonld` becomes `.claude/skills/aicw-jsonld/SKILL.md` in your website project. Start a new session and run `/aicw-jsonld`.

The audit scripts need no plugin, no MCP server, no API key, and no specific agent vendor. Only mention scans through the aicw-ai-mentions tool need an OpenRouter API key.

## Plugins and mention scans

The repository is also a plugin for Claude Code, Codex, and the ChatGPT desktop app. The plugin installs all seven skills and the [aicw-ai-mentions](https://github.com/aichatwatch/aicw-ai-mentions) MCP server. The server needs Node.js 18 or newer. The skill asks for your OpenRouter API key before the first scan.

| Client | Install | Mention scans |
| --- | --- | --- |
| Claude Code | `/plugin install aicw-skills --marketplace aichatwatch/aicw-skills` | Included MCP server |
| Codex CLI and ChatGPT desktop app | `codex plugin marketplace add aichatwatch/aicw-skills`, then install `aicw-skills` from the Plugins Directory | Included MCP server |
| Claude Desktop | Upload skill folders as ZIP files, where your plan supports skills | Add a local MCP server with the command `npx` and the arguments `-y`, `aicw-ai-mentions@latest`, `mcp` |
| Claude and ChatGPT on the web | Upload skill folders as ZIP files, where your plan supports skills | Remote connector over HTTPS |
| Other skill clients | `npx skills add aichatwatch/aicw-skills` | Command line: `npx -y aicw-ai-mentions@latest` |

To make a ZIP file, compress one complete skill folder. Include its `references`, `scripts`, and license files.

## Web clients

A web client cannot start a local server. Instead, run the server in HTTP mode with a long random path. The command below starts the server on port 8787.

```sh
npx -y aicw-ai-mentions@latest mcp --http --port 8787 --path /mcp-<long-random-text>
```

Expose the server through a tunnel that you trust. Then add the full `https://` address as a custom connector.

**Warning:** The HTTP server has no login. Anyone with the address can run paid scans with your stored key. Keep the address private. Stop the server after use.

Web skill sandboxes may block network access. Then mention scans depend on the connector.

## Update from version 0.1

Version 0.2 uses shorter names. Run the installer again and select the skills you need. Use `npx skills remove` to remove old installations.

| Old name | Current name |
| --- | --- |
| `aicw-website-optimize` | `aicw-optimize` |
| `aicw-content-intent` | `aicw-content` |
| `aicw-technical-audit` | `aicw-audit` |
| `aicw-search-monitoring` | `aicw-monitor` |
| `aicw-search-submission` | `aicw-submit` |

The name `aicw-jsonld` did not change.

## What the maintainers tested

The maintainers ran the standalone scripts and format checks in CI on Linux, macOS, and Windows with Node.js 22 and 24. They also tested the Claude Code and Codex plugin installs in isolated setups. They did not test Cursor, Copilot, and Gemini CLI in live sessions. A documented install path does not prove that a client passed behavior tests. See the [validation record](https://github.com/aichatwatch/aicw-skills/blob/main/maintainers/validation.md).

A client with web or connector tools can review public content without local files. Editing depends on the write tools of that client. The skills include no CMS connector. Each third-party connector needs its own setup.

## Common setup problems

- If a script does not run, check `node --version` in the same environment as your agent. Node.js 22 or newer must be on the command path.
- If browser detection fails, pass `--browser-executable` and `--browser-module`. See [Audit command line](/audit-cli).
- If you audit a WordPress source folder, run a preview or use the public URL. PHP files and CMS records are not rendered pages.
- If a command blocks, the agent must report the check as not verified and use its normal permission flow. Do not add broad permission bypasses to make a skill run.
- If a skill is missing from the list, check its folder and restart the session.
- If the client reports expired sign-in, renew the login of the client first.

On Windows, use native paths and `curl.exe` for the optional manual IndexNow request. The `ask-local` command supports macOS and Linux. On Windows, use WSL.
