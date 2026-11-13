---
title: Audit command line
description: Run the bundled audit script yourself, with every command and flag.
---

Each skill has the script `scripts/audit.mjs`. The agent runs it for you. You can also run it in a terminal. The script needs Node.js 22 or newer. It needs no package install, API key, MCP server, or internet connection for the core commands.

Find the path of the script in the installed skill folder. Pass your website as `--root`, separate from the skill folder. Quote paths that contain spaces.

## Commands

| Command | What it does |
| --- | --- |
| `audit` | Inspects a site from files or a URL and writes a report. |
| `compare` | Compares two `audit.json` reports. |
| `prepare-submission` | Creates IndexNow files. It sends nothing. |
| `presence` | Checks one recent Common Crawl index. |
| `ask-local` | Asks the local Claude Code and Codex CLIs your questions. |

The audit never edits your site sources. Without `--output`, the `audit` command prints JSON to the terminal.

## audit

This command audits local files and writes the report to a folder.

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" audit --root "/absolute/path/to/website" --public-origin https://your-real-domain.tld --output "$HOME/aicw-reports/your-real-domain.tld/2026-10-01-audit"
```

Replace the example domain and the paths with your own values. `--public-origin` only sets the URL identity. It does not allow network access.

| Flag | Meaning |
| --- | --- |
| `--root DIR` | The website folder. |
| `--html-root DIR` | The folder with built HTML, for example `dist`. If you omit it, the script checks common output folders. |
| `--url URL` | A URL to fetch. Use a loopback or private-network preview, or a public URL with `--online`. |
| `--public-origin URL` | The public origin of the site. It maps URLs. It does not enable requests. |
| `--pages LIST` | A comma-separated list of routes, such as `/,/pricing/`. Link-based page expansion stops. Sitemap checks still run. |
| `--max-pages N` | The page limit. The default is 200. |
| `--output DIR` | The report folder. |
| `--online` | Allows requests to a public site. Use it only when you want a public audit. |
| `--browser` | Compares raw HTML with browser output. |
| `--browser-module DIR` | A folder that contains `node_modules/puppeteer-core`. |
| `--browser-executable FILE` | The path of the Chrome program. |
| `--timeout MS` | The request timeout in milliseconds. The default is 10000. Each request has one retry. |
| `--fail-on-error` | Exit with code 1 if the audit finds an error finding. |

Build the project first if its output is missing or stale. Read the selected root in the report before you read the findings.

### Audit a public site

If you want a public audit, pass `--online`. No `--root` is needed.

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" audit --url https://your-real-domain.tld --online --output "$HOME/aicw-reports/your-real-domain.tld/2026-10-14-audit"
```

The script uses plain HTTP requests. It does not use a CMS login.

### Audit a local preview

This command audits a preview that runs on your computer.

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" audit --root "/absolute/path/to/website" --url http://127.0.0.1:4321 --public-origin https://your-real-domain.tld --pages "/,/pricing/" --output "$HOME/aicw-reports/your-real-domain.tld/2026-10-14-preview"
```

### Limits

- The default limit is 200 fetch attempts or file reads.
- If the sitemap lists more pages than the limit, the script takes pages from each sitemap section in turn.
- Sitemap traversal stops after 30 documents.
- Each response has a 5 MB limit.
- Redirects and crawl links stay on the selected origin.

These limits mean that a report does not prove full coverage of the site.

### Browser checks

Browser checks are optional. First install `puppeteer-core` into a separate folder. This step needs network access.

```sh
npm install --prefix "/absolute/path/to/browser-runtime" puppeteer-core
```

Then run the audit with `--browser`. The script uses a temporary browser profile and blocks other origins.

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" audit --url http://127.0.0.1:4321 --browser --browser-module "/absolute/path/to/browser-runtime" --browser-executable "/absolute/path/to/chrome" --output "$HOME/aicw-reports/your-real-domain.tld/2026-10-14-browser"
```

## compare

This command compares two reports. Use it before and after a change.

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" compare --before "$HOME/aicw-reports/your-real-domain.tld/2026-10-01-audit/audit.json" --after "$HOME/aicw-reports/your-real-domain.tld/2026-10-14-audit/audit.json"
```

## prepare-submission

This command prepares IndexNow files for changed URLs. First write a text file with one changed public URL on each line.

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" prepare-submission --origin https://your-real-domain.tld --urls "/absolute/private/changed-urls.txt" --sitemap https://your-real-domain.tld/sitemap.xml --output "/absolute/private/submission"
```

| Flag | Meaning |
| --- | --- |
| `--origin URL` | The public origin of the site. |
| `--urls FILE` | The text file with the changed URLs. |
| `--sitemap URL` | The sitemap address. If you omit it, the record leaves it unset. |
| `--key KEY` | An existing IndexNow key to reuse. |
| `--output DIR` | The folder for the files. |

The output has a verification text file, `indexnow.json`, and `submission.json`. The script does not overwrite files. There is no submit command. Follow the manual steps in [aicw-submit](/skills/aicw-submit).

## presence

This command checks one recent Common Crawl index for your site. It needs `--online`. It does not query Google, Bing, or AI chats.

```sh
node "/absolute/path/to/installed-skill/scripts/audit.mjs" presence --origin https://your-real-domain.tld --online
```

A missing result describes only that one observation.

## ask-local

This command asks the local `claude` and `codex` CLIs your questions. See [Mention scans](/mention-scans) for the flags and limits.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | The command finished. An audit returns 0 also when it finds defects. |
| 1 | The audit found an error finding, and you used `--fail-on-error`. |
| 2 | The command or its setup failed. |

Review, unknown, and skipped states stay in the JSON. Do not treat them as passes.
