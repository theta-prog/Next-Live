import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';

interface StoredToken {
  userId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt?: Date | null;
  lastUsedAt?: Date | null;
}

const inMemory = new Map<string, StoredToken>();

function parseDuration(input: string | undefined, fallbackMs: number): number {
  if (!input) return fallbackMs;
  const m = input.match(/^(\d+)([smhd])$/);
  if (!m) return fallbackMs;
  const v = Number(m[1]);
  switch (m[2]) {
    case 's': return v * 1000;
    case 'm': return v * 60 * 1000;
    case 'h': return v * 60 * 60 * 1000;
    case 'd': return v * 24 * 60 * 60 * 1000;
    default: return fallbackMs;
  }
}

const skipDb = () => process.env.SKIP_DB === 'true';

export interface IssueResult { token: string; expiresAt: Date; }

export async function issueRefreshToken(userId: string): Promise<IssueResult> {
  const raw = crypto.randomBytes(32).toString('base64url');
  const hash = hashToken(raw);
  const ttl = parseDuration(process.env.REFRESH_TOKEN_TTL, 14 * 24 * 60 * 60 * 1000); // default 14d
  const expiresAt = new Date(Date.now() + ttl);
  if (skipDb()) {
    inMemory.set(hash, { userId, tokenHash: hash, createdAt: new Date(), expiresAt });
    return { token: raw, expiresAt };
  }
  await prisma.refreshToken.create({ data: { userId, tokenHash: hash, expiresAt } });
  return { token: raw, expiresAt };
}

export async function rotateRefreshToken(oldRaw: string, userId: string): Promise<IssueResult | null> {
  const hash = hashToken(oldRaw);
  if (skipDb()) {
    const stored = inMemory.get(hash);
    if (!stored || stored.userId !== userId) return null;
    if (stored.revokedAt || stored.expiresAt < new Date()) return null;
    stored.revokedAt = new Date();
    return issueRefreshToken(userId);
  }
  const existing = await prisma.refreshToken.findFirst({ where: { tokenHash: hash, userId } });
  if (!existing) return null;
  if (existing.revokedAt || existing.expiresAt < new Date()) return null;
  await prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date(), lastUsedAt: new Date() } });
  return issueRefreshToken(userId);
}

export async function revokeRefreshToken(raw: string, userId: string): Promise<boolean> {
  const hash = hashToken(raw);
  if (skipDb()) {
    const stored = inMemory.get(hash);
    if (!stored || stored.userId !== userId) return false;
    stored.revokedAt = new Date();
    return true;
  }
  const existing = await prisma.refreshToken.findFirst({ where: { tokenHash: hash, userId } });
  if (!existing) return false;
  if (existing.revokedAt) return true;
  await prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date() } });
  return true;
}

export function hashToken(raw: string) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
