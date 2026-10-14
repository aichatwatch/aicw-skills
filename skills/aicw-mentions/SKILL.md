---
name: aicw-mentions
description: Scan how AI assistants mention and cite a brand, product, or website, with the free aicw-ai-mentions tool through OpenRouter or with the local Claude Code and Codex CLIs. Use to collect AI answers, brand mentions, cited links, competitor mentions, and frequently cited sources, or to read existing aicw-ai-mentions reports. Asks for the user's OpenRouter API key before an OpenRouter scan.
license: MIT
compatibility: Needs the aicw-ai-mentions MCP server, or command access with Node.js 18+ and network access. Scans need the user's OpenRouter API key and are billed by OpenRouter. Bundled audit scripts need Node.js 22+.
metadata:
  author: aicw-io
  version: 0.4.0
---

# Scan AI mentions and citations

Book basis: Eugene Mironichev’s [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/). Read [book scope and attribution](references/book.md) before applying recommendations. Use only its optimization principles; label engineering details and current corrections separately. Include the book credit and relevant PDF pages in the final deliverable. When asked about the source or to show the book, provide its title, author, and this clickable link; provide the full PDF link from that reference when requested.

Select the website or brand before a scan. Questions about the book or the skill itself need no target. Use the user’s URL, project, brand, or connected site when the target is clear. Otherwise ask: “Which website or brand should I scan?” Ask only for missing information, not for details already supplied.

Resolve `references/` and `scripts/` from this installed skill folder, not from the website folder. Run the helper by its absolute path; it needs Node.js 22+. Read [mentions](references/mentions.md) before any scan, and [monitoring](references/monitoring.md) for the measurement method. The book basis is Chapter 8 and Checklist 4, pages 77-79.

Two answer sources are available. The OpenRouter scan runs aicw-ai-mentions through its MCP tools, or through `npx -y aicw-ai-mentions@latest` with command access. Local AI CLIs: if `claude` or `codex` is installed, the bundled `ask-local` command asks them the same questions with the user's own account, without an OpenRouter key. Offer the sources that apply and let the user choose. If none is available, explain the setup from [mentions](references/mentions.md#set-up-the-tool) and offer the manual worksheet.

Never start a scan on your own. Before an OpenRouter scan, ask the user for their OpenRouter API key, or confirm a key they already configured. Before any scan, get approval for the subject, questions, number of questions, and answer sources. Do not look for keys in environment files, shell profiles, or other projects, and never invent one. Do not print, repeat, or write the key to project files.

Build questions from real audience tasks, including unbranded questions where the brand should appear. Keep the exact questions and models stable so later scans are comparable.

Read the saved report data, not only the summary. Record the query, model, scan date, whether web search was used, brand mentions, and cited URLs. Keep brand mentions separate from linked citations. Report the competitor and community sources that answers cite most, and the audience questions where the brand is missing.

A scan is a sample of API answers, not a ranking guarantee or a copy of consumer chat results. Do not invent observations. Do not create scheduled jobs, expose the HTTP server, or publish content without an explicit request. Use the `aicw-monitor` skill, or [monitoring](references/monitoring.md), to compare scans before and after a change.

Cover the outcome rows of Checklist 4 in [the review worksheet](references/book-checklist.md) that the scan supports, and mark the rest unassessed.
