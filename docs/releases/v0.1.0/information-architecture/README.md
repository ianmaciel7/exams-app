# Information Architecture — v0.1.0

A single workspace has a competition navigation sidebar and a main question-list region. Selecting a competition loads its corresponding list. The active competition is identifiable. Questions appear vertically in the main region; the user can scroll. Routing, initial selection and scroll restoration remain open.

## Competition label

Competition items concatenate competition name, year and position/exam title in a single line, separated by middle dots (`Name · Year · Position/exam`). Truncate overflow with an ellipsis while preserving the full label for hover/focus discovery in the eventual implementation. The static sketch depicts truncation only. Examples follow the [historical commit 5c5402c](https://github.com/ianmaciel7/exams-app/commit/5c5402c1c6d93518b446b7f4309af3f1824d9e99); PPSA's full position title still requires confirmation.

Progress: in progress; user review pending.
