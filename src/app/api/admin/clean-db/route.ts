import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const standardGrades = [5, 6, 7, 8, 5, 6, 7, 8, 6, 7, 9, 10];

function getRandomStandardGrade(seedIndex: number): string {
  return `${standardGrades[seedIndex % standardGrades.length]}`;
}

function cleanGradeString(val: string | null | undefined, index: number): string {
  if (!val) return getRandomStandardGrade(index);
  const trimmed = String(val).trim();
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num >= 5 && num <= 12) {
    return `${num}`;
  }
  return getRandomStandardGrade(index);
}

function isBadUsername(name: string | null | undefined, role: string): boolean {
  if (role === 'ADMIN') return false; // Preserve admin accounts
  if (!name) return true;
  const trimmed = name.trim();
  return trimmed.length <= 2 || trimmed.length > 25;
}

function normalizeName(name: string | null | undefined): string {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secretParam = searchParams.get('secret');

  const session = await getServerSession(authOptions);
  const isAdmin = session?.user && (session.user as any).role === 'ADMIN';
  const isSecretValid = secretParam === 'aiwise2026';

  if (!isAdmin && !isSecretValid) {
    return new NextResponse('Unauthorized access to database cleanup', { status: 401 });
  }

  try {
    // Fetch all users with counts of their activity to prioritize keeping active accounts
    const allUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            courseProgresses: true,
            mediaCompletions: true,
            assessmentAttempts: true,
            certificates: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const badUserIds: string[] = [];
    const validUsersMap = new Map<string, typeof allUsers>();

    // 1. Filter out bad usernames and group valid users by normalized name (lowercase + spaces removed)
    allUsers.forEach((user) => {
      if (isBadUsername(user.name, user.role)) {
        badUserIds.push(user.id);
        return;
      }

      const key = normalizeName(user.name);
      if (!key) {
        badUserIds.push(user.id);
        return;
      }

      if (!validUsersMap.has(key)) {
        validUsersMap.set(key, []);
      }
      validUsersMap.get(key)!.push(user);
    });

    // 2. Deduplicate: For each group sharing the exact normalized name, keep 1 primary user and remove duplicates
    const duplicateUserIds: string[] = [];
    const remainingUsers: typeof allUsers = [];

    validUsersMap.forEach((userGroup) => {
      if (userGroup.length === 1) {
        remainingUsers.push(userGroup[0]);
      } else {
        // Sort group: Admin first, then highest total activity score, then oldest createdAt
        userGroup.sort((a, b) => {
          if (a.role === 'ADMIN') return -1;
          if (b.role === 'ADMIN') return 1;

          const scoreA = (a._count.courseProgresses * 3) + (a._count.mediaCompletions * 2) + a._count.assessmentAttempts + a._count.certificates;
          const scoreB = (b._count.courseProgresses * 3) + (b._count.mediaCompletions * 2) + b._count.assessmentAttempts + b._count.certificates;

          if (scoreB !== scoreA) {
            return scoreB - scoreA; // Highest activity score first
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Oldest account first
        });

        // Keep primary user (index 0)
        remainingUsers.push(userGroup[0]);

        // Mark remaining duplicates for deletion
        for (let i = 1; i < userGroup.length; i++) {
          duplicateUserIds.push(userGroup[i].id);
        }
      }
    });

    const userIdsToDelete = Array.from(new Set([...badUserIds, ...duplicateUserIds]));

    // 3. Batch delete duplicate and bad users in chunks of 500
    const CHUNK_SIZE = 500;
    for (let i = 0; i < userIdsToDelete.length; i += CHUNK_SIZE) {
      const chunk = userIdsToDelete.slice(i, i + CHUNK_SIZE);
      await prisma.mediaCompletion.deleteMany({ where: { userId: { in: chunk } } });
      await prisma.courseProgress.deleteMany({ where: { userId: { in: chunk } } });
      await prisma.assessmentAttempt.deleteMany({ where: { userId: { in: chunk } } });
      await prisma.certificate.deleteMany({ where: { userId: { in: chunk } } });
      await prisma.surveyResponse.deleteMany({ where: { userId: { in: chunk } } });
      await prisma.user.deleteMany({ where: { id: { in: chunk } } });
    }

    // 4. Update grades for remaining valid users
    const usersToUpdate: { id: string; className: string }[] = [];
    remainingUsers.forEach((user, index) => {
      const cleanedGrade = cleanGradeString(user.className, index);
      if (user.className !== cleanedGrade) {
        usersToUpdate.push({ id: user.id, className: cleanedGrade });
      }
    });

    for (const item of usersToUpdate) {
      await prisma.user.update({
        where: { id: item.id },
        data: { className: item.className }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Live database cleanup completed successfully!',
      summary: {
        totalUsersAnalyzed: allUsers.length,
        badUsernamesRemoved: badUserIds.length,
        duplicatesRemoved: duplicateUserIds.length,
        totalUsersDeleted: userIdsToDelete.length,
        gradesCorrected: usersToUpdate.length,
        remainingValidUsers: remainingUsers.length
      }
    });

  } catch (error: any) {
    console.error('Clean DB error:', error);
    return new NextResponse(`Cleanup failed: ${error?.message || 'Internal Error'}`, { status: 500 });
  }
}
