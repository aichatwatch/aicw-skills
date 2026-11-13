---
title: Troubleshooting
description: Fix common problems with AICW Skills.
---

## The skill does not appear

If the skill is missing from your agent, check its folder. See [Install](/install) for the folder of each agent. Then restart the session.

## A script does not run

If a script fails, run `node --version` in the same environment as your agent. The audit scripts need Node.js 22 or newer. The aicw-ai-mentions server needs Node.js 18 or newer.

If the agent cannot run commands, it reviews the content through its tools. It marks the script checks as not run.

## The browser check fails

If the script cannot find a browser, pass `--browser-executable` and `--browser-module`. See [Audit command line](/audit-cli). Missing packages and blocked resources show as findings.

## The audit finds nothing for my WordPress folder

PHP files and CMS records are not rendered pages. Run a preview or use the public URL.

## The command stops inside Codex

If `ask-local` stops with a message about the sandbox, ask Codex to run the command outside the sandbox. If you decline, use `--engines claude`. See [Mention scans](/mention-scans).

## A scan says that no API keys are set

If a broad check reports this, store your OpenRouter API key. See [Mention scans](/mention-scans#openrouter-api-key).

## ask-local does not work on Windows

The command supports macOS and Linux. On Windows, use WSL.

## A command is blocked by the agent

If your agent blocks a command, follow its normal permission flow. The agent must report the check as not verified. Do not add broad permission bypasses to make a skill run.

## Sign-in expired

If the client reports expired sign-in, renew the login of the client. Do not count an account failure as a test result.

## Report a bug

Open a [GitHub issue](https://github.com/aichatwatch/aicw-skills/issues). For other contact, use the [AI Chat Watch quote page](https://aichatwatch.com/quote).
