'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from './ui/Button';

export function Navbar({ studentName, isAdmin }: { studentName?: string | null, isAdmin?: boolean }) {
  const { data: session } = useSession();

  const isUserAuthenticated = !!session?.user || !!studentName;
    <nav 
      role="navigation"
      aria-label="Main Navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        backgroundColor: 'rgba(250, 247, 242, 0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--color-hairline)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
        <Link 
          href={isUserAuthenticated ? "/dashboard" : "/"}
          aria-label="Home"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            backgroundColor: 'var(--color-ink)',
            color: 'var(--color-canvas)',
            textDecoration: 'none', 
            fontSize: '0.9rem',
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '1px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(74, 63, 53, 0.2)'
          }}
        >
          AIW
        </Link>
        {isUserAuthenticated && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/dashboard" className="body-md-medium" style={{ color: 'var(--color-ink)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
              Courses
            </Link>
            <Link href="/leaderboard" className="body-md-medium" style={{ color: 'var(--color-ink)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
              Leaderboard
            </Link>
            {session?.user?.role === 'ADMIN' && (
              <Link href="/admin" className="body-md-medium" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}>
                Admin
              </Link>
            )}
          </div>
        )}
      </div>

      <div>
        {isUserAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span 
              className="body-sm-medium" 
              aria-label="Current User" 
              style={{ 
                color: 'var(--color-ink)', 
                backgroundColor: 'var(--color-surface)', 
                padding: '6px 12px', 
                borderRadius: '999px',
                border: '1px solid var(--color-hairline-strong)',
                fontSize: '0.85rem'
              }}
            >
              {studentName || session?.user?.name || session?.user?.email}
            </span>
            {session?.user?.role === 'ADMIN' && (
              <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: '/login' })} aria-label="Log out" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                Logout
              </Button>
            )}
          </div>
        ) : (
          <Link href="/student-login">
            <Button variant="primary" size="sm" aria-label="Log in" style={{ padding: '8px 24px' }}>Start Learning</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
