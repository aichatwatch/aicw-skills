---
title: aicw-content
description: Match page text to the reader's task and fill missing answers.
---

`aicw-content` checks whether a page answers what its reader needs to do. It looks at titles, headings, examples, FAQs, and next steps. It follows Chapter 3 and Chapter 6 and Checklist 1 of the book [AI Search Engine Optimization Guide](https://aichatwatch.com/books/ai-seo-guide/).

## When to use it

- A page has unanswered questions.
- A page covers its task weakly.
- You want better headings, evidence, or FAQs.

## Example request

> Use aicw-content on the pricing page of my website. Read the current page and propose answers to missing reader questions.

## What the skill does

For each page, the skill writes an intent brief. The brief names the audience, the main task, the supporting questions, and quoted evidence. It marks each question as answered, partly answered, absent, or outside the page's purpose.

If you ask for edits, the skill fills useful gaps in the source of the page. It keeps supported claims, language, voice, and links. It does not use keyword density or word count as proof that a page works.

## What it reads and writes

- It reads page text, headings, and metadata through the access that you give.
- It can use the audit command to extract HTML. This needs Node.js 22 or newer.
- It writes edits only when you ask for edits.
- If only Markdown, MDX, or CMS content is available, it marks rendered-output checks as not verified.

See also [aicw-jsonld](/skills/aicw-jsonld) for FAQ markup that must match the visible text.
