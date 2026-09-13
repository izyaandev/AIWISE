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
    const { lessonId, courseId, percentageWatched, dwellTimeSeconds } = await req.json();

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        _count: {
          select: { assessments: true }
        }
      }
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const existingCompletion = await prisma.mediaCompletion.findUnique({
      where: {
        userId_lessonId: {
          userId: (session.user as any).id,
          lessonId,
        }
      }
    });

    if (existingCompletion?.isCompleted) {
      return NextResponse.json({ success: true, isCompleted: true });
    }

    // Determine completion logic
    let isCompleted = true;
    if (lesson.mediaType === 'VIDEO') {
      isCompleted = percentageWatched >= 90;
    } else if (lesson.minimumDwellTime) {
      isCompleted = dwellTimeSeconds >= lesson.minimumDwellTime;
    }

    // If the lesson has a quiz, it CANNOT be completed just by waiting
    if (lesson._count.assessments > 0) {
      isCompleted = false;
    }

    // Upsert media completion
    await prisma.mediaCompletion.upsert({
      where: {
        userId_lessonId: {
          userId: (session.user as any).id,
          lessonId,
        }
      },
      update: {
        percentageWatched: Math.max(percentageWatched || 0),
        dwellTimeSeconds: Math.max(dwellTimeSeconds || 0),
        isCompleted
      },
      create: {
        userId: (session.user as any).id,
        lessonId,
        percentageWatched: percentageWatched || 0,
        dwellTimeSeconds: dwellTimeSeconds || 0,
        isCompleted
      }
    });

    // Recalculate course progress
    if (isCompleted) {
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

      // Issue certificate if completed
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

    return NextResponse.json({ success: true, isCompleted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
