import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.lesson.updateMany({
    data: {
      minimumDwellTime: 5,
    },
  });
  console.log('All lessons updated to 5 seconds minimum dwell time.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
