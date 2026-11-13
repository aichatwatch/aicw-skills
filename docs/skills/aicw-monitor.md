---
title: aicw-monitor
description: Build and compare an AI search measurement baseline before and after changes.
---

`aicw-monitor` helps you measure results. It keeps brand mentions, citations, indexing, referral traffic, and conversions apart. It follows Chapters 3 to 5 and Checklist 4 of the book [AI Search Engine Optimization Guide](https://aichatwatch.com/books/ai-seo-guide/).

## When to use it

- You changed a site and want to compare before and after.
- You want a baseline of AI answers for a set of questions.
- You want to choose the next experiment from evidence.

## Example request

> Use aicw-monitor to compare these before and after reports and my recorded AI search observations. Separate technical improvements, mentions, citations, traffic, and conversions.

## What the skill does

The skill builds a query set from real audience tasks. It records the engine, the exact query, the date, the language, the region, and the model when visible. It compares like with like, in a defined time window. It states the sample size and the other causes that could explain a change.

A change in citations does not prove that one edit caused it. If you have no AI answer data, the skill can offer a scan. It follows the same rules as [aicw-mentions](/skills/aicw-mentions).

## What it reads and writes

- It reads audit reports and exports that you supply, and analytics data through tools that you authorize.
- It can run the `compare` command on two `audit.json` files. See [Audit command line](/audit-cli).
- It can run the `presence` command when you ask. This command contacts Common Crawl.
- It does not create scheduled jobs, run paid scans, or publish content without your request.
