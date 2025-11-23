import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers/testApp.js';

let app: any;
let accessToken: string;

describe('Artists API (skipDb mode)', () => {
  beforeAll(async () => {
    app = await createTestApp({ mockGoogle: true, skipDb: true });
    const authRes = await app.inject({
      method: 'POST',
      url: '/v1/auth/google',
      payload: { idToken: 'aaaaaaaaaaaaaaaaaaaa' }
    });
    const body = authRes.json();
    accessToken = body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/artists returns empty list', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/artists', headers: { Authorization: `Bearer ${accessToken}` } });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ items: [] });
  });

  it('POST /v1/artists returns mock artist', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/artists',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { name: 'Test Artist', website: 'https://example.com' }
    });
    expect(res.statusCode).toBe(200);
    const artist = res.json();
    expect(artist.name).toBe('Test Artist');
    expect(artist.id).toBe('mock-id');
  });
});
