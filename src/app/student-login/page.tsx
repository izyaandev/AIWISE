'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function StudentLoginPage() {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !className.trim() || !section.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, className, section }),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to dashboard, which will bypass NextAuth because we use getStudentSession
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Failed to enter course');
        setLoading(false);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '16px', backgroundColor: '#fcfbf9' }}>
      <Card variant="base" style={{ width: '100%', maxWidth: '450px', padding: '48px', cursor: 'default' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="heading-2" style={{ color: 'var(--color-ink)' }}>Welcome Student</h1>
          <p className="body-md" style={{ color: 'var(--color-slate)', marginTop: '8px' }}>
            Enter your details to begin your AI journey.
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '24px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="name" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-ink)' }}>
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mohammed Izyaan"
              required
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--color-hairline-strong)',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label htmlFor="className" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-ink)' }}>
                Grade / Class
              </label>
              <input
                id="className"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. 10"
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-hairline-strong)',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <label htmlFor="section" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-ink)' }}>
                Section
              </label>
              <input
                id="section"
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A"
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-hairline-strong)',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              />
            </div>
          </div>

          <Button 
            variant="primary" 
            className="lg" 
            style={{ width: '100%', marginTop: '16px' }}
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Start Learning'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
