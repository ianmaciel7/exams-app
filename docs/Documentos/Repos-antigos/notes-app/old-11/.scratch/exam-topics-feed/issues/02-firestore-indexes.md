# 02: Firestore composite index definition and config registration

**What to build:** The declarative Firestore index for querying active questions ordered by exam sequence without client-side memory sorting.

**Blocked by:** 01: Core polymorphic exam and question domain types and schema contracts

**Status:** ready-for-agent

- [ ] Add composite index for collectionGroup `objects` covering `lifecycleState`, `objectTypeId`, `properties.examId`, and `properties.orderIndex`
- [ ] Declare `indexes` mapping in `firebase.json` for local emulators and deployment targets
- [ ] Validate syntax against Firebase security and indexing schema
