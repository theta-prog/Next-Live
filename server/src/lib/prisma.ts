import { PrismaClient } from '@prisma/client';

// Singleton to avoid creating many instances in dev watch mode
let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

if (!global.__prisma__) {
  global.__prisma__ = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  });
}

prisma = global.__prisma__;

export { prisma };
