import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import QuizClient from './QuizClient';
import Link from 'next/link';

export default async function QuizPage(props: { params: Promise<{ courseId: string, lessonId: string, assessmentId: string }> }) {
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

  const { courseId, lessonId, assessmentId } = params;

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { questions: true }
  });

  // Check if already passed
  const previousAttempt = await prisma.assessmentAttempt.findFirst({
    where: {
      userId: user.id,
      assessmentId,
      passed: true
    }
  });

  if (previousAttempt) {
    redirect(`/course/${courseId}`);
  }

  if (!assessment || assessment.lessonId !== lessonId) {
    notFound();
  }

  // Verify lesson belongs to course
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: true }
  });

  if (lesson?.module.courseId !== courseId) {
    notFound();
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 32px 120px 32px' }}>
      <QuizClient assessment={assessment} courseId={courseId} lessonId={lessonId} />
    </div>
  );
}
