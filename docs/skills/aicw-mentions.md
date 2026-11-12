---
title: aicw-mentions
description: Check how AI assistants mention and cite a brand, product, or website.
---

`aicw-mentions` asks AI models the questions your customers ask. It reports which brands the answers mention and which links they cite. It follows Chapter 8 and Checklist 4 of the book [AI Search Engine Optimization Guide](https://aichatwatch.com/books/ai-seo-guide/).

## When to use it

- You want to know if AI assistants recommend your brand.
- You want to see which competitors and sources the answers name.
- You want a baseline before you change your site.

## Example request

> Use aicw-mentions to check how AI assistants mention my brand.

## What the skill does

The agent plans the scan. It reuses the saved questions of the site, or it writes 3 questions that a customer would ask. The questions do not contain your brand name. The agent shows the plan and asks you once.

The scan has three paths:

1. **Quick check.** The agent asks your local Claude Code and Codex. This needs no key and takes a few minutes. Both tools use your own accounts, so pay-per-use accounts are billed for each answer.
2. **Broad check.** The agent uses the aicw-ai-mentions tool with your OpenRouter API key. OpenRouter bills each answer.
3. **Paste check.** You paste each question into an AI app and paste the answer back. This needs no setup.

The agent never starts a scan without your yes. It never looks for keys in your files.

## What it reads and writes

- It does not read or edit your website.
- The quick check saves questions and results in `~/aicw-reports/<domain>/`.
- The agent starts its reply with a plain summary of the counts.

See [Mention scans](/mention-scans) for the details.
