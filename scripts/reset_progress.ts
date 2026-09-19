import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.local' });
if (process.env.POSTGRES_PRISMA_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
}

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting all progress...');

  await prisma.certificate.deleteMany();
  await prisma.surveyResponse.deleteMany();
  await prisma.courseProgress.deleteMany();
  await prisma.mediaCompletion.deleteMany();
  await prisma.assessmentAttempt.deleteMany();

  console.log('Progress reset successfully.');
  
  // Log some useful info to debug
  const courses = await prisma.course.findMany({
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              assessments: true,
            }
          }
        }
      },
      survey: true
    }
  });

  console.log('\n--- DEBUG INFO ---');
  courses.forEach(c => {
    console.log(`Course: ${c.title} (ID: ${c.id})`);
    console.log(`  Syllabus exists: ${!!c.syllabus}`);
    console.log(`  Survey exists: ${!!c.survey}`);
    c.modules.forEach(m => {
      m.lessons.forEach(l => {
        console.log(`  Lesson: ${l.title} (ID: ${l.id}) - Assessments: ${l.assessments.length}`);
      });
    });
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
