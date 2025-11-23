import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers/testApp.js';

let app: any;
let accessToken: string;

describe('Artists API validation (skipDb)', () => {
  beforeAll(async () => {
    app = await createTestApp({ mockGoogle: true, skipDb: true });
    const authRes = await app.inject({ method: 'POST', url: '/v1/auth/google', payload: { idToken: 'aaaaaaaaaaaaaaaaaaaa' } });
    accessToken = authRes.json().accessToken;
  });
  afterAll(async () => { await app.close(); });

  it('rejects empty name', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/artists',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { name: '' }
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().code).toBe('VALIDATION_ERROR');
  });

  it('rejects invalid website', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/artists',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { name: 'A', website: 'not-a-url' }
    });
    expect(res.statusCode).toBe(400);
  });
});
