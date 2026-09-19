import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

export async function getStudentSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get('student_device_id')?.value;

  if (!deviceId) {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { deviceId },
    });
    
    // Admins shouldn't use this session method, but just in case
    if (user?.role === 'ADMIN') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Failed to get student session:', error);
    return null;
  }
}
