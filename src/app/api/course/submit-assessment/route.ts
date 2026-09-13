import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { assessmentId, lessonId, courseId, answers } = await req.json();

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { questions: true }
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    let correctCount = 0;
    
    // Server-side scoring to prevent cheating
    for (const q of assessment.questions) {
      const userAnswer = answers[q.id];
      if (userAnswer === q.correctOption) {
        correctCount++;
      }
    }

    const score = (correctCount / assessment.questions.length) * 100;
    const passed = score >= 80;

    await prisma.assessmentAttempt.create({
      data: {
        userId: (session.user as any).id,
        assessmentId,
        score,
        passed
      }
    });

    if (passed) {
      // Mark the lesson as completed now that the assessment is passed
      await prisma.mediaCompletion.upsert({
        where: {
          userId_lessonId: {
            userId: (session.user as any).id,
            lessonId,
          }
        },
        update: {
          isCompleted: true
        },
        create: {
          userId: (session.user as any).id,
          lessonId,
          isCompleted: true
        }
      });
      
      // We should also ideally recalculate the course progress here.
      // Doing a quick recalculate similar to complete-lesson API.
      const courseModules = await prisma.module.findMany({
        where: { courseId },
        include: { lessons: true }
      });

      let totalLessons = 0;
      let completedLessons = 0;

      for (const mod of courseModules) {
        for (const l of mod.lessons) {
          totalLessons++;
          const comp = await prisma.mediaCompletion.findUnique({
            where: { userId_lessonId: { userId: (session.user as any).id, lessonId: l.id } }
          });
          if (comp?.isCompleted) {
            completedLessons++;
          }
        }
      }

      const overallPercentage = totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;
      const courseIsCompleted = overallPercentage === 100;

      await prisma.courseProgress.upsert({
        where: { userId_courseId: { userId: (session.user as any).id, courseId } },
        update: {
          lessonsCompleted: completedLessons,
          overallPercentage,
          isCompleted: courseIsCompleted,
          completedAt: courseIsCompleted ? new Date() : null,
        },
        create: {
          userId: (session.user as any).id,
          courseId,
          lessonsCompleted: completedLessons,
          overallPercentage,
          isCompleted: courseIsCompleted,
          completedAt: courseIsCompleted ? new Date() : null,
        }
      });

      if (courseIsCompleted) {
        await prisma.certificate.upsert({
          where: { userId_courseId: { userId: (session.user as any).id, courseId } },
          update: {},
          create: {
            userId: (session.user as any).id,
            courseId,
          }
        });
      }
    }

    return NextResponse.json({ score, passed });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
