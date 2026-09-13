import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default async function VerifyCertificatePage(props: { params: Promise<{ token: string }> }) {
  const params = await props.params;

  // The token belongs to one certificate — find the user behind it
  const certificate = await prisma.certificate.findUnique({
    where: { verificationToken: params.token },
    include: {
      user: true,
      course: true,
    },
  });

  if (!certificate) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-canvas)', padding: '64px 32px' }}>
        <Card variant="base" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '64px 48px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '24px' }}>🔍</div>
          <h1 className="heading-2" style={{ color: 'var(--color-error)', marginBottom: '16px' }}>Not Found</h1>
          <p className="body-md" style={{ color: 'var(--color-slate)' }}>
            We could not verify this link. It may be invalid or the link is incorrect.
          </p>
          <div style={{ marginTop: '32px' }}>
            <Link href="/"><Button variant="secondary">Return to Platform</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  // Fetch full academic transcript for this user
  const [allCertificates, allAttempts] = await Promise.all([
    prisma.certificate.findMany({
      where: { userId: certificate.userId },
      include: { course: true },
      orderBy: { issuedAt: 'asc' },
    }),
    prisma.assessmentAttempt.findMany({
      where: { userId: certificate.userId },
      include: {
        assessment: {
          include: {
            lesson: {
              include: {
                module: {
                  include: { course: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Group attempts by course
  const attemptsByCourse: Record<string, typeof allAttempts> = {};
  for (const attempt of allAttempts) {
    const courseId = attempt.assessment.lesson.module.courseId;
    if (!attemptsByCourse[courseId]) attemptsByCourse[courseId] = [];
    attemptsByCourse[courseId].push(attempt);
  }

  const issuedDate = certificate.issuedAt.toLocaleDateString('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ backgroundColor: 'var(--color-canvas)', minHeight: '100vh', padding: '64px 32px 120px 32px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <Badge style={{ marginBottom: '24px', fontSize: '0.9rem', padding: '8px 24px', backgroundColor: 'var(--color-success)', color: 'white', border: 'none', borderRadius: '16px' }}>
            ✓ Verified Academic Transcript
          </Badge>
          <h1 className="heading-1" style={{ color: 'var(--color-ink)', marginBottom: '12px' }}>
            {certificate.user.name || certificate.user.email}
          </h1>
          <p className="body-lg" style={{ color: 'var(--color-slate)' }}>
            Official record issued by GEMS Our Own High School, Al Warqa'a — AIWISE Platform
          </p>
        </div>

        {/* Verified identity block */}
        <Card variant="base" style={{ padding: '40px', marginBottom: '48px', backgroundColor: '#fafaf8' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '32px' }}>
            <div>
              <p className="body-sm" style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '6px' }}>Full Name</p>
              <p className="body-lg" style={{ margin: 0, fontWeight: 600 }}>{certificate.user.name || '—'}</p>
            </div>
            <div>
              <p className="body-sm" style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '6px' }}>Email</p>
              <p className="body-lg" style={{ margin: 0, fontWeight: 600 }}>{certificate.user.email}</p>
            </div>
            <div>
              <p className="body-sm" style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '6px' }}>Total Certificates</p>
              <p className="body-lg" style={{ margin: 0, fontWeight: 600 }}>{allCertificates.length}</p>
            </div>
          </div>
        </Card>

        {/* Completed Courses with scores */}
        <div style={{ marginBottom: '48px' }}>
          <h2 className="heading-3" style={{ color: 'var(--color-ink)', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px', marginBottom: '32px' }}>
            Completed Courses & Assessment Results
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {allCertificates.map((cert) => {
              const courseAttempts = attemptsByCourse[cert.courseId] || [];
              const passedAttempts = courseAttempts.filter(a => a.passed);
              const avgScore = courseAttempts.length > 0
                ? Math.round(courseAttempts.reduce((sum, a) => sum + a.score, 0) / courseAttempts.length)
                : null;
              const highScore = courseAttempts.length > 0
                ? Math.round(Math.max(...courseAttempts.map(a => a.score)))
                : null;

              return (
                <Card key={cert.id} variant="base" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <h3 className="heading-3" style={{ margin: '0 0 8px 0', color: 'var(--color-ink)' }}>{cert.course.title}</h3>
                      <p className="body-sm" style={{ color: 'var(--color-slate)', margin: 0 }}>
                        Completed on {cert.issuedAt.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <Badge style={{ backgroundColor: 'var(--color-success)', color: 'white', border: 'none', padding: '6px 16px', flexShrink: 0 }}>
                      Certified ✓
                    </Badge>
                  </div>

                  {courseAttempts.length > 0 ? (
                    <div style={{ backgroundColor: '#f9f8f6', borderRadius: '8px', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                      <div>
                        <p className="body-sm" style={{ color: 'var(--color-slate)', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quizzes Taken</p>
                        <p className="heading-3" style={{ margin: 0, color: 'var(--color-ink)' }}>{courseAttempts.length}</p>
                      </div>
                      <div>
                        <p className="body-sm" style={{ color: 'var(--color-slate)', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Score</p>
                        <p className="heading-3" style={{ margin: 0, color: avgScore !== null && avgScore >= 80 ? 'var(--color-success)' : 'var(--color-error)' }}>{avgScore}%</p>
                      </div>
                      <div>
                        <p className="body-sm" style={{ color: 'var(--color-slate)', marginBottom: '4px', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Best Score</p>
                        <p className="heading-3" style={{ margin: 0, color: 'var(--color-success)' }}>{highScore}%</p>
                      </div>
                    </div>
                  ) : (
                    <p className="body-sm" style={{ color: 'var(--color-slate)', margin: 0 }}>No quiz data available for this course.</p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Verification block */}
        <Card variant="base" style={{ padding: '32px', backgroundColor: '#fafaf8', borderTop: '3px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p className="body-sm" style={{ color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '4px' }}>Verification ID</p>
              <p className="body-sm" style={{ fontFamily: 'monospace', margin: 0, color: 'var(--color-slate)', wordBreak: 'break-all' }}>{params.token}</p>
            </div>
            <Link href="/">
              <Button variant="secondary" style={{ padding: '10px 24px' }}>Return to Platform</Button>
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
}
