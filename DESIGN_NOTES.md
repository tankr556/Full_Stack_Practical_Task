# Architecture & Database Design Decisions (DESIGN_NOTES.md)

## 1. Reliability & Consistency Tradeoff (Task Update vs Activity Feed)

### Question
If a task update succeeds but writing the activity log fails, should the original task update roll back?

### Decision: Strict Consistency via Database Transactions
We chose **Strict Consistency (Atomic Database Transactions)**.

### Rationale
In audit-critical and collaboration systems, activity logs represent the source of truth for compliance, security tracking, and multi-user synchronization. If a status or assignee change succeeds without an activity log entry, other team members and system audit trails lose visibility into who modified the task and when. By wrapping both the task update and activity log creation in a single MongoDB transaction session (`session.startTransaction()`), we guarantee that either both writes persist or both roll back atomically, eliminating silent state divergence.

---

## 2. Database Challenge Implementation (Part 4)

We implemented **Pagination**, **Status Filtering**, **Full-Text Search**, and **Database Indexes** on the tasks collection (`GET /api/projects/:projectId/tasks?page=1&limit=20&status=todo&search=bug`).

### 1. Pagination & Filtering
- **Problem Solved**: Fetching thousands of project tasks at once degrades API latency and memory usage.
- **Implementation**: Used `.skip((page - 1) * limit).limit(limit)` with dynamic filter queries (`{ project: projectId, status }`).

### 2. Database Indexes & Query Plan Optimization
- **Compound Index**: `{ project: 1, status: 1, createdAt: -1 }` on `Task` schema.
- **Why**: Allows MongoDB's query optimizer to perform index covered scans for project-specific tasks sorted by creation date without memory sorting overhead.
- **Text Index**: `{ title: 'text', description: 'text' }` for lightning-fast keyword search across task titles and descriptions.

### Edge Case Handling
- **Invalid Page Numbers**: Normalized with `Math.max(1, parseInt(page))` to prevent negative offsets.
- **Empty Results**: Returns `{ pagination: { total: 0, totalPages: 0 }, tasks: [] }` with HTTP 200 rather than 404.
