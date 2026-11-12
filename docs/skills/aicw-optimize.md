---
title: aicw-optimize
description: Audit and improve a whole website for AI search.
---

`aicw-optimize` is the skill for a whole-site review. It covers content intent, JSON-LD, crawler access, rendering, and measurement. It contains all references and the audit script, so it works alone.

The skill follows the four checklists of the book [AI Search Engine Optimization Guide](https://aichatwatch.com/books/ai-seo-guide/). Its final report credits the book and the relevant PDF pages.

## When to use it

- You want to audit a whole site.
- You want fixes as well as findings.
- You do not know which area has the problem.

## Example request

> Use aicw-optimize to audit my website for AI search. Show the findings and proposed fixes before editing.

## What the skill does

1. It finds the site, your access, and your audience.
2. It collects evidence with the audit command, when command access exists.
3. It reads the real page text and the real JSON-LD blocks.
4. It proposes fixes that match the evidence and your priorities.
5. If you ask for fixes, it edits the site source or CMS. It then builds or refreshes the site and repeats the affected checks.
6. It fills in the book checklist worksheet and marks items that it did not assess.

## What it reads and writes

- It reads the site files, the public URL, or the CMS content that your agent can reach.
- It writes audit reports outside your site source and public folders.
- It edits site files only when you ask for edits.
- An audit does not authorize external submissions.

If Node.js 22 or newer is missing, the skill reviews page content through the agent tools. It marks the script checks as not run.

See also [aicw-content](/skills/aicw-content), [aicw-jsonld](/skills/aicw-jsonld), and [aicw-audit](/skills/aicw-audit).
