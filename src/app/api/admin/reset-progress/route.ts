import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.certificate.deleteMany();
    await prisma.surveyResponse.deleteMany();
    await prisma.courseProgress.deleteMany();
    await prisma.mediaCompletion.deleteMany();
    await prisma.assessmentAttempt.deleteMany();

    return NextResponse.json({ 
      success: true, 
      message: 'All course progress, certificates, and survey responses have been reset.' 
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
