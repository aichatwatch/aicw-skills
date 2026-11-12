---
title: aicw-jsonld
description: Inspect, validate, and repair JSON-LD structured data in website pages.
---

JSON-LD is structured data inside a page, in a `script` element of type `application/ld+json`. `aicw-jsonld` finds every block, checks it, and compares its facts with the visible page. It follows Chapter 7 of the book [AI Search Engine Optimization Guide](https://aichatwatch.com/books/ai-seo-guide/).

## When to use it

- A page has JSON-LD errors.
- Two plugins or components emit duplicate graphs.
- You want to check entity types, identifiers, references, or media fields.
- You want to check that JSON-LD agrees with the visible text.

## Example request

> Use aicw-jsonld on the pricing page and three product guides. Fix their source files, run the existing build, and compare the output with the original audit.

## What the skill does

The skill runs the deterministic checks first. Then it judges whether each entity and property is true and relevant. It finds the existing generator before it edits. It does not add a second graph to hide defects in the first one.

The helper script is a limited linter. It is not a full JSON-LD processor, a Schema.org validator, or a Google eligibility test. The skill asks you to run the named external validation when your access and disclosure scope allow it.

## What it reads and writes

- It reads the response HTML of each page. For pages that need JavaScript, it also uses browser output.
- A source file alone does not prove what a page emits.
- It writes edits to the source or CMS field only when you ask for repairs.
- It keeps your production URLs. It does not replace canonical URLs with preview URLs.
