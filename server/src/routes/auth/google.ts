import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { verifyGoogleIdToken } from '../../lib/googleVerify.js';
import { prisma } from '../../lib/prisma.js';
import { issueRefreshToken, revokeRefreshToken, rotateRefreshToken } from '../../services/refreshToken.js';

const bodySchema = z.object({ idToken: z.string().min(10) });

export async function authGoogleRoute(app: FastifyInstance) {
  app.post('/v1/auth/google', { schema: { body: { type: 'object', properties: { idToken: { type: 'string' } } } } }, async (req, reply) => {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ code: 'VALIDATION_ERROR', errors: parsed.error.errors });

    // 進捗ログ（開発時デバッグ用）
    req.log.info({ mock: process.env.MOCK_GOOGLE, skipDb: process.env.SKIP_DB }, 'auth.google:start');
    try {
      const profile = await verifyGoogleIdToken(parsed.data.idToken);
      const skipDb = process.env.SKIP_DB === 'true';
      if (skipDb) {
        const userId = 'mock-user-id';
        const accessToken = app.jwt.sign({ sub: userId });
        const refresh = await issueRefreshToken(userId);
        req.log.info('auth.google:success_skipDb');
        return reply.send({
          accessToken,
          refreshToken: refresh.token,
          refreshExpiresAt: refresh.expiresAt,
          user: { id: userId, email: profile.email, name: profile.name }
        });
      }

      try {
        const user = await prisma.user.upsert({
          where: { providerSub: profile.sub },
          update: { email: profile.email, displayName: profile.name },
          create: { providerSub: profile.sub, email: profile.email, displayName: profile.name, provider: 'google' }
        });
        const accessToken = app.jwt.sign({ sub: user.id });
        const refresh = await issueRefreshToken(user.id);
        req.log.info('auth.google:success');
        return reply.send({
          accessToken,
          refreshToken: refresh.token,
          refreshExpiresAt: refresh.expiresAt,
          user: { id: user.id, email: user.email, name: user.displayName }
        });
      } catch (dbErr:any) {
        req.log.error({ dbErr }, 'auth.google:db_error');
        return reply.code(500).send({ code: 'DB_ERROR' });
      }
    } catch (e:any) {
      req.log.error({ e }, 'auth.google:failure');
      return reply.code(401).send({ code: 'AUTH_FAILED' });
    }
  });

  // Refresh endpoint
  app.post('/v1/auth/refresh', async (req, reply) => {
    const body: any = req.body || {};
    const { refreshToken } = body;
    if (!refreshToken || typeof refreshToken !== 'string') {
      return reply.code(400).send({ code: 'VALIDATION_ERROR' });
    }
    // decode old access token if provided to get userId fallback
    const auth = (req.headers.authorization || '').split(' ')[1];
    let userId: string | null = null;
    if (auth) {
      try { userId = (app.jwt.decode(auth) as any)?.sub; } catch {}
    }
    if (!userId) {
      // require client to also send userId? we keep simple: attempt rotation for mock user if skipDb
      if (process.env.SKIP_DB === 'true') userId = 'mock-user-id';
    }
    if (!userId) return reply.code(401).send({ code: 'UNAUTHORIZED' });
    const rotated = await rotateRefreshToken(refreshToken, userId);
    if (!rotated) return reply.code(401).send({ code: 'INVALID_REFRESH' });
    const newAccess = app.jwt.sign({ sub: userId });
    return reply.send({ accessToken: newAccess, refreshToken: rotated.token, refreshExpiresAt: rotated.expiresAt });
  });

  app.post('/v1/auth/logout', async (req, reply) => {
    const body: any = req.body || {};
    const { refreshToken } = body;
    if (!refreshToken) return reply.code(400).send({ code: 'VALIDATION_ERROR' });
    // optional user id from access token
    let userId: string | null = null;
    const auth = (req.headers.authorization || '').split(' ')[1];
    if (auth) { try { userId = (app.jwt.decode(auth) as any)?.sub; } catch {} }
    if (!userId && process.env.SKIP_DB === 'true') userId = 'mock-user-id';
    if (!userId) return reply.code(401).send({ code: 'UNAUTHORIZED' });
    const ok = await revokeRefreshToken(refreshToken, userId);
    return reply.send({ revoked: ok });
  });
}
