import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../index.js';
import { FastifyInstance } from 'fastify';

describe('LiveEvents API', () => {
  let app: FastifyInstance;
  let accessToken: string;

  beforeAll(async () => {
    process.env.SKIP_DB = 'true';
    process.env.MOCK_GOOGLE = 'true';
    process.env.JWT_ACCESS_SECRET = 'test-secret-key-for-testing';
    app = await build();
    await app.ready();

    const authRes = await app.inject({
      method: 'POST',
      url: '/v1/auth/google',
      payload: { idToken: 'mock-token-1234567890' }
    });
    const authData = JSON.parse(authRes.body);
    accessToken = authData.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get empty live events list', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/live-events',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
  });

  it('should create a live event', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/live-events',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        title: 'Test Concert',
        date: new Date().toISOString(),
        venue: 'Test Venue'
      }
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data).toHaveProperty('id');
    expect(data.title).toBe('Test Concert');
  });

  it('should reject invalid date format', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/live-events',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        title: 'Test Concert',
        date: 'invalid-date',
        venue: 'Test Venue'
      }
    });
    expect(res.statusCode).toBe(400);
  });

  it('should require authentication', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/live-events'
    });
    expect(res.statusCode).toBe(401);
  });
});
