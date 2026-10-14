# AICW Skills

Seven skills to help your AI agent audit and improve your website for AI search, and to check how AI assistants mention it.
Based on the [AI Search Engine Optimization Guide](https://aicw.io/books/ai-seo-guide/) by Eugene Mironichev.

Use local files, a public URL, or a CMS connector available to your agent. Editing requires access to the site. Bundled audit scripts need Node.js 22+. Mention scans use the free [aicw-ai-mentions](https://github.com/aicw-io/aicw-ai-mentions) tool with your own OpenRouter API key, or your local Claude Code and Codex CLIs.

## Install

**Claude Code:** install the plugin. It adds all seven skills and the aicw-ai-mentions MCP server.

```sh
/plugin install aicw-skills --marketplace aicw-io/aicw-skills
```

On Claude Code versions before 2.1.275, run `/plugin marketplace add aicw-io/aicw-skills`, then `/plugin install aicw-skills@aicw-io`.

**Codex and the ChatGPT desktop app:** add the marketplace, then install `aicw-skills` from the Plugins Directory, or run `codex plugin add aicw-skills@aicw-io`.

```sh
codex plugin marketplace add aicw-io/aicw-skills
```

**Any agent with skill folders** (Cursor, Copilot, Gemini CLI, and others): run this in your terminal and choose the skills, agent, and location.

```sh
npx skills add aicw-io/aicw-skills
```

For ChatGPT and Claude on the web, see [agent setup](docs/compatibility.md).

Open a new agent session and ask:

> Use aicw-optimize to audit my website for AI search. Show the findings and proposed fixes before editing.

> Use aicw-mentions to check how AI assistants mention my brand.

Give the agent your website URL, project folder, or connected site. It asks when the target is unclear. For a mention scan, the agent writes 3 questions your customers might ask and checks with you once before it runs them. The quick check uses your local Claude Code and Codex and takes about a minute. The broader check covers ChatGPT, Claude, Gemini, Grok, and Perplexity models and needs your OpenRouter API key. Without either, the agent gives you the questions to paste into any AI app.

## Included skills

- `aicw-optimize`: Audit content, JSON-LD, and technical access, apply relevant fixes, and verify them against the book’s checklists.
- `aicw-content`: Match content to reader intent, fill missing answers, and improve headings, factual support, FAQs, and next steps.
- `aicw-jsonld`: Check JSON-LD syntax, entity links, and consistency with visible content, then validate repairs.
- `aicw-audit`: Inspect robots.txt, sitemaps, indexing directives, server responses, rendering, and load speed for crawler access problems.
- `aicw-mentions`: Ask AI models your audience's questions, and report which brands they mention and which links they cite. Writes the questions for you and asks once. Starts with a quick check through your local Claude Code and Codex, with no key needed. Then it offers a broader check with the free aicw-ai-mentions tool and your OpenRouter API key.
- `aicw-monitor`: Track brand mentions, citations, indexing, referral traffic, and conversions. Compare available reports and search observations before and after changes.
- `aicw-submit`: Guide manual Google, Bing/IndexNow, and Brave submissions, including sitemap URLs, ownership verification, and submission records.

The skills follow the book's [25 checklist items](resources/book-checklist.md). Each skill and audit report credits the book.

[Usage examples](docs/book-companion.md) · [Agent setup](docs/compatibility.md) · [Mention scans](resources/mentions.md) · [Audit commands](resources/tools.md) · [Development and testing](docs/releasing.md)

Code: [MIT](LICENSE). See [attribution](NOTICE.md). The book retains its original copyright.
