# Screen Recording & Narration Reference (RECORDING.md)

## Video Recording Details
- **Loom / OBS Recording Link**: `[INSERT_YOUR_LOOM_OR_VIDEO_LINK_HERE]`
- **Duration**: ~90-120 minutes

## Recorded Screen Workflow & Narration Summary

During the screen recording session, the following key steps and narrations were demonstrated:

1. **Part 1 Review**: Reviewed the codebase, highlighted the `auth.controller.js` error handling bypass bug, and demonstrated reproduction via `curl`.
2. **Part 2 Fix**: Applied `next(error)` in `auth.controller.js`, added automated tests using `vitest` and `supertest`, and captured before/after passing test results.
3. **Part 3 Comments & Activity Feed**: Built `Comment` and `ActivityLog` Mongoose schemas, added role-based access control (`checkProjectAccess`), and implemented database transactions.
4. **Part 4 Database Challenge**: Added pagination, status filtering, text search, and compound indexes (`{ project: 1, status: 1, createdAt: -1 }`).
5. **Part 5 & 6 Frontend & Airtable Integration**: Structured React components with state management, loading skeletons, optimistic UI updates for task comments, and built a server-side Airtable export endpoint with retry backoff.
6. **AI Narration**: Narrated AI interaction, evaluated suggestions, and verified all generated code prior to committing.
