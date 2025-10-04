import Fastify from 'fastify';
import dotenv from 'dotenv';
dotenv.config();

import jwtPlugin from './plugins/jwt.js';
import { authGoogleRoute } from './routes/auth/google.js';
import { artistRoutes } from './routes/artists.js';
import cors from '@fastify/cors';

async function build() {
  const app = Fastify({
    logger: true,
    requestTimeout: 15_000,      // 15s でリクエスト強制終了
    connectionTimeout: 5_000     // 接続確立待ちタイムアウト
  });

  await app.register(cors, { origin: true, credentials: true });
  // 公開ヘルスチェック（認証不要）
  app.get('/healthz', async () => ({ status: 'ok' }));
  // TODO: add rate limiting plugin (compatible version) or custom middleware later
  await app.register(jwtPlugin);

  await authGoogleRoute(app);
  await artistRoutes(app);

  // 共通エラーハンドラ
  app.setErrorHandler((err, _req, reply) => {
    app.log.error({ err });
    if (!reply.sent) {
      reply.code(err.statusCode && err.statusCode < 600 ? err.statusCode : 500)
        .send({ code: 'INTERNAL_ERROR', message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Error' });
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
