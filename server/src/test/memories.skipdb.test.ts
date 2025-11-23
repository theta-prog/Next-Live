import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers/testApp.js';

let app: any;
let accessToken: string;

describe('Memories API (skipDb mode)', () => {
  beforeAll(async () => {
    app = await createTestApp({ mockGoogle: true, skipDb: true });
    const authRes = await app.inject({
      method: 'POST',
      url: '/v1/auth/google',
      payload: { idToken: 'mock-token' }
    });
    accessToken = authRes.json().accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /v1/memories returns empty list', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/memories',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ items: [] });
  });

  it('POST /v1/memories returns mock memory', async () => {
    const payload = {
      eventId: '00000000-0000-0000-0000-000000000000',
      review: 'Great show!',
      setlist: 'Song 1\nSong 2'
    };
    const res = await app.inject({
      method: 'POST',
      url: '/v1/memories',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload
    });
    expect(res.statusCode).toBe(200);
    const memory = res.json();
    expect(memory.id).toBe('mock-id');
    expect(memory.review).toBe(payload.review);
  });
});
