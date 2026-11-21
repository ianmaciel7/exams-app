# 05: Continuous ExamFeedView feed stream with scroll-to-top and route integration

**What to build:** The single-column continuous question feed page, pagination hook `useExamFeed`, floating scroll-to-top button, and App Router route `/[spaceId]/exams/[examId]`.

**Blocked by:** 02: Firestore composite index definition and config registration, 04: Accessible QuestionCard UI component with click-to-validate feedback

**Status:** ready-for-agent

- [ ] Implement `useExamFeed` managing sequence cursor pagination, loading states, and scroll position
- [ ] Implement `ExamFeedView` streaming question cards vertically with floating scroll-to-top action
- [ ] Mount App Router page at `src/app/[spaceId]/exams/[examId]/page.tsx`
- [ ] Provide full i18n localization keys in `en.json`, `es.json`, and `pt-BR.json`
- [ ] Author end-to-end component tests verifying feed rendering and smooth scrolling
