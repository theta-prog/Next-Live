import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../index.js';
import { FastifyInstance } from 'fastify';

describe('Sync API', () => {
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

  it('should perform sync without lastSyncAt', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/sync',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {}
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data).toHaveProperty('serverChanges');
    expect(data).toHaveProperty('syncedAt');
    expect(data.serverChanges).toHaveProperty('artists');
    expect(data.serverChanges).toHaveProperty('liveEvents');
    expect(data.serverChanges).toHaveProperty('memories');
  });

  it('should perform sync with lastSyncAt', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/sync',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        lastSyncAt: new Date(Date.now() - 60000).toISOString()
      }
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data).toHaveProperty('syncedAt');
  });

  it('should get sync status', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/sync/status',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data).toHaveProperty('lastSyncAt');
  });

  it('should reject invalid lastSyncAt format', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/sync',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        lastSyncAt: 'invalid-date'
      }
    });
    expect(res.statusCode).toBe(400);
  });

  it('should require authentication', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/sync',
      payload: {}
    });
    expect(res.statusCode).toBe(401);
  });
});
