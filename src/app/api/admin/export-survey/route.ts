import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const surveyId = searchParams.get('surveyId');

    if (!surveyId) {
      return new NextResponse('Missing surveyId', { status: 400 });
    }

    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        course: true
      }
    });

    if (!survey) {
      return new NextResponse('Survey not found', { status: 404 });
    }

    const responses = await prisma.surveyResponse.findMany({
      where: { surveyId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    // Build CSV Header
    let csv = 'Submission Date,Student Name,Student Email,';
    csv += survey.questions.map(q => `"${q.text.replace(/"/g, '""')}"`).join(',') + '\n';

    // Build CSV Rows
    for (const response of responses) {
      const date = response.createdAt.toISOString();
      const name = `"${(response.user.name || '').replace(/"/g, '""')}"`;
      const email = `"${(response.user?.email || '').replace(/"/g, '""')}"`;

      let parsedAnswers: Record<string, string> = {};
      try {
        parsedAnswers = JSON.parse(response.answers);
      } catch (e) {
        // ignore JSON parse error
      }

      const answerCells = survey.questions.map(q => {
        const ans = parsedAnswers[q.id] || '';
        return `"${ans.replace(/"/g, '""')}"`;
      });

      csv += `${date},${name},${email},${answerCells.join(',')}\n`;
    }

    const filename = `Survey_Export_${survey.course.title.replace(/\s+/g, '_')}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
