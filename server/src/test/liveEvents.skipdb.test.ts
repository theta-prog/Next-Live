import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers/testApp.js';

let app: any;
let accessToken: string;

describe('LiveEvents API (skipDb mode)', () => {
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

  it('GET /v1/live-events returns empty list', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/live-events',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ items: [] });
  });

  it('POST /v1/live-events returns mock event', async () => {
    const payload = {
      title: 'Test Event',
      date: new Date().toISOString(),
      venue: 'Test Venue'
    };
    const res = await app.inject({
      method: 'POST',
      url: '/v1/live-events',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload
    });
    expect(res.statusCode).toBe(200);
    const event = res.json();
    expect(event.id).toBe('mock-id');
    expect(event.title).toBe(payload.title);
  });

  it('GET /v1/live-events/:id returns mock event', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/live-events/00000000-0000-0000-0000-000000000000',
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().title).toBe('Mock Event');
  });
});
