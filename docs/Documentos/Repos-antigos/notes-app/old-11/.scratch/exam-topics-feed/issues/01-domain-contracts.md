# 01: Core polymorphic exam and question domain types and schema contracts

**What to build:** The foundational type definitions, validation schemas, and polymorphic Firestore property contracts for `Exam` and `Question` entities conforming to `DER.md` schemaVersion 4 and ADR 0017.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Declare polymorphic `ExamObject` and `QuestionObject` data shapes with question options and grounded explanation contracts
- [ ] Provide pure validation functions mapping input schemas to error codes for i18n
- [ ] Ensure full test coverage on schema validation via deterministic Vitest tests
