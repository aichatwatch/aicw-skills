---
title: Example requests
description: Copy requests for common website tasks, and learn what the skills report.
---

The skills turn the checklists of the book into a workflow. The agent uses your files, public URL, or connected CMS to collect evidence. It makes changes where your access allows. Then it checks the result.

JSON-LD is structured data inside a page. The [aicw-jsonld](/skills/aicw-jsonld) skill reads the real blocks and compares their facts with the visible text. The [aicw-content](/skills/aicw-content) skill checks if a page answers the real task of the reader.

## Tell the agent what you want

Name the website: a URL, a project folder, or a connected site. Say what you want: an audit, proposed edits, draft changes, or live updates. If the target is missing, the agent asks. A URL alone supports inspection only. For CMS edits, the connector must offer the write operations.

## Requests for a site

For a site that you keep as HTML files:

> Use aicw-optimize on this HTML website. Improve the important pages for AI search. Check intent, JSON-LD, robots rules, sitemaps, and rendering. Keep the current design and factual claims. Verify the local output.

For an Astro site:

> Use aicw-jsonld and aicw-content on the pricing page and three product guides. Fix their source files, run the existing build, and compare the output with the original audit.

For a local WordPress site:

> Use aicw-optimize on this local WordPress installation. Inspect the active SEO plugin first. Back up the local database before updating posts or configuration. Verify the rendered pages and explain restoration.

For a connected CMS:

> Use aicw-content on the pricing page of the website I selected in my CMS connector. Read the current page and propose answers to missing reader questions. Save the changes as a draft if the connector supports drafts.

## Requests for an audit only

For a public website:

> Use aicw-audit on the public website URL I provide. Inspect reachable pages without a local checkout. Report evidence and any checks your tools cannot perform.

For a local preview:

> Use aicw-audit against this local preview. Show evidence, priorities, and missing runtime checks. Do not edit website files or the database.

## Requests for submission and measurement

If the site is not named, ask the skill to start:

> Use aicw-submit to help submit my website.

The agent asks for the public address and the URLs or sitemap. If no public address exists, it gives a checklist.

To prepare submissions without sending them:

> Use aicw-submit to prepare Google Search Console sitemap steps, Brave submission, and a Bing IndexNow payload for these changed public URLs. Keep the work local and do not send submissions.

To compare results:

> Use aicw-monitor to compare these before and after reports and my recorded AI search observations. Separate technical improvements, mentions, citations, traffic, and conversions.

## Read the result

The report separates defects from items that need judgment. A JSON parsing error is a defect. Whether a page answers a buyer's question needs the agent to read the page and explain its evidence.

Files alone cannot show how your production server behaves. A local preview cannot show if a search engine indexed your site. A submission receipt does not show indexing or a future AI citation.

Clear answers and useful structured data help machines and people understand a site. They do not guarantee search results. See [The book](/the-book) for the source.
