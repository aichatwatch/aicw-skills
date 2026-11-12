---
title: Contributing
description: How to run the tests and validation checks for AICW Skills.
---

The code is on [GitHub](https://github.com/aichatwatch/aicw-skills). The license is MIT. Report bugs and ask questions as [GitHub issues](https://github.com/aichatwatch/aicw-skills/issues).

## Set up

You need Node.js 22 or newer. This command installs the exact dependencies from `package-lock.json`.

```sh
npm ci
```

## Run the tests

This command runs the core tests.

```sh
npm test
```

This command validates the skills and their references.

```sh
npm run validate
```

Edit shared code in `src/`, guidance in `resources/`, and entry points in `skills/*/SKILL.md`. The folders `scripts/`, `references/`, and `licenses/` inside each skill are generated. This command rebuilds them.

```sh
npm run build
```

This command checks that the generated files are current.

```sh
npm run check:build
```

## Releases

Maintainers find the release notes in [maintainers/releasing.md](https://github.com/aichatwatch/aicw-skills/blob/main/maintainers/releasing.md).
