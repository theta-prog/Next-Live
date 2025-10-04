import { build } from '../index.js';
import { afterAll, beforeAll, describe, it, expect } from 'vitest';

let app: Awaited<ReturnType<typeof build>>;

describe('Auth Google (mock/skipDb)', () => {
  beforeAll(async () => {
    process.env.MOCK_GOOGLE = 'true';
    process.env.SKIP_DB = 'true';
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';
    app = await build();
  });
  afterAll(async () => {
    await app.close();
  });
  it('returns accessToken with mock + skipDb', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/auth/google',
      payload: { idToken: 'aaaaaaaaaaaaaaaaaaaa' }
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.accessToken).toBeTruthy();
    expect(body.user).toMatchObject({ email: 'mock@example.com' });
  });
});
