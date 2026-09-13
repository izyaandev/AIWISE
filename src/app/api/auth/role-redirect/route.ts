import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

// This route is hit after a successful login.
// Because it runs on the server, the session cookie is always ready — 
// no race condition like getSession() on the client.
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'));
  }

  const role = (session.user as any).role;

  if (role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'));
  }

  return NextResponse.redirect(new URL('/dashboard', process.env.NEXTAUTH_URL ?? 'http://localhost:3000'));
}
