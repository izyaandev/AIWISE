import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const user = await getStudentSession();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if course is actually completed
    const progress = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } }
    });

    if (!progress || progress.overallPercentage < 100) {
      return NextResponse.json({ error: 'You must finish the course before submitting the survey.' }, { status: 403 });
    }

    // We no longer track individual survey responses here since they use MS Forms
    // Just generate the certificate since they've clicked "I have completed the survey"
    const cert = await prisma.certificate.upsert({
      where: { userId_courseId: { userId: user.id, courseId } },
      update: {},
      create: {
        userId: user.id,
        courseId,
      }
    });

    return NextResponse.json({ success: true, certificateToken: cert.verificationToken });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
