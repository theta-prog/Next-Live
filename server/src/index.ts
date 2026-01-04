import dotenv from 'dotenv';
import Fastify from 'fastify';

import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { prisma } from './lib/prisma.js';
import jwtPlugin from './plugins/jwt.js';
import { artistRoutes } from './routes/artists.js';
import { authGoogleRoute } from './routes/auth/google.js';
import { liveEventRoutes } from './routes/liveEvents.js';
import { memoryRoutes } from './routes/memories.js';
import { storageRoutes } from './routes/storage.js';
import { syncRoutes } from './routes/sync.js';
dotenv.config();

async function build() {
  const app = Fastify({
    logger: true,
    requestTimeout: 15_000,      // 15s request timeout
    connectionTimeout: 5_000,    // Connection timeout
    bodyLimit: 10 * 1024 * 1024  // 10MB body limit for image uploads
  });

  await app.register(cors, { origin: true, credentials: true });
  
  // Rate limiting: 100 requests per minute per IP
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });

  // 公開ヘルスチェック（認証不要）
  app.get('/healthz', async () => ({ status: 'ok' }));
  
  await app.register(jwtPlugin);

  // Ensure guest user exists in development
  if (process.env.NODE_ENV === 'development') {
    try {
      await prisma.user.upsert({
        where: { id: 'guest_user_id' },
        update: {},
        create: {
          id: 'guest_user_id',
          email: 'guest@example.com',
          displayName: 'Guest User',
          provider: 'local',
          providerSub: 'guest_sub'
        }
      });
      app.log.info('Guest user ensured in database');
    } catch (e) {
      app.log.error({ err: e }, 'Failed to ensure guest user');
    }
  }

  await authGoogleRoute(app);
  await artistRoutes(app);
  await liveEventRoutes(app);
  await memoryRoutes(app);
  await syncRoutes(app);
  await storageRoutes(app);

  // 共通エラーハンドラ
  app.setErrorHandler((err, _req, reply) => {
    app.log.error({ err });
    if (!reply.sent) {
      const error = err as any;
      reply.code(error.statusCode && error.statusCode < 600 ? error.statusCode : 500)
        .send({ code: 'INTERNAL_ERROR', message: process.env.NODE_ENV === 'development' ? error.message : 'Internal Error' });
    }
  });

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  build()
    .then((app) => {
      const port = Number(process.env.PORT || 3000);
      app.listen({ port, host: '0.0.0.0' }).catch((err) => {
        app.log.error(err);
        process.exit(1);
      });
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export { build };
