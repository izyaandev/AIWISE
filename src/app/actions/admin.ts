'use server'

import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return (session.user as any).id;
}

export async function deleteUser(userId: string) {
  await checkAdmin();

  // Protect against deleting the main admin
  const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
  if (userToDelete?.role === 'ADMIN') {
    throw new Error('Cannot delete admin accounts');
  }

  await prisma.user.delete({
    where: { id: userId }
  });

  revalidatePath('/admin');
}

export async function createCourse(formData: FormData) {
  await checkAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const syllabus = formData.get('syllabus') as string;
  const modulesJson = formData.get('modulesJson') as string;
  let parsedModules: any[] = [];
  try {
    if (modulesJson) {
      parsedModules = JSON.parse(modulesJson);
    }
  } catch (e) {
    throw new Error('Invalid curriculum format');
  }

  await prisma.course.create({
    data: {
      title,
      description,
      syllabus,
      modules: {
        create: parsedModules.map((m, mIndex) => ({
          title: m.title || `Module ${mIndex + 1}`,
          order: mIndex + 1,
          lessons: {
            create: m.lessons.map((l: any, lIndex: number) => ({
              title: l.title || `Lesson ${lIndex + 1}`,
              content: l.content || '...',
              order: lIndex + 1,
              minimumDwellTime: 5,
            }))
          }
        }))
      }
    }
  });

  revalidatePath('/admin');
  redirect('/admin');
}

export async function bulkCreateUsers(
  entries: { email: string; password: string }[]
): Promise<{ created: string[]; skipped: string[]; errors: string[] }> {
  await checkAdmin();

  const created: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const entry of entries) {
    const email = entry.email.trim().toLowerCase();
    const password = entry.password.trim();

    if (!email || !email.includes('@')) {
      errors.push(email || '(empty)');
      continue;
    }

    if (!password || password.length < 6) {
      errors.push(`${email} (password too short — min 6 chars)`);
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      skipped.push(email);
      continue;
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          passwordHash,
          role: 'STUDENT',
        },
      });
      created.push(email);
    } catch {
      errors.push(email);
    }
  }

  revalidatePath('/admin');
  return { created, skipped, errors };
}
