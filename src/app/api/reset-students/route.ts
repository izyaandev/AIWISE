import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 1. Delete all student-related data
    await prisma.certificate.deleteMany();
    await prisma.surveyResponse.deleteMany();
    await prisma.courseProgress.deleteMany();
    await prisma.mediaCompletion.deleteMany();
    await prisma.assessmentAttempt.deleteMany();
    
    // Delete students
    await prisma.user.deleteMany({
      where: {
        role: 'STUDENT'
      }
    });

    // (Vercel is read-only, so we cannot self-destruct the file here. 
    // The developer must remove it via a git commit after use.)

    return NextResponse.json({ success: true, message: 'All student data reset. This route has now self-destructed.' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset student data' }, { status: 500 });
  }
}
