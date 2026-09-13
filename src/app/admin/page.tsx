import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { BulkCreateUsers } from './BulkCreateUsers';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
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

        {/* Recent Students */}
        <div>
          <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>
            <h2 className="heading-3" style={{ color: 'var(--color-ink)' }}>Recent Students</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentUsers.map(u => (
              <Card key={u.id} variant="base" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p className="body-md" style={{ fontWeight: 600, margin: '0 0 2px 0', color: 'var(--color-ink)' }}>{u.name || 'No Name'}</p>
                    <p className="body-sm" style={{ color: 'var(--color-slate)', margin: 0 }}>{u.email}</p>
                  </div>
                  <form action={async () => {
                    'use server';
                    const { deleteUser } = await import('@/app/actions/admin');
                    await deleteUser(u.id);
                  }}>
                    <button type="submit" style={{ cursor: 'pointer', background: 'transparent', color: 'var(--color-error)', border: '1px solid var(--color-error)', borderRadius: '6px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: 600 }}>
                      Remove
                    </button>
                  </form>
                </div>
              </Card>
            ))}
          </div>
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

      {/* Survey Results */}
      <div style={{ marginBottom: '80px' }}>
        <div style={{ marginBottom: '32px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>
          <h2 className="heading-3" style={{ color: 'var(--color-ink)' }}>Survey Results</h2>
          <p className="body-sm" style={{ color: 'var(--color-slate)', marginTop: '8px' }}>Export post-course survey responses collected from students.</p>
        </div>
        <Card variant="base" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {surveys.map(survey => (
              <div key={survey.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--color-hairline)', borderRadius: '8px' }}>
                <div>
                  <h3 className="heading-3" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{survey.course.title}</h3>
                  <p className="body-sm" style={{ color: 'var(--color-slate)' }}>{survey._count.responses} responses collected</p>
                </div>
                <Link href={`/api/admin/export-survey?surveyId=${survey.id}`} target="_blank">
                  <Button variant="secondary">Download Excel (CSV)</Button>
                </Link>
              </div>
            ))}
            {surveys.length === 0 && (
              <p className="body-md" style={{ color: 'var(--color-slate)', textAlign: 'center' }}>No surveys created yet.</p>
            )}
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
