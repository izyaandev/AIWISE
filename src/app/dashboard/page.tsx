import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return <div>Not authenticated</div>;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      courseProgresses: {
        include: {
          course: true,
        },
      },
    },
  });

  // Auto-assign any newly added courses to the user for this MVP
  const allCourses = await prisma.course.findMany();
  let courses = user?.courseProgresses || [];
  const assignedCourseIds = new Set(courses.map(cp => cp.courseId));
  
  let needsRefetch = false;
  for (const course of allCourses) {
    if (!assignedCourseIds.has(course.id)) {
      await prisma.courseProgress.create({
        data: {
          userId: user!.id,
          courseId: course.id,
          lessonsCompleted: 0,
          overallPercentage: 0,
        }
      });
      needsRefetch = true;
    }
  }

  if (needsRefetch) {
    const updatedUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: {
        courseProgresses: {
          include: { course: true },
        },
      },
    });
    courses = updatedUser?.courseProgresses || [];
  }

  // Fetch user's certificates for sharing transcripts
  const certificates = await prisma.certificate.findMany({
    where: { userId: user!.id },
  });
  const certByCourseId = new Map(certificates.map(c => [c.courseId, c]));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 32px 120px 32px' }}>
      <div style={{ marginBottom: '80px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '32px', paddingTop: '40px' }}>
        <h1 className="heading-2" style={{ color: 'var(--color-ink)', textTransform: 'capitalize' }}>
          Welcome Back, {user?.name?.toLowerCase() || 'Student'}
        </h1>
        <p className="body-lg" style={{ color: 'var(--color-slate)', marginTop: '16px' }}>
          Pick up where you left off.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '64px' }}>
        {courses.map((progress) => {
          const cert = certByCourseId.get(progress.courseId);
          return (
            <Card key={progress.id} variant="base" style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 2 }}>
                {progress.isCompleted ? (
                  <Badge style={{ padding: '4px 12px', fontSize: '0.85rem', backgroundColor: 'var(--color-success)', color: 'white', borderRadius: '16px', border: 'none' }}>Completed</Badge>
                ) : (
                  <Badge style={{ padding: '4px 12px', fontSize: '0.85rem', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '16px', border: 'none' }}>{Math.round(progress.overallPercentage)}% Done</Badge>
                )}
              </div>
              
              <h3 className="heading-3" style={{ marginBottom: '16px', paddingRight: '110px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px', wordWrap: 'break-word' }}>
                {progress.course.title}
              </h3>
              
              <p className="body-md" style={{ color: 'var(--color-slate)', marginBottom: '32px', flexGrow: 1, fontSize: '0.95rem', lineHeight: '1.6' }}>
                {progress.course.description}
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div aria-label={`Course progress: ${Math.round(progress.overallPercentage)}%`} style={{ width: '100%', height: '8px', backgroundColor: '#e6e0d8', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress.overallPercentage}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }} />
                </div>
                
                {!cert && progress.overallPercentage === 100 ? (
                  <Link href={`/course/${progress.course.id}/survey`} style={{ width: '100%', display: 'block' }}>
                    <Button variant="primary" style={{ width: '100%', backgroundColor: 'var(--color-success)' }}>
                      Take Final Survey
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/course/${progress.course.id}`} style={{ width: '100%', display: 'block' }} aria-label={progress.overallPercentage > 0 ? `Continue course ${progress.course.title}` : `Start course ${progress.course.title}`}>
                    <Button variant={progress.overallPercentage > 0 ? 'primary' : 'secondary'} style={{ width: '100%' }}>
                      {progress.overallPercentage > 0 ? 'Continue Learning' : 'Start Course'}
                    </Button>
                  </Link>
                )}

                {cert && (
                  <Link
                    href={`/verify/${cert.verificationToken}`}
                    target="_blank"
                    style={{ width: '100%', display: 'block', textDecoration: 'none' }}
                    aria-label={`Share transcript for ${progress.course.title}`}
                  >
                    <Button variant="secondary" style={{ width: '100%', fontSize: '0.9rem', padding: '10px' }}>
                      🔗 Share Transcript
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          );
        })}
        {courses.length === 0 && (
          <p className="body-md" style={{ color: 'var(--color-slate)' }}>You don't have any courses assigned yet.</p>
        )}
      </div>
    </div>
  );
}
