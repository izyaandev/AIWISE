import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import LessonViewer from './LessonViewer';
import Link from 'next/link';

export default async function LessonPage(props: { params: Promise<{ courseId: string, lessonId: string }> }) {
  const params = await props.params;
  
  let user = await getStudentSession();
  if (!user) {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    }
  }

  if (!user) {
    return <div>Not authenticated. Please <Link href="/student-login">login here</Link>.</div>;
  }

  const { courseId, lessonId } = params;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      assessments: {
        include: {
          questions: true
        }
      }
    }
  });

  if (!lesson) {
    notFound();
  }

  // Ensure this lesson belongs to the course
  const module = await prisma.module.findUnique({
    where: { id: lesson.moduleId }
  });

  if (module?.courseId !== courseId) {
    notFound();
  }

  const completion = await prisma.mediaCompletion.findUnique({
    where: {
      userId_lessonId: {
        userId: user.id,
        lessonId,
      }
    }
  });

  // Find next lesson to provide a "Next" button
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  });

  let nextLessonId = null;
  let foundCurrent = false;

  if (course) {
    for (const mod of course.modules) {
      for (const l of mod.lessons) {
        if (foundCurrent) {
          nextLessonId = l.id;
          break;
        }
        if (l.id === lessonId) {
          foundCurrent = true;
        }
      }
      if (nextLessonId) break;
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 32px 120px 32px' }}>
      <LessonViewer 
        lesson={lesson} 
        courseId={courseId}
        initialCompletion={completion} 
        nextLessonId={nextLessonId}
      />
    </div>
  );
}
