import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkLogin() {
  const email = 'admin@school.edu';
  const password = 'admin123';

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log('User not found in DB!');
    return;
  }

  console.log('User found:', user.email, 'Role:', user.role);

  const isValid = await bcrypt.compare(password, user.passwordHash);
  console.log('Password valid?:', isValid);
}

checkLogin().finally(() => prisma.$disconnect());
