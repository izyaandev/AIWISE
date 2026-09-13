import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:");
  for (const user of users) {
    console.log(`- ${user.email} (Role: ${user.role})`);
    console.log(`  Hash: ${user.passwordHash}`);
    
    // Test the passwords
    const testAdmin = bcrypt.compareSync('admin123', user.passwordHash);
    const testStudent = bcrypt.compareSync('student123', user.passwordHash);
    
    console.log(`  Matches admin123? ${testAdmin}`);
    console.log(`  Matches student123? ${testStudent}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
