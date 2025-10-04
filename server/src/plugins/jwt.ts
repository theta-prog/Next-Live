import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { FastifyInstance } from 'fastify';

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
      expiresIn: process.env.ACCESS_TOKEN_TTL || '10m'
    }
  });

  app.decorate('authenticate', async (req: any, reply: any) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      reply.code(401).send({ code: 'UNAUTHORIZED' });
    }
  });
});
