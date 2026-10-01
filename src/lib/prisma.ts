import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (url.includes('connection_limit=')) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}connection_limit=1`;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
    ...(dbUrl ? { datasourceUrl: dbUrl } : {}),
  });

globalForPrisma.prisma = prisma;
