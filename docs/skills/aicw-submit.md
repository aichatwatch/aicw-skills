---
title: aicw-submit
description: Prepare and guide submissions to Google, Bing and IndexNow, and Brave.
---

`aicw-submit` prepares manual submissions of a website to Google Search Console, Bing Webmaster Tools with IndexNow, and Brave Search. It follows Chapter 7 of the book [AI Search Engine Optimization Guide](https://aichatwatch.com/books/ai-seo-guide/).

## When to use it

- You launched a site and want to submit its sitemap.
- You changed public pages and want to tell search engines.
- You need a record of what you submitted.

## Example request

> Use aicw-submit to prepare Google Search Console sitemap steps, Brave submission, and a Bing IndexNow payload for these changed public URLs. Keep the work local and do not send submissions.

## What the skill does

The skill needs the public address of the site. If you did not give it, the agent asks. If the site has no public address yet, the agent gives a checklist and does not invent an address. The skill never submits localhost.

It checks that pages can be indexed and that canonical URLs agree. It then writes the steps for each service, with ready-to-copy URLs, ownership steps, and the expected response. A successful request is not confirmed indexing. The skill does not promise an indexing date.

## What it reads and writes

- The `prepare-submission` command writes a verification text file, `indexnow.json`, and `submission.json`. It does not overwrite existing files.
- The command does not publish the key file and does not contact a submission service.
- The skill sends a real submission only if you ask, and only with tools that you authorize.
- It stays within the search engines of the book. It does not cover business directories or backlink campaigns.

See [Audit command line](/audit-cli) for the command options.
