import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = bcrypt.hashSync('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@school.edu' },
    update: { passwordHash: hash },
    create: {
      email: 'admin@school.edu',
      name: 'School Admin',
      passwordHash: hash,
      role: 'ADMIN'
    }
  });
  console.log('Admin password reset to admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
