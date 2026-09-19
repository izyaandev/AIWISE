import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: {
      courseProgresses: true,
      mediaCompletions: true,
      assessmentAttempts: true
    }
  });

  console.log("USERS:");
  users.forEach(u => {
    console.log(`- ${u.email} (${u.role}): ${u.courseProgresses.length} courses, ${u.mediaCompletions.length} completions, ${u.assessmentAttempts.length} attempts`);
    if (u.courseProgresses.length > 0) {
      console.log(`  Course Progress: ${u.courseProgresses.map(cp => cp.overallPercentage).join(', ')}%`);
    }
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
