# AI-Assisted Development Reflection (AI_NOTES.md)

## Summary of AI Suggestion & Verification

### 1. What I Asked AI
"Help me design the reliability architecture for task updates and activity feed logging. Should an activity log failure roll back the task update?"

### 2. What AI Suggested
The AI recommended using **Database Transactions (`session.startTransaction()`)** to ensure atomic writes—if either task update or activity log creation fails, both roll back.

### 3. What Was Correct
The architectural reasoning was spot on: having orphan task updates without activity logs causes audit record inconsistency in multi-user collaboration tools.

### 4. What I Changed & Corrected
- **Correction**: The initial AI code snippet assumed MongoDB always supports transactions out-of-the-box. In standalone local MongoDB instances (without replica sets), `startTransaction()` throws a runtime error (`Transaction numbers are only allowed on a replica set`).
- **Adjustment**: I ensured fallbacks and explicit error handling in `project.controller.js` so local standalone tests pass seamlessly while maintaining transaction safety in production.

### 5. How I Verified
- Ran automated test suite via Vitest.
- Manually tested `POST /api/projects/:projectId/tasks` with valid and invalid payloads.
- Verified MongoDB collections (`tasks` and `activitylogs`) to confirm records persist simultaneously.
