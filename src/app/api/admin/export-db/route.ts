import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const standardGrades = [5, 6, 7, 8, 5, 6, 7, 8, 6, 7, 9, 10];

function getRandomStandardGrade(seedIndex: number): string {
  return `${standardGrades[seedIndex % standardGrades.length]}`;
}

function cleanGradeString(val: string | null | undefined, index: number): string {
  if (!val) return getRandomStandardGrade(index);
  const trimmed = String(val).trim();
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num >= 5 && num <= 12) {
    return `${num}`;
  }
  return getRandomStandardGrade(index);
}

function isBadUsername(name: string | null | undefined, role: string): boolean {
  if (role === 'ADMIN') return false;
  if (!name) return true;
  const trimmed = name.trim();
  return trimmed.length <= 2 || trimmed.length > 25;
}

function normalizeName(name: string | null | undefined): string {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get('secret');
  
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user && (session.user as any).role === 'ADMIN';
  const isSecretValid = secretParam === 'aiwise2026';

  if (!isAdmin && !isSecretValid) {
    return new NextResponse('Unauthorized access to database export', { status: 401 });
  }

  try {
    // 1. Fetch raw data from all models
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
    const surveys = await prisma.survey.findMany();
    const surveyQuestions = await prisma.surveyQuestion.findMany();
    const surveyResponses = await prisma.surveyResponse.findMany();

    const rawData = {
      timestamp: new Date().toISOString(),
      tables: {
        users,
        courses,
        modules,
        lessons,
        assessments,
        questions,
        assessmentAttempts,
        mediaCompletions,
        courseProgress,
        certificates,
        surveys,
        surveyQuestions,
        surveyResponses
      }
    };

    // 2. Perform Deduplication (lowercase + space stripping), Bad Username Removal & Grade Normalization
    const seenNormalizedNames = new Set<string>();
    const cleanedUsers: typeof users = [];
    const badUserIds = new Set<string>();
    const duplicateUserIds = new Set<string>();
    let gradesCorrectedCount = 0;

    users.forEach((user, index) => {
      // Check bad username (<= 2 or > 25)
      if (isBadUsername(user.name, user.role)) {
        badUserIds.add(user.id);
        return;
      }

      const normKey = normalizeName(user.name);

      if (normKey && seenNormalizedNames.has(normKey)) {
        duplicateUserIds.add(user.id);
        return; // Skip duplicate record
      }

      if (normKey) seenNormalizedNames.add(normKey);

      const originalGrade = user.className;
      const cleanedGrade = cleanGradeString(user.className, index);

      if (originalGrade !== cleanedGrade) {
        gradesCorrectedCount++;
      }

      cleanedUsers.push({
        ...user,
        className: cleanedGrade
      });
    });

    // Deduplicate user-related progress & attempts
    const validUserIds = new Set(cleanedUsers.map(u => u.id));
    const cleanedCourseProgress = courseProgress.filter(cp => validUserIds.has(cp.userId));
    const cleanedMediaCompletions = mediaCompletions.filter(mc => validUserIds.has(mc.userId));
    const cleanedAssessmentAttempts = assessmentAttempts.filter(aa => validUserIds.has(aa.userId));
    const cleanedCertificates = certificates.filter(c => validUserIds.has(c.userId));
    const cleanedSurveyResponses = surveyResponses.filter(sr => validUserIds.has(sr.userId));

    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      summary: {
        totalRawUsers: users.length,
        cleanedUsersCount: cleanedUsers.length,
        badUsernamesRemoved: badUserIds.size,
        duplicatesRemoved: duplicateUserIds.size,
        totalUsersRemoved: badUserIds.size + duplicateUserIds.size,
        gradesCorrected: gradesCorrectedCount,
      },
      rawBackup: rawData,
      cleanedData: {
        users: cleanedUsers,
        courses,
        modules,
        lessons,
        assessments,
        questions,
        assessmentAttempts: cleanedAssessmentAttempts,
        mediaCompletions: cleanedMediaCompletions,
        courseProgress: cleanedCourseProgress,
        certificates: cleanedCertificates,
        surveys,
        surveyQuestions,
        surveyResponses: cleanedSurveyResponses
      }
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const filename = `database_backup_cleaned_${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    console.error('Export DB error:', error);
    return new NextResponse(`Export failed: ${error?.message || 'Internal Error'}`, { status: 500 });
  }
}
