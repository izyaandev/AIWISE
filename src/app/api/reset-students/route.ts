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

    // 2. Self-destruct this route file so it can only be used once
    const filePath = path.join(process.cwd(), 'src/app/api/reset-students/route.ts');
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true, message: 'All student data reset. This route has now self-destructed.' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset student data' }, { status: 500 });
  }
}
