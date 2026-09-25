import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { BulkCreateUsers } from './BulkCreateUsers';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';
import { ClassAnalytics } from '@/components/admin/ClassAnalytics';
import { SurveyImpactDashboard } from '@/components/admin/SurveyImpactDashboard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [
    totalUsers,
    totalStudents,
    totalCertificates,
    totalAttempts,
    totalCompletions,
    courses,
    recentUsers,
    userProgress,
    surveys,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.certificate.count(),
    prisma.assessmentAttempt.count(),
    prisma.mediaCompletion.count({ where: { isCompleted: true } }),
    prisma.course.findMany({
      include: {
        modules: { include: { lessons: true } },
        progresses: true,
        certificates: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: { createdAt: 'desc' },
      take: 15,
    }),
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        courseProgresses: { include: { course: true } },
        certificates: true,
        assessmentAttempts: true,
        mediaCompletions: { where: { isCompleted: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.survey.findMany({
      include: {
        course: true,
        questions: true,
        responses: { include: { user: true } },
        _count: {
          select: { responses: true }
        }
      }
    }),
  ]);

  const avgScore = totalAttempts > 0
    ? Math.round(
        ((await prisma.assessmentAttempt.aggregate({ _avg: { score: true } }))._avg.score ?? 0)
      )
    : 0;

  // Analytics Data Preparation
  const enrollmentData = courses.map(c => ({
    name: c.title,
    value: c.progresses.length
  })).filter(d => d.value > 0); // only show courses with enrollments

  const certificatesData = courses.map(c => ({
    name: c.title,
    count: c.certificates.length
  }));

  // Average Score by Class
  const classScores: Record<string, { totalScore: number, attempts: number }> = {};
  userProgress.forEach(user => {
    const cls = user.className || 'Unassigned';
    if (!classScores[cls]) classScores[cls] = { totalScore: 0, attempts: 0 };
    user.assessmentAttempts.forEach(attempt => {
      classScores[cls].totalScore += attempt.score;
      classScores[cls].attempts += 1;
    });
  });

  const classScoreData = Object.entries(classScores).map(([cls, data]) => ({
    name: cls,
    avgScore: data.attempts > 0 ? Math.round(data.totalScore / data.attempts) : 0
  }));

  // --- Survey Impact Analytics Preparation ---
  const isPositive = (ans: string) => {
    const a = ans.toLowerCase();
    return a.includes('agree') || a === '5' || a === '4' || a.includes('positive') || a.includes('yes');
  };

  const getMetricScore = (keywordRegex: RegExp) => {
    let positive = 0;
    let total = 0;
    surveys.forEach(survey => {
      const targetQuestions = survey.questions.filter(q => keywordRegex.test(q.text));
      if (targetQuestions.length === 0) return;
      
      survey.responses.forEach(response => {
        let parsedAnswers: Record<string, string> = {};
        try { parsedAnswers = JSON.parse(response.answers); } catch (e) {}
        
        targetQuestions.forEach(q => {
          if (parsedAnswers[q.id]) {
            total++;
            if (isPositive(parsedAnswers[q.id])) positive++;
          }
        });
      });
    });
    return total > 0 ? Math.round((positive / total) * 100) : 0;
  };

  const hasData = (keywordRegex: RegExp) => {
    return surveys.some(s => s.questions.some(q => keywordRegex.test(q.text)));
  };

  const studentImpactKeywords = [
    { metric: 'Understanding responsible AI', regex: /responsible/i },
    { metric: 'Awareness of limitations', regex: /limitations|incorrect/i },
    { metric: 'Understanding AI bias', regex: /bias/i },
    { metric: 'Ability to verify info', regex: /verify/i },
    { metric: 'Awareness of privacy', regex: /privacy|safety/i },
    { metric: 'Academic integrity', regex: /integrity|schoolwork/i },
    { metric: 'Confidence using AI', regex: /confidence|confident/i },
    { metric: 'Overall AI WISE help', regex: /overall|helped/i },
  ];

  const behaviouralImpactKeywords = [
    { metric: 'Will verify info', regex: /verify/i },
    { metric: 'Will protect info', regex: /protect|personal/i },
    { metric: 'Will use as support', regex: /support|replace/i },
    { metric: 'Will follow practices', regex: /practices/i },
    { metric: 'Will acknowledge use', regex: /acknowledge/i },
  ];

  const studentImpact = studentImpactKeywords
    .filter(k => hasData(k.regex))
    .map(k => ({ metric: k.metric, score: getMetricScore(k.regex) }));

  const behaviouralImpact = behaviouralImpactKeywords
    .filter(k => hasData(k.regex))
    .map(k => ({ metric: k.metric, score: getMetricScore(k.regex) }));

  const completedSurveyUsers = new Set();
  surveys.forEach(s => s.responses.forEach(r => completedSurveyUsers.add(r.userId)));

  const group5to8 = { name: 'Grades 5-8', completed: 0, positiveSurvey: 0, totalSurvey: 0 };
  const group9to12 = { name: 'Grades 9-12', completed: 0, positiveSurvey: 0, totalSurvey: 0 };
  
  userProgress.forEach(user => {
    const cls = user.className || '';
    const isCompleted = user.certificates.length > 0;
    
    const match = cls.match(/\d+/);
    let group = null;
    if (match) {
      const grade = parseInt(match[0], 10);
      if (grade >= 5 && grade <= 8) group = group5to8;
      else if (grade >= 9 && grade <= 12) group = group9to12;
    }

    if (group && isCompleted) group.completed++;
  });

  surveys.forEach(survey => {
    survey.responses.forEach(response => {
      const user = response.user;
      if (!user) return;
      const cls = user.className || '';
      const match = cls.match(/\d+/);
      let group = null;
      if (match) {
        const grade = parseInt(match[0], 10);
        if (grade >= 5 && grade <= 8) group = group5to8;
        else if (grade >= 9 && grade <= 12) group = group9to12;
      }
      
      let parsedAnswers: Record<string, string> = {};
      try { parsedAnswers = JSON.parse(response.answers); } catch (e) {}
      
      let posCount = 0;
      let totCount = 0;
      survey.questions.forEach(q => {
        if (parsedAnswers[q.id]) {
          totCount++;
          if (isPositive(parsedAnswers[q.id])) posCount++;
        }
      });
      
      if (group && totCount > 0 && (posCount / totCount) >= 0.5) {
        group.positiveSurvey++;
      }
    });
  });

  // Calculate grade-wise completion properly
  const gradeWiseCompletionMap: Record<string, number> = {};
  userProgress.forEach(u => {
      if (u.certificates.length > 0) {
          const cls = u.className || 'Unassigned';
          gradeWiseCompletionMap[cls] = (gradeWiseCompletionMap[cls] || 0) + 1;
      }
  });

  const impactData = {
    totalTargeted: totalStudents,
    completedCourse: userProgress.filter(u => u.certificates.length > 0).length,
    earnedCertificates: totalCertificates,
    completedSurvey: completedSurveyUsers.size,
    gradeWiseCompletion: Object.entries(gradeWiseCompletionMap).map(([name, completed]) => ({ name, completed })),
    studentImpact: studentImpact.length ? studentImpact : [{ metric: 'No Data', score: 0 }],
    behaviouralImpact: behaviouralImpact.length ? behaviouralImpact : [{ metric: 'No Data', score: 0 }],
    comparativeGradeGroup: [group5to8, group9to12]
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 32px 120px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '32px' }}>
        <div>
          <h1 className="heading-2" style={{ color: 'var(--color-ink)' }}>Admin Dashboard</h1>
          <p className="body-lg" style={{ color: 'var(--color-slate)', marginTop: '8px' }}>
            Logged in as {(session.user as any).email}
          </p>
        </div>
        <Link href="/admin/create-course">
          <Button variant="primary" style={{ padding: '12px 32px' }}>+ New Course</Button>
        </Link>
      </div>

      <SurveyImpactDashboard data={impactData} />

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '80px' }}>
        {[
          { label: 'Total Students', value: totalStudents, color: 'var(--color-primary-dark)' },
          { label: 'Certificates Issued', value: totalCertificates, color: 'var(--color-success)' },
          { label: 'Active Courses', value: courses.length, color: 'var(--color-ink)' },
          { label: 'Quiz Attempts', value: totalAttempts, color: 'var(--color-primary-dark)' },
          { label: 'Lessons Completed', value: totalCompletions, color: 'var(--color-success)' },
          { label: 'Avg. Quiz Score', value: `${avgScore}%`, color: 'var(--color-ink)' },
        ].map(stat => (
          <Card key={stat.label} variant="base" style={{ padding: '28px' }}>
            <p className="body-sm" style={{ color: 'var(--color-slate)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem', fontWeight: 600 }}>
              {stat.label}
            </p>
            <p className="heading-1" style={{ color: stat.color, margin: 0, fontSize: '2.5rem' }}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Analytics Charts Grid */}
      <div style={{ marginBottom: '80px' }}>
        <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>
          <h2 className="heading-3" style={{ color: 'var(--color-ink)' }}>Analytics Overview</h2>
          <p className="body-sm" style={{ color: 'var(--color-slate)', marginTop: '8px' }}>Visual metrics of platform engagement and performance.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          <AnalyticsChart 
            title="Course Enrollments" 
            type="pie" 
            data={enrollmentData.length > 0 ? enrollmentData : [{ name: 'No Data', value: 1 }]} 
          />
          <AnalyticsChart 
            title="Avg Score by Class" 
            type="bar" 
            data={classScoreData} 
            bars={[{ key: 'avgScore', color: 'var(--color-primary)', name: 'Avg Quiz Score (%)' }]}
          />
          <AnalyticsChart 
            title="Certificates Issued" 
            type="line" 
            data={certificatesData} 
            lines={[{ key: 'count', color: 'var(--color-success)', name: 'Certificates' }]}
          />
        </div>
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', marginBottom: '80px' }}>
        {/* Courses */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>
            <h2 className="heading-3" style={{ color: 'var(--color-ink)' }}>Courses</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {courses.map(c => (
              <Card key={c.id} variant="base" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <p className="body-md" style={{ fontWeight: 700, margin: 0, color: 'var(--color-ink)', flex: 1, paddingRight: '12px' }}>{c.title}</p>
                  <Badge style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {c.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons
                  </Badge>
                </div>
                <p className="body-sm" style={{ color: 'var(--color-slate)', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {c.description}
                </p>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span className="body-sm" style={{ color: 'var(--color-slate)' }}>
                    {c.progresses.length} enrolled · {c.certificates.length} completed
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Student Directory */}
        <div>
          <ClassAnalytics students={userProgress.map(u => ({ id: u.id, name: u.name, email: u.email, className: u.className }))} />
        </div>
      </div>

      {/* Per-Student Progress Table */}
      <div style={{ marginBottom: '80px' }}>
        <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>
          <h2 className="heading-3" style={{ color: 'var(--color-ink)' }}>Student Progress Details</h2>
          <p className="body-sm" style={{ color: 'var(--color-slate)', marginTop: '8px' }}>Full breakdown of each student's activity across all courses.</p>
        </div>
        <Card variant="base" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#fcfcfc', borderBottom: '1px solid var(--color-hairline)' }}>
                  {['Student', 'Email', 'Lessons Done', 'Quizzes Taken', 'Certificates'].map(h => (
                    <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userProgress.map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i < userProgress.length - 1 ? '1px solid var(--color-hairline)' : 'none' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--color-ink)', whiteSpace: 'nowrap' }}>{u.name || '—'}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-slate)', fontSize: '0.9rem' }}>{u.email}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-ink)', fontWeight: 600, textAlign: 'center' }}>{u.mediaCompletions.length}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--color-ink)', fontWeight: 600, textAlign: 'center' }}>{u.assessmentAttempts.length}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      {u.certificates.length > 0 ? (
                        <Badge style={{ backgroundColor: 'var(--color-success)', color: 'white', border: 'none' }}>
                          {u.certificates.length}
                        </Badge>
                      ) : (
                        <span style={{ color: 'var(--color-slate)', fontSize: '0.9rem' }}>0</span>
                      )}
                    </td>
                  </tr>
                ))}
                {userProgress.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--color-slate)' }}>No students yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Bulk Create */}
      <div>
        <Card variant="base" style={{ padding: '48px' }}>
          <BulkCreateUsers />
        </Card>
      </div>
    </div>
  );
}
