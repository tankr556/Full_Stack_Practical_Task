import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Auth Controller Error Bypass Bug', () => {
  it('should forward unhandled exceptions to centralized error middleware with status 500 or proper status', async () => {
    // Attempting login with malformed input structure that triggers an exception
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $gt: "" }, password: "any" });

    // The centralized error handler returns success: false
    expect(res.body.success).toBe(false);
  });
});
