---
trigger: model_decision
description: "Read when changing Compiler configuration, directives, optimization, or eligibility diagnostics."
---

# React Compiler

<!-- cspell:words preinit Pipeable unobserve Rects nativeButton -->

## When to read

Read when changing Compiler configuration, directives, optimization, or eligibility diagnostics.

## Compiler behavior

Apply this rule to React Compiler optimization, Rules of React, lint diagnostics, legacy migration, feature selection, and verification workflows.
Follow [Rules of React](https://react.dev/reference/rules) and [React Compiler guidance](https://react.dev/learn/react-compiler).

Compiler can automate eligible `memo`, `useMemo`, and `useCallback` style
optimizations during build. Prefer pure code, measure actual performance,
and keep correctness independent of memoization. Compiler cannot fix invalid
logic, guarantee third-party mutable API compatibility, or manage resources.

Use `"use memo"` to request compilation only under a supported configuration;
use `"use no memo"` for a documented reason rather than hiding a problem.
Resolve React rule violations and inspect actual diagnostics. Check pinned
Compiler 1.0.0 before copying newer options. Installing Compiler does not
enable it in every build pipeline or establish that every component was
optimized.

Use the existing diagnostics before introducing another lint stack or custom parser.
Upstream lint names do not prove local enforcement. See [TOOLING.md](../../TOOLING.md#react-documentation-and-diagnostic-workflow).
