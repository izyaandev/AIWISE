import { getServerSession } from 'next-auth';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { createCourse } from '@/app/actions/admin';

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '64px 32px' }}>
      <Link href="/admin" aria-label="Back to Admin Dashboard" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '32px', color: 'var(--color-slate)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--color-hairline)' }}>
        ← Cancel & Back
      </Link>

      <div style={{ marginBottom: '64px', backgroundColor: 'var(--color-surface)', padding: '48px', border: '1px solid var(--color-hairline)', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
        <h1 className="heading-2" style={{ marginBottom: '8px', color: 'var(--color-ink)' }}>Create New Course</h1>
        <p className="body-lg" style={{ color: 'var(--color-slate)', borderTop: '1px solid var(--color-hairline)', paddingTop: '16px' }}>Define the structure and core details of a new learning module.</p>
        
        <form action={createCourse} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="title" className="body-md" style={{ fontWeight: 600 }}>Course Title</label>
            <input 
              type="text" 
              name="title" 
              id="title" 
              required 
              placeholder="e.g. Advanced AI Safety"
              style={{ padding: '12px 16px', fontSize: '1rem', border: '1px solid var(--color-hairline-strong)', borderRadius: '6px', backgroundColor: 'var(--color-surface)' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="description" className="body-md" style={{ fontWeight: 600 }}>Description</label>
            <textarea 
              name="description" 
              id="description" 
              required 
              rows={4}
              placeholder="Provide a detailed overview of the curriculum..."
              style={{ padding: '12px 16px', fontSize: '1rem', border: '1px solid var(--color-hairline-strong)', borderRadius: '6px', backgroundColor: 'var(--color-surface)', resize: 'vertical' }}
            />
          </div>

          <Button type="submit" variant="primary" style={{ alignSelf: 'flex-start', padding: '12px 24px', marginTop: '16px' }}>Launch Course →</Button>
        </form>
      </div>
    </div>
  );
}
