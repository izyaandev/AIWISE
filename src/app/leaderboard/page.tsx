import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  // Calculate points: 10 points per completed lesson, 50 points per completed assessment, 100 points per completed course
  
  const users = await prisma.user.findMany({
    where: {
      role: {
        not: 'ADMIN'
      }
    },
    include: {
      courseProgresses: true,
      mediaCompletions: true,
      assessmentAttempts: {
        where: { passed: true }
      },
      certificates: true
    }
  });

  const leaderboard = users.map(user => {
    let points = 0;
    
    // 10 points per completed media lesson
    points += user.mediaCompletions.filter(m => m.isCompleted).length * 10;
    
    // 50 points per passed assessment
    points += user.assessmentAttempts.length * 50;

    // 100 points per completed course (certificates)
    points += user.certificates.length * 100;

    // Get completion time of the first course progress (since there's usually only one)
    const completedAt = user.courseProgresses.find(p => p.isCompleted)?.completedAt;

    return {
      id: user.id,
      name: user.name || user.email,
      points,
      certificates: user.certificates.length,
      completedAt,
      isCurrentUser: user.id === (session.user as any).id
    };
  }).sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points; // Sort descending by points
    }
    // If points are equal, sort by completion time ascending (earlier is better)
    if (a.completedAt && b.completedAt) {
      return a.completedAt.getTime() - b.completedAt.getTime();
    }
    // If one has completed and the other hasn't, the completed one ranks higher
    if (a.completedAt) return -1;
    if (b.completedAt) return 1;
    return 0;
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 32px 120px 32px' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px', borderBottom: '1px solid var(--color-hairline)', paddingBottom: '32px' }}>
        <h1 className="heading-2" style={{ color: 'var(--color-ink)' }}>Leaderboard</h1>
        <p className="body-lg" style={{ color: 'var(--color-slate)', marginTop: '16px' }}>See how you stack up against other learners.</p>
      </div>

      <Card variant="base" style={{ padding: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 150px 150px', padding: '24px 32px', borderBottom: '1px solid var(--color-hairline)', backgroundColor: '#fcfcfc', fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <div>Rank</div>
          <div>Learner</div>
          <div style={{ textAlign: 'right' }}>Certificates</div>
          <div style={{ textAlign: 'right' }}>Points</div>
        </div>
        
        {leaderboard.map((entry, index) => (
          <div 
            key={entry.id} 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '80px 1fr 150px 150px', 
              padding: '24px 32px', 
              borderBottom: index < leaderboard.length - 1 ? '1px solid var(--color-hairline)' : 'none',
              backgroundColor: entry.isCurrentUser ? 'rgba(168, 139, 105, 0.05)' : 'transparent',
              alignItems: 'center',
            }}
          >
            <div className="heading-3" style={{ color: index < 3 ? 'var(--color-primary-dark)' : 'var(--color-slate)', margin: 0 }}>
              #{index + 1}
            </div>
            <div className="body-md" style={{ display: 'flex', alignItems: 'center', gap: '16px', fontWeight: entry.isCurrentUser ? 600 : 400, color: 'var(--color-ink)', margin: 0 }}>
              {entry.name}
              {entry.isCurrentUser && <Badge style={{ padding: '4px 12px', fontSize: '0.85rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none' }}>You</Badge>}
            </div>
            <div className="body-md" style={{ textAlign: 'right', color: 'var(--color-ink)', margin: 0 }}>
              {entry.certificates}
            </div>
            <div className="body-md" style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
              {entry.points}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
