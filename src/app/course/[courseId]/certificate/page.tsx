import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getStudentSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function CertificatePage(props: { params: Promise<{ courseId: string }> }) {
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

  // Fetch the certificate
  const certificate = await prisma.certificate.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      }
    },
    include: {
      course: true
    }
  });

  if (!certificate) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 32px', textAlign: 'center' }}>
        <h1 className="heading-2">Certificate Not Found</h1>
        <p className="body-md" style={{ color: 'var(--color-slate)', marginTop: '16px' }}>
          You have not been issued a certificate for this course yet.
        </p>
        <Link href={`/course/${courseId}`} style={{ textDecoration: 'none', display: 'inline-block', marginTop: '32px' }}>
          <Button variant="primary">Return to Course</Button>
        </Link>
      </div>
    );
  }

  // The base URL for the verifier link. In production, this should be the actual domain.
  // For safety, we can use a relative path if the user copies it, but an absolute URL is better.
  // We'll construct it client-side or assume standard window.location in a client component, 
  // but since this is a server component, we'll provide the relative path and let the user copy the full URL.
  // Wait, we can use headers() to get the host!
  
  const headersList = await headers();
  const host = headersList.get('host') || 'aiwise.vercel.app';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const fullVerifierUrl = `${protocol}://${host}/verify/${certificate.verificationToken}`;
  
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '64px 32px 120px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="heading-1" style={{ color: 'var(--color-success)', marginBottom: '8px' }}>Congratulations!</h1>
          <p className="body-lg" style={{ color: 'var(--color-slate)' }}>
            You have successfully completed <strong>{certificate.course.title}</strong>.
          </p>
        </div>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Button variant="secondary">Go to Dashboard</Button>
        </Link>
      </div>

      <Card variant="base" style={{ padding: '32px', marginBottom: '48px', backgroundColor: '#fcfbf9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className="heading-3">Your Certificate</h2>
          <a href={`/api/certificate/${certificate.id}`} download={`AIWISE_Certificate_${certificate.id.substring(0, 8)}.pdf`} style={{ textDecoration: 'none' }}>
            <Button variant="primary" className="lg">Download PDF ↓</Button>
          </a>
        </div>
        
        {/* Certificate Preview */}
        <div style={{ width: '100%', height: '600px', border: '1px solid var(--color-hairline-strong)', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
          <iframe 
            src={`/api/certificate/${certificate.id}#toolbar=0&navpanes=0&scrollbar=0`} 
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Certificate Preview"
          />
        </div>
      </Card>

      <Card variant="base" style={{ padding: '32px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-primary)' }}>
        <h2 className="heading-3" style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>Official Verifier Link</h2>
        <p className="body-md" style={{ color: 'var(--color-slate)', marginBottom: '24px' }}>
          Share this unique verification link on your resume or LinkedIn profile. Anyone with this link can verify the authenticity of your certificate.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#f0f9ff', padding: '16px 24px', borderRadius: '8px', border: '1px dashed var(--color-primary)' }}>
          <code style={{ fontSize: '1.1rem', color: 'var(--color-ink)', wordBreak: 'break-all' }}>
            {fullVerifierUrl}
          </code>
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
          <a href={`/verify/${certificate.verificationToken}`} target="_blank" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">Test Verifier Link ↗</Button>
          </a>
        </div>
      </Card>
    </div>
  );
}
