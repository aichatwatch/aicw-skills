# Agent compatibility

The seven skills use the [Agent Skills format](https://agentskills.io/specification). Use the agent’s available file, web, or CMS connector access for the selected website. Bundled scripts require command execution and Node.js 22+. Browser comparisons need a browser runtime. No particular framework or connector is required for content review. State which checks the available access cannot support.

## Install for your agent

Use the README’s installer and choose project or personal installation. Project installation works in a local workspace even when the website itself is remote.

Copy any complete `skills/aicw-*` folder into your client's skill directory, or use the installer from the README. Keep the scripts, references, and license files together. Install one skill or all seven; each works independently.

| Client | Project skill directory | How to start |
| --- | --- | --- |
| Claude Code | `.claude/skills/` | `/aicw-jsonld Audit my selected website` |
| Codex | `.agents/skills/` | `$aicw-jsonld Audit my selected website` |
| Cursor | `.agents/skills/` or `.cursor/skills/` | Ask to use `aicw-jsonld` |
| GitHub Copilot | `.github/skills/` or `.agents/skills/` | Ask to use `aicw-jsonld` in an agent client |
| Gemini CLI | `.gemini/skills/` or `.agents/skills/` | Ask to use `aicw-jsonld` |

These locations come from the official documentation for [Claude Code](https://code.claude.com/docs/en/skills), [Codex](https://learn.chatgpt.com/docs/build-skills), [Cursor](https://cursor.com/docs/skills), [Copilot](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills), and [Gemini CLI](https://geminicli.com/docs/cli/skills/), checked on 2026-10-09. Local skill installation is distinct from cloud synchronization or marketplace installation. The audit scripts do not require a plugin, MCP server, API key, or a specific agent vendor. Only `aicw-mentions` scans need the aicw-ai-mentions tool and the user's OpenRouter API key.

For Claude Code, copying `skills/aicw-jsonld` produces `.claude/skills/aicw-jsonld/SKILL.md` in the website project. Start a fresh session and invoke `/aicw-jsonld`. For Codex the corresponding file is `.agents/skills/aicw-jsonld/SKILL.md`. The optional `agents/openai.yaml` supplies OpenAI UI metadata; all working instructions remain in the portable files.

## Plugins and mention scans

The repository is also a plugin for Claude Code, Codex, and the ChatGPT desktop app. The plugin installs all seven skills and the [aicw-ai-mentions](https://github.com/aichatwatch/aicw-ai-mentions) MCP server, which `aicw-mentions` uses to scan AI answers. The server starts with `npx -y aicw-ai-mentions@latest mcp` and needs Node.js 18+. It asks for no key at startup; the skill asks for the user's OpenRouter API key before the first scan and stores it with the server's encrypted key tool.

| Client | Install | Mention scans |
| --- | --- | --- |
| Claude Code | `/plugin install aicw-skills --marketplace aichatwatch/aicw-skills` | Included MCP server |
| Codex CLI and ChatGPT desktop app | `codex plugin marketplace add aichatwatch/aicw-skills`, then install `aicw-skills` from the Plugins Directory or with `codex plugin add aicw-skills@aicw-io` | Included MCP server |
| Claude Desktop | Upload skill folders as ZIP files where your plan supports skills | Add a local MCP server: command `npx`, arguments `-y`, `aicw-ai-mentions@latest`, `mcp` |
| Claude and ChatGPT on the web | Upload skill folders as ZIP files where your plan supports skills | Remote connector over HTTPS (see below) |
| Other skill clients | `npx skills add aichatwatch/aicw-skills` | Command line: `npx -y aicw-ai-mentions@latest` |

To make a ZIP file for upload, compress one complete skill folder, for example `skills/aicw-mentions`, with its `references`, `scripts`, and license files.

Web clients cannot start a local server. Run the server in HTTP mode with a long random path, expose it through a tunnel you trust, and add the full `https://` address as a custom connector:

```sh
npx -y aicw-ai-mentions@latest mcp --http --port 8787 --path /mcp-<long-random-text>
```

The HTTP server has no login. Anyone with the address can run paid scans with the stored key. Keep the address private and stop the server after use. Web skill sandboxes may block network access, so mention scans there depend on the connector.

Plugin manifests: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, and `.mcp.json` for Claude Code; `plugin.json`, `mcp.json`, and `.agents/plugins/marketplace.json` in the [Agent Plugins format](https://agent-plugins.org/) for Codex and ChatGPT. Their versions match `package.json`.

## Updating from version 0.1

Version 0.2 uses shorter names. Run the installer again and select the skills you need. Use `npx skills remove` to remove old installations you no longer need.

| Previous name | Current name |
| --- | --- |
| `aicw-website-optimize` | `aicw-optimize` |
| `aicw-content-intent` | `aicw-content` |
| `aicw-technical-audit` | `aicw-audit` |
| `aicw-search-monitoring` | `aicw-monitor` |
| `aicw-search-submission` | `aicw-submit` |

`aicw-jsonld` keeps its name. Each skill still works independently.

## Claude Code static review

Reviewed against the official documentation on 2026-10-09, without executing Claude Code. The six skills use supported frontmatter fields: `name`, `description`, `license`, `compatibility`, and `metadata`. Runtime requirements also appear in the instructions because Claude accepts `compatibility` without enforcing it. They require no Claude-specific variables, hooks, inline shell expansion, model override, or tool permission grants. See the [frontmatter reference](https://code.claude.com/docs/en/skills#frontmatter-reference).

The optional evaluation runner uses `CLAUDE.md` for its disposable Claude project. Direct `AGENTS.md` loading depends on the Claude version and project configuration, so it is not assumed. Installing a skill does not require adding either instruction file to the user's website. See [Claude's instruction-file rules](https://code.claude.com/docs/en/memory#agentsmd).

Review the exact test arguments without starting a client:

```sh
npm run test:agents -- --agent claude --case audit,repair --dry-run
```

The [CLI reference](https://code.claude.com/docs/en/cli-reference) supports the runner's print mode, verbose JSON stream, temporary session, project settings selection, empty strict MCP configuration, and disabled Chrome integration. It preserves the normal system prompt and skill discovery. `--bare`, `--safe-mode`, and `--disable-slash-commands` would interfere with discovery and are deliberately absent.

The runner's `--tools` limits available tools; `--allowedTools` pre-approves the named tools. `dontAsk` denies calls that still require approval. These are test settings, not installation requirements or an operating-system sandbox. A Node permission can run arbitrary JavaScript. The runner uses synthetic files and is opt-in; managed policy and account configuration can still affect it. See [permission behavior](https://code.claude.com/docs/en/permissions). Its live Claude mode currently targets Bash on macOS, Linux, or WSL; native Windows users can inspect its dry run and use the installed skills normally with their available command tool.

Static review, standard-format validation, and successful standalone scripts do not establish live Claude behavior. No successful Claude session is claimed.

## What is verified

See [validation](validation.md) for exact versions and recorded results. Standalone scripts are tested separately from agent behavior. A documented installation path does not establish that a client has completed our behavioral tests. Cursor, Copilot, and Gemini CLI remain unverified until their actual sessions are exercised.

A client with web or connector tools can review accessible content without local files. Editing depends on its actual write capabilities. The skills include no CMS connector; each third-party connector needs its own setup and permissions. Connector instructions received a static review only, not live integration testing. The standalone scripts and format checks passed hosted CI on Linux, macOS, and Windows with Node.js 22 and 24. These platform checks are separate from live agent behavior; see the recorded run in [validation](validation.md).

## Common setup problems

Run `node --version` in the same environment as your agent. For bundled scripts, Node.js 22+ must be on its command path. Browser checks can use `--browser-executable` and `--browser-module` when automatic detection is insufficient. A WordPress source checkout needs a running preview or public URL for output checks; PHP files and CMS records alone are not rendered pages.

The helper lives inside the installed skill folder. Resolve that folder first and run the helper by absolute path, with a separate `--root` for the website. Do not search for the helper inside the website source. Paths with spaces must be quoted.

Command examples use single lines to avoid incompatible shell continuation syntax. On Windows, substitute native paths and use `curl.exe` for the optional manual IndexNow request. If the client blocks a command, report the check as unverified and follow its normal permission flow. Do not add broad permission bypasses to make a skill run.

If the skill is missing from your client's skill list, check its installation directory and restart the session. If the client reports expired authentication, renew the client's login before testing the skill. Do not interpret an account failure as a successful compatibility test.
