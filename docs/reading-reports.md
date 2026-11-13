---
title: Reading reports
description: What the audit report files contain and how to read them.
---

The `audit` command writes two files in the report folder: `audit.json` and `audit.md`. See [Audit command line](/audit-cli).

## audit.json

`audit.json` holds the full data:

- Project discovery.
- Page evidence.
- Coverage.
- Findings.
- Limitations.
- Book attribution.
- All 25 checklist items of the book.

Each finding records its checklist IDs. It also records its type: a book application, an implementation check, or a current correction.

The `bookChecklist` part leaves the semantic and overall assessments as `not-assessed`. The agent completes them. It uses the linked findings and the real page content.

## audit.md

`audit.md` shows the same findings in a form that is easy to read.

## How to read the findings

- Read the selected root and the coverage first.
- A defect that a script can prove, such as a JSON syntax error, is a deterministic finding.
- A judgment, such as whether a page answers a question, needs the agent to explain its evidence.
- Review, unknown, and skipped states are not passes.

## Keep reports private

**Warning:** A report holds page text. It can contain unpublished content. Keep reports outside your site source and public folders. Do not share a report until you check it.

## Compare two reports

Use the `compare` command with two `audit.json` files to see what changed. See [Audit command line](/audit-cli#compare).
