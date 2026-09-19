import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export default async function CourseOverviewPage(props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const { courseId } = params;
  
  let user = await getStudentSession();
  if (!user) {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      user = await prisma.user.findUnique({ where: { email: session.user.email! } });
    }
  }

  if (!user) {
    return <div>Not authenticated. Please <Link href="/student-login">login here</Link>.</div>;
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  const progress = await prisma.courseProgress.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  const completions = await prisma.mediaCompletion.findMany({
    where: {
      userId: user.id,
      lesson: {
        module: {
          courseId,
        }
      }
    }
  });

  const completedLessonIds = new Set(completions.filter(c => c.isCompleted).map(c => c.lessonId));

  const certificate = await prisma.certificate.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      }
    }
  });

  let firstIncompleteLessonId = null;
  let totalLessons = 0;
  
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      totalLessons++;
      if (!completedLessonIds.has(lesson.id) && !firstIncompleteLessonId) {
        firstIncompleteLessonId = lesson.id;
      }
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 32px 120px 32px' }}>
      <Link href="/dashboard" aria-label="Back to Dashboard" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '32px', color: 'var(--color-slate)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--color-hairline)' }}>
        ← Back to Dashboard
      </Link>
      
      <div style={{ marginBottom: '64px', backgroundColor: 'var(--color-surface)', padding: '48px', border: '1px solid var(--color-hairline)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
        <h1 className="heading-2" style={{ marginBottom: '8px', color: 'var(--color-ink)' }}>{course.title}</h1>
        <p className="body-lg" style={{ color: 'var(--color-slate)', borderTop: '1px solid var(--color-hairline)', paddingTop: '16px' }}>{course.description}</p>
        
        {course.syllabus && (
          <div style={{ marginTop: '32px', padding: '32px', backgroundColor: '#fcfbf9', border: '1px solid var(--color-hairline)', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
            <h3 className="heading-3" style={{ marginBottom: '16px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '8px' }}>Syllabus Details</h3>
            <p className="body-md" style={{ color: 'var(--color-ink)' }}>{course.syllabus}</p>
          </div>
        )}

        <div style={{ marginTop: '48px' }}>
          {firstIncompleteLessonId ? (
            <a href={`/course/${course.id}/lesson/${firstIncompleteLessonId}`} style={{ textDecoration: 'none' }}>
              <Button variant="primary" className="lg">Continue Course →</Button>
            </a>
          ) : (
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button variant="secondary" className="lg" disabled>Course Completed</Button>
              {certificate ? (
                <a href={`/api/certificate/${certificate.id}`} target="_blank" aria-label="Download Certificate" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" className="lg">Download Certificate</Button>
                </a>
              ) : (
                <a href={`/course/${course.id}/survey`} style={{ textDecoration: 'none' }}>
                  <Button variant="primary" className="lg" style={{ backgroundColor: 'var(--color-success)' }}>Take Final Survey</Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
        <h2 className="heading-2" style={{ color: 'var(--color-ink)', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '16px' }}>Syllabus</h2>
        
        {course.modules.map(mod => (
          <Card key={mod.id} variant="base" style={{ padding: '32px' }}>
            <h3 className="heading-3" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--color-hairline)' }}>{mod.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mod.lessons.map(lesson => {
                const isCompleted = completedLessonIds.has(lesson.id);
                return (
                  <Link 
                    key={lesson.id} 
                    href={`/course/${course.id}/lesson/${lesson.id}`}
                    style={{ textDecoration: 'none' }}
                    aria-label={`Lesson: ${lesson.title}. Status: ${isCompleted ? 'Completed' : 'Incomplete'}`}
                  >
                    <div className="lesson-card" style={{ 
                      padding: '24px', 
                      backgroundColor: isCompleted ? 'rgba(168, 139, 105, 0.05)' : 'var(--color-surface)', 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid var(--color-hairline-strong)',
                      borderRadius: '6px',
                      transition: 'border-color 0.2s ease, transform 0.2s ease'
                    }}
                    >
                      <span className="body-md" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{lesson.title}</span>
                      {isCompleted && (
                        <Badge style={{ backgroundColor: 'var(--color-success)', color: 'white', border: 'none' }}>Done ✓</Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
