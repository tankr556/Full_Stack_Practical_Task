# Production Debugging Strategy (DEBUGGING.md)

## Scenario: Task creation fails intermittently with HTTP 500 in production, but works locally.

Here is the exact 6-step investigation workflow:

### Step 1: Inspect Browser Network & Client Payload
- Open Browser Developer Tools (`F12`) -> **Network Tab**.
- Check the failed `POST /api/projects/:projectId/tasks` request payload and HTTP response headers.
- Verify whether the issue is client payload malformation (e.g. missing required fields) or true server-side unhandled exception.

### Step 2: Query Production Server Logs
- Check production process logs (PM2 / Vercel Logs / Datadog / CloudWatch / Render Logs).
- Search for the exact stack trace generated during the HTTP 500 timestamp.
- Identify if the failure is caused by an unhandled DB connection error, timeout, or missing env variable.

### Step 3: Validate Environment Variables & Secrets
- Confirm `MONGODB_URI`, `JWT_SECRET`, and `AIRTABLE_API_KEY` are defined in production hosting config.
- Ensure production database URI specifies connection pool options (`maxPoolSize`, `serverSelectionTimeoutMS`).

### Step 4: Check Database Connection & Replica Set Transactions
- **Root Cause Check**: MongoDB Transactions (`session.startTransaction()`) require a **Replica Set** cluster (e.g. MongoDB Atlas). Standalone local MongoDB instances without replica sets throw `Transaction numbers are only allowed on a replica set member or mongos`.
- Verify database user permissions and network IP whitelist (0.0.0.0/0 for hosted environments).

### Step 5: Test Payload Shape & Auth Token Validation
- Reproduce using a production curl command with a valid JWT token.
- Ensure token expiration or mismatch isn't causing middleware failure before controller execution.

### Step 6: Verify Production Config Differences
- Compare local vs production Node.js versions, dependencies (`npm ci`), and CORS origins.
