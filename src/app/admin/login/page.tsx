'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError('Invalid credentials. Please try again.');
        setLoading(false);
      } else {
        // Use router.push to /api/auth/redirect which checks role server-side
        // This avoids the race condition where getSession() fires before
        // the NextAuth cookie is fully written
        router.push('/admin');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-canvas)',
      padding: '32px',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23a88b69\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E")',
    }}>
      <Card variant="base" style={{ width: '100%', maxWidth: '450px', padding: '48px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="heading-3" style={{ marginBottom: '8px', color: 'var(--color-primary-dark)' }}>ADMIN LOGIN</h1>
          <p className="body-md" style={{ color: 'var(--color-slate)' }}>
            Log in with administrator credentials.
          </p>
        </div>
        
        {error && (
          <div role="alert" style={{
            backgroundColor: '#fef2f2',
            color: 'var(--color-error)',
            padding: '16px',
            border: '1px solid var(--color-error)',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="email" className="body-sm-medium" style={{ color: 'var(--color-ink)' }}>Email address</label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@school.edu"
              aria-required="true"
              required 
              style={{ width: '92%' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="password" className="body-sm-medium" style={{ color: 'var(--color-ink)' }}>Password</label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              aria-required="true"
              required 
              style={{ width: '92%' }}
            />
          </div>

          <Button type="submit" variant="primary" disabled={loading} style={{ marginTop: '16px', padding: '16px', fontSize: '1rem', width: '100%' }}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
