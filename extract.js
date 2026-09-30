const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const url = 'postgres://04e66caae8f992a8e420bfcdca4c4b3c3893ee0da3b4419be006db48cc90df30:sk_ZlEB0eKF6gD9_FueXBR45@db.prisma.io:5432/postgres?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: { url }
  }
});

async function main() {
  try {
    console.log('Connecting to database directly...');
    
    // Fetch all tables
    const users = await prisma.user.findMany();
    const courses = await prisma.course.findMany();
    const modules = await prisma.module.findMany();
    const lessons = await prisma.lesson.findMany();
    const assessments = await prisma.assessment.findMany();
    const questions = await prisma.question.findMany();
    const assessmentAttempts = await prisma.assessmentAttempt.findMany();
    const mediaCompletions = await prisma.mediaCompletion.findMany();
    const courseProgress = await prisma.courseProgress.findMany();
    const certificates = await prisma.certificate.findMany();

    const data = {
      users,
      courses,
      modules,
      lessons,
      assessments,
      questions,
      assessmentAttempts,
      mediaCompletions,
      courseProgress,
      certificates
    };

    fs.writeFileSync('database_backup.json', JSON.stringify(data, null, 2));
    console.log('Successfully backed up entire database to database_backup.json');
    console.log(`Extracted ${users.length} users and their progress metrics.`);

  } catch (e) {
    console.error('Failed to connect or fetch data:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
