import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { name, className, section } = await req.json();

    if (!name || !className || !section) {
      return NextResponse.json({ error: 'Name, Class, and Section are required' }, { status: 400 });
    }

    // Generate a unique device ID
    const deviceId = uuidv4();

    // Create the student user in the database
    // We don't need email or passwordHash anymore
    const user = await prisma.user.create({
      data: {
        deviceId,
        name,
        className,
        section,
        role: 'STUDENT',
      },
    });

    // Set the cookie for future sessions
    // Max age: 10 years (effectively permanent for the device)
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'student_device_id',
      value: deviceId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10, 
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
