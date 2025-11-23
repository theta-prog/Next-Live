import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const createSchema = z.object({
  eventId: z.string().uuid(),
  review: z.string().optional(),
  setlist: z.string().optional(),
  photos: z.array(z.string().url()).optional()
});

const updateSchema = createSchema.omit({ eventId: true }).partial();

export async function memoryRoutes(app: FastifyInstance) {
  const auth = (app as any).authenticate;
  const skipDb = process.env.SKIP_DB === 'true';

  app.get('/v1/memories', { preValidation: [auth] }, async (req: any) => {
    if (skipDb) return { items: [] };
    const userId = req.user.sub;
    const memories = await prisma.memory.findMany({
      where: { userId },
      include: { event: { include: { artist: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return { items: memories };
  });

  app.get('/v1/memories/:id', { preValidation: [auth] }, async (req: any, reply) => {
    const params = z.object({ id: z.string().uuid() }).safeParse(req.params);
    if (!params.success) return reply.code(400).send({ code: 'INVALID_ID' });
    if (skipDb) return { id: params.data.id, eventId: 'mock-event-id' };
    const userId = req.user.sub;
    const memory = await prisma.memory.findFirst({
      where: { id: params.data.id, userId },
      include: { event: { include: { artist: true } } }
    });
    if (!memory) return reply.code(404).send({ code: 'NOT_FOUND' });
    return memory;
  });

  app.post('/v1/memories', { preValidation: [auth] }, async (req: any, reply) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ code: 'VALIDATION_ERROR', errors: parsed.error.errors });
    if (skipDb) return { id: 'mock-id', userId: req.user.sub, ...parsed.data };
    const userId = req.user.sub;
    const event = await prisma.liveEvent.findFirst({ where: { id: parsed.data.eventId, userId } });
    if (!event) return reply.code(400).send({ code: 'EVENT_NOT_FOUND' });
    const memory = await prisma.memory.create({
      data: { ...parsed.data, userId, photos: parsed.data.photos || [] }
    });
    return memory;
  });

  app.patch('/v1/memories/:id', { preValidation: [auth] }, async (req: any, reply) => {
    const params = z.object({ id: z.string().uuid() }).safeParse(req.params);
    if (!params.success) return reply.code(400).send({ code: 'INVALID_ID' });
    const body = updateSchema.safeParse(req.body);
    if (!body.success) return reply.code(400).send({ code: 'VALIDATION_ERROR', errors: body.error.errors });
    if (skipDb) return { id: params.data.id, ...body.data };
    const userId = req.user.sub;
    const existing = await prisma.memory.findFirst({ where: { id: params.data.id, userId } });
    if (!existing) return reply.code(404).send({ code: 'NOT_FOUND' });
    const updated = await prisma.memory.update({
      where: { id: existing.id },
      data: body.data
    });
    return updated;
  });

  app.delete('/v1/memories/:id', { preValidation: [auth] }, async (req: any, reply) => {
    const params = z.object({ id: z.string().uuid() }).safeParse(req.params);
    if (!params.success) return reply.code(400).send({ code: 'INVALID_ID' });
    if (skipDb) return { ok: true };
    const userId = req.user.sub;
    const existing = await prisma.memory.findFirst({ where: { id: params.data.id, userId } });
    if (!existing) return reply.code(404).send({ code: 'NOT_FOUND' });
    await prisma.memory.delete({ where: { id: existing.id } });
    return { ok: true };
  });

  app.get('/v1/live-events/:eventId/memories', { preValidation: [auth] }, async (req: any, reply) => {
    const params = z.object({ eventId: z.string().uuid() }).safeParse(req.params);
    if (!params.success) return reply.code(400).send({ code: 'INVALID_ID' });
    if (skipDb) return { items: [] };
    const userId = req.user.sub;
    const memories = await prisma.memory.findMany({
      where: { eventId: params.data.eventId, userId },
      include: { event: { include: { artist: true } } }
    });
    return { items: memories };
  });
}
