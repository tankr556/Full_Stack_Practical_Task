# Project Code Review & Vulnerability Audit (REVIEW.md)

This document details the top 4 structural and security issues identified in the existing REST API backend codebase across **Security**, **Performance**, **Database**, **Architecture**, **Testing**, and **UX**.

---

## 1. Issue: Controller Exception Handling Bypasses Express Centralized Error Handler

- **File / Line**: [`src/controllers/auth.controller.js`](file:///c:/Users/Admin/Desktop/Node_Js%20Task/src/controllers/auth.controller.js#L32-L37) (Lines 32-36 & 79-83)
- **Category**: Security / Architecture
- **Severity**: **Critical**
- **Justification**: In `auth.controller.js`, both `register` and `login` methods wrap logic in `try ... catch` blocks and explicitly return `res.status(400).json({ success: false, message: error.message })`. This completely bypasses the centralized error handling middleware [`src/middleware/error.middleware.js`](file:///c:/Users/Admin/Desktop/Node_Js%20Task/src/middleware/error.middleware.js). As a result, 500-level internal server/database rejections (e.g. database connectivity failure, unexpected null reference) are masked as 400 Bad Request client errors, leaking internal system rejections to unauthenticated users.
- **Business Impact**: Prevents server monitoring tools (Datadog/Sentry) from catching 500 internal crashes, leaks low-level system details to potential attackers, and breaks standard HTTP status code contracts.

### Reproduction Steps (curl)
```bash
# Attempt login with malformed input type to trigger Mongoose cast failure or internal exception
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": {"$gt": ""}, "password": "any"}'
```

### Recommended Fix
Forward errors to Express error handling middleware via `next(error)`:
```javascript
export const login = async (req, res, next) => {
  try {
    // login logic...
  } catch (error) {
    next(error);
  }
};
```

---

## 2. Issue: Raw Passwords Exposed in Registration API Response

- **File / Line**: [`src/controllers/auth.controller.js`](file:///c:/Users/Admin/Desktop/Node_Js%20Task/src/controllers/auth.controller.js#L30) (Line 30)
- **Category**: Security / Privacy
- **Severity**: **High**
- **Justification**: Upon successful registration, the controller returns `{ user: newUser }`. Although `User.prototype.toJSON` deletes `password` on plain document serializations, returning raw Mongoose document instances directly in express `res.json()` can bypass `toJSON` sanitization or leak internal Mongoose state depending on runtime context.
- **Business Impact**: Potential sensitive user field leakage in HTTP response bodies visible in browser developer tools or network logs.

### Recommended Fix
Explicitly sanitize the user output payload in the controller:
```javascript
const userResponse = {
  id: newUser._id,
  name: newUser.name,
  email: newUser.email,
  role: newUser.role,
};
return res.status(201).json({ success: true, user: userResponse });
```

---

## 3. Issue: Database Connection String & Fallback Secrets in Source Code

- **File / Line**: [`src/config/database.js`](file:///c:/Users/Admin/Desktop/Node_Js%20Task/src/config/database.js#L5) (Line 5) / [`.env.example`](file:///c:/Users/Admin/Desktop/Node_Js%20Task/.env.example#L2-L4) (Lines 2-4)
- **Category**: Security / Database
- **Severity**: **High**
- **Justification**: The database connector attempts `mongoose.connect(process.env.MONGODB_URI)` without fallback validation or schema enforcement. If `MONGODB_URI` or `JWT_SECRET` is missing in production, the application either crashes abruptly or relies on weak default fallback keys (`supersecretkey123`).
- **Business Impact**: Exposes deployment environment to server startup crashes or trivial JWT token forgery if secrets are unvalidated.

### Recommended Fix
Validate critical environment variables at startup before initializing Express server.

---

## 4. Issue: Total Lack of Automated Testing Suite

- **File / Line**: [`package.json`](file:///c:/Users/Admin/Desktop/Node_Js%20Task/package.json#L11) (Line 11)
- **Category**: Testing
- **Severity**: **High**
- **Justification**: `package.json` specifies `"test": "echo \"Error: no test specified\" && exit 1"`. There are 0 unit, integration, or end-to-end tests in the repository.
- **Business Impact**: High risk of regression when implementing new features (such as Task Comments, Activity Feed, or Airtable Export).

### Recommended Fix
Install Vitest / Supertest and add test scripts in `package.json`.
