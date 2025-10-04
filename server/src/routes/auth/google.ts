import { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { verifyGoogleIdToken } from '../../lib/googleVerify.js';
import { z } from 'zod';

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
        // DB スキップモード: ダミーIDで即レスポンス
        const token = app.jwt.sign({ sub: 'mock-user-id' });
        req.log.info('auth.google:success_skipDb');
        return reply.send({
          accessToken: token,
          user: { id: 'mock-user-id', email: profile.email, name: profile.name }
        });
      }

      try {
        const user = await prisma.user.upsert({
          where: { providerSub: profile.sub },
          update: { email: profile.email, displayName: profile.name },
          create: { providerSub: profile.sub, email: profile.email, displayName: profile.name, provider: 'google' }
        });
        const token = app.jwt.sign({ sub: user.id });
        req.log.info('auth.google:success');
        return reply.send({
          accessToken: token,
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
}
