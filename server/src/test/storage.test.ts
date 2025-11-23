import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../index.js';
import { FastifyInstance } from 'fastify';

describe('Storage API', () => {
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

  it('should generate presigned URL for image upload', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/storage/presign',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        size: 1024 * 1024
      }
    });
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data).toHaveProperty('uploadUrl');
    expect(data).toHaveProperty('publicUrl');
    expect(data).toHaveProperty('key');
    expect(data).toHaveProperty('expiresIn');
    expect(data.method).toBe('PUT');
  });

  it('should reject non-image content type', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/storage/presign',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        filename: 'test.pdf',
        contentType: 'application/pdf',
        size: 1024
      }
    });
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body);
    expect(data.code).toBe('INVALID_CONTENT_TYPE');
  });

  it('should reject file size over limit', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/storage/presign',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        size: 20 * 1024 * 1024 // 20MB
      }
    });
    expect(res.statusCode).toBe(400);
  });

  it('should require authentication', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/storage/presign',
      payload: {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        size: 1024
      }
    });
    expect(res.statusCode).toBe(401);
  });
});
