import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    include: { survey: true }
  });

  for (const course of courses) {
    if (!course.survey) {
      await prisma.survey.create({
        data: {
          courseId: course.id,
          questions: {
            create: [
              { order: 1, text: 'How satisfied are you with the course content?', type: 'RATING' },
              { order: 2, text: 'Did the course meet your expectations?', type: 'TEXT' },
              { order: 3, text: 'What was your favorite part of the course?', type: 'TEXT' },
              { order: 4, text: 'How can we improve this course?', type: 'TEXT' },
              { order: 5, text: 'Would you recommend this course to a friend?', type: 'RATING' },
            ]
          }
        }
      });
      console.log(`Added survey to course: ${course.title}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
