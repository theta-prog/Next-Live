import { execSync } from 'node:child_process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

let app: any;
let buildFn: any;
let accessToken: string;
let refreshToken: string;
let pgContainer: any = null;
let skipSuite = false;

describe('Auth Refresh API (real DB)', () => {
  beforeAll(async () => {
    process.env.SKIP_DB = 'false';
    process.env.MOCK_GOOGLE = 'true';
    process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_secret';

    if (!process.env.DATABASE_URL) {
      try {
        const mod = await import('testcontainers');
        const { PostgreSqlContainer } = mod as any;
        pgContainer = await new PostgreSqlContainer().start();
        const username = pgContainer.getUsername();
        const password = pgContainer.getPassword();
        const host = pgContainer.getHost();
        const port = pgContainer.getPort();
        const database = pgContainer.getDatabase();
        process.env.DATABASE_URL = `postgresql://${username}:${password}@${host}:${port}/${database}`;
      } catch (e) {
        console.warn('[auth.refresh.db.test] testcontainers unavailable, skipping suite:', (e as any)?.message);
        skipSuite = true;
        return;
      }
    }

    try { execSync('npx prisma db push --skip-generate', { stdio: 'ignore' }); } catch {}
    try { execSync('npx prisma generate', { stdio: 'ignore' }); } catch {}

    const mod = await import('../../index.js');
    buildFn = mod.build;
    app = await buildFn();

    // Login to get initial tokens
    const res = await app.inject({ method: 'POST', url: '/v1/auth/google', payload: { idToken: 'mock-token' } });
    const body = res.json();
    accessToken = body.accessToken;
    refreshToken = body.refreshToken;
  });

  afterAll(async () => {
    if (app) await app.close();
    if (pgContainer) await pgContainer.stop();
  });

  it('rotates refresh token and revokes old one', async () => {
    if (skipSuite) return;

    // Rotate
    const rotateRes = await app.inject({
      method: 'POST',
      url: '/v1/auth/refresh',
      payload: { refreshToken }
    });
    expect(rotateRes.statusCode).toBe(200);
    const rotated = rotateRes.json();
    expect(rotated.accessToken).toBeTruthy();
    expect(rotated.refreshToken).toBeTruthy();
    expect(rotated.refreshToken).not.toBe(refreshToken);

    // Try to use old token -> should fail
    const failRes = await app.inject({
      method: 'POST',
      url: '/v1/auth/refresh',
      payload: { refreshToken }
    });
    expect(failRes.statusCode).toBe(401); // Invalid or revoked

    // Update current refreshToken for next step
    refreshToken = rotated.refreshToken;
  });

  it('revokes token on logout', async () => {
    if (skipSuite) return;

    // Logout
    const logoutRes = await app.inject({
      method: 'POST',
      url: '/v1/auth/logout',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { refreshToken }
    });
    expect(logoutRes.statusCode).toBe(200);

    // Try to use revoked token -> should fail
    const failRes = await app.inject({
      method: 'POST',
      url: '/v1/auth/refresh',
      payload: { refreshToken }
    });
    expect(failRes.statusCode).toBe(401);
  });
});
