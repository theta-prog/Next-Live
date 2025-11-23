import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../index.js';
import { FastifyInstance } from 'fastify';

describe('Memories API', () => {
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

  it('should get empty memories list', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/memories',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data).toHaveProperty('items');
    expect(Array.isArray(data.items)).toBe(true);
  });

  it('should create a memory', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/memories',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        eventId: '550e8400-e29b-41d4-a716-446655440000',
        review: 'Great concert!',
        photos: ['https://example.com/photo.jpg']
      }
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data).toHaveProperty('id');
    expect(data.review).toBe('Great concert!');
  });

  it('should reject invalid eventId', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/memories',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        eventId: 'invalid-uuid',
        review: 'Great concert!'
      }
    });
    expect(res.statusCode).toBe(400);
  });

  it('should require authentication', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/memories'
    });
    expect(res.statusCode).toBe(401);
  });
});
