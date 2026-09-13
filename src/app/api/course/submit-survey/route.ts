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
    const { courseId, surveyId, answers } = await req.json();

    if (!courseId || !surveyId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if course is actually completed
    const progress = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId: (session.user as any).id, courseId } }
    });

    if (!progress || progress.overallPercentage < 100) {
      return NextResponse.json({ error: 'You must finish the course before submitting the survey.' }, { status: 403 });
    }

    // Save the survey response
    await prisma.surveyResponse.upsert({
      where: {
        userId_surveyId: {
          userId: (session.user as any).id,
          surveyId
        }
      },
      update: {
        answers: JSON.stringify(answers)
      },
      create: {
        userId: (session.user as any).id,
        surveyId,
        answers: JSON.stringify(answers)
      }
    });

    // Generate the certificate since they've now completed the survey
    const cert = await prisma.certificate.upsert({
      where: { userId_courseId: { userId: (session.user as any).id, courseId } },
      update: {},
      create: {
        userId: (session.user as any).id,
        courseId,
      }
    });

    return NextResponse.json({ success: true, certificateToken: cert.verificationToken });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
