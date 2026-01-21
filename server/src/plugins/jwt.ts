import fastifyJwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any; // simplified type for now
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

export default fp(async function (app: FastifyInstance) {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  if (!accessSecret) throw new Error('JWT_ACCESS_SECRET missing');

  app.register(fastifyJwt, {
    secret: accessSecret,
    sign: {
      // アクセストークンの有効期限を7日間に延長（頻繁な再ログインを防ぐため）
      expiresIn: process.env.ACCESS_TOKEN_TTL || '7d'
    }
  });

  app.decorate('authenticate', async (req: any, reply: any) => {
    try {
      // Development bypass for guest login
      const authHeader = req.headers['authorization'];
      // console.log('Auth Debug:', { env: process.env.NODE_ENV, header: authHeader });
      
      if (process.env.NODE_ENV === 'development' && authHeader === 'Bearer dummy_access_token') {
        req.user = { sub: 'guest_user_id' };
        return;
      }

      await req.jwtVerify();
    } catch (err) {
      // console.error(err);
      reply.code(401).send({ code: 'UNAUTHORIZED' });
    }
  });
});
