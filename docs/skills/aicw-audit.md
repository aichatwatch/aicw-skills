---
title: aicw-audit
description: Audit crawler access, sitemaps, rendering, and load speed.
---

`aicw-audit` checks whether search crawlers can reach and read your site. It covers robots.txt, sitemap indexes, indexing directives, server responses, raw and rendered HTML, and load speed evidence. It follows Checklist 3 of the book [AI Search Engine Optimization Guide](https://aichatwatch.com/books/ai-seo-guide/).

## When to use it

- Crawlers may be blocked.
- A sitemap may be wrong or incomplete.
- Pages may look different in raw HTML and in a browser.

## Example request

> Use aicw-audit against this local preview. Show evidence, priorities, and missing runtime checks. Do not edit website files or the database.

## What the skill does

The skill first finds your intended crawler policy. It keeps intentional exclusions, staging restrictions, and private pages. It then runs the [audit command](/audit-cli) against HTML files, a preview, or a public URL.

Missing evidence is marked unknown or skipped. It is never marked as a pass. A single response time is an observation. The skill does not call it Core Web Vitals.

## What it reads and writes

- It reads site files, a local preview, or a public URL.
- The command writes only the report folder that you name.
- If you ask for a fix, the skill edits the source of the defect: the HTML, a component, a CMS setting, a sitemap generator, or a server configuration.
- It does not request submissions. Use [aicw-submit](/skills/aicw-submit) for that.

For browser checks, you need an installed Chrome browser and the `puppeteer-core` package. See [Audit command line](/audit-cli).
