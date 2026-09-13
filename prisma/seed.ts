import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function hashPassword(password: string) {
  // Use bcryptjs for seeding
  return bcrypt.hashSync(password, 10);
}

async function main() {
  console.log('Seeding database...');

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.edu' },
    update: { passwordHash: hashPassword('admin123') },
    create: {
      email: 'admin@school.edu',
      name: 'School Admin',
      passwordHash: hashPassword('admin123'),
      role: 'ADMIN',
    },
  });

  // 2. Create Student
  const student = await prisma.user.upsert({
    where: { email: 'student@school.edu' },
    update: { passwordHash: hashPassword('student123') },
    create: {
      email: 'student@school.edu',
      name: 'Jane Doe',
      passwordHash: hashPassword('student123'),
      role: 'STUDENT',
    },
  });

  // 3. Create Courses
  const coursesData = [
    {
      title: 'Introduction to Artificial Intelligence',
      description: 'Learn the fundamentals of AI, machine learning, and neural networks in this comprehensive introductory course.',
      modules: {
        create: [
          {
            title: 'Module 1: What is AI?',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Welcome to the Course',
                  order: 1,
                  content: '# Welcome\nThis course will guide you through the basics of Artificial Intelligence. Please read through this carefully.',
                  minimumDwellTime: 5, // 30 seconds required
                },
                {
                  title: 'The History of AI',
                  order: 2,
                  mediaType: 'VIDEO',
                  mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                }
              ]
            }
          }
        ]
      }
    },
    {
      title: 'Advanced React Design Patterns',
      description: 'Master React by learning the advanced design patterns used by top tech companies to build scalable UI.',
      modules: {
        create: [
          {
            title: 'Module 1: Component Architecture',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Compound Components',
                  order: 1,
                  content: '# Compound Components\nLearn how to build expressive components using the Compound Component pattern.',
                  minimumDwellTime: 5,
                },
                {
                  title: 'Render Props in 2026',
                  order: 2,
                  content: '# Render Props\nAre render props dead? No! Here is why.',
                  minimumDwellTime: 5,
                }
              ]
            }
          }
        ]
      }
    },
    {
      title: 'Neo-Brutalism for Modern Web',
      description: 'Ditch the sterile corporate UI. Learn how to build maximalist, neo-brutalist web applications that stand out.',
      modules: {
        create: [
          {
            title: 'Module 1: The Philosophy',
            order: 1,
            lessons: {
              create: [
                {
                  title: 'Why Brutalism?',
                  order: 1,
                  content: '# Why Brutalism?\nBecause boring is bad.',
                  minimumDwellTime: 5,
                }
              ]
            }
          }
        ]
      }
    }
  ];

  const createdCourses = [];
  for (const cData of coursesData) {
    const created = await prisma.course.create({ data: cData });
    createdCourses.push(created);
  }
  
  const course = createdCourses[0]; // for assessment referencing below

  // 4. Create an Assessment for the lesson
  const firstModule = await prisma.module.findFirst({ where: { courseId: course.id } });
  const videoLesson = await prisma.lesson.findFirst({ where: { moduleId: firstModule?.id, title: 'The History of AI' } });

  if (videoLesson) {
    await prisma.assessment.create({
      data: {
        lessonId: videoLesson.id,
        title: 'Module 1 Quiz',
        questions: {
          create: [
            {
              text: 'What does AI stand for?',
              options: JSON.stringify(['Artificial Intelligence', 'Automated Interface', 'Advanced Integration']),
              correctOption: 'Artificial Intelligence'
            }
          ]
        }
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
