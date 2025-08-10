import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function requireUser() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Bootstrap user in database if they don't exist
  const dbUser = await prisma.user.upsert({
    where: {
      id: user.id,
    },
    update: {
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || 'User',
      updatedAt: new Date(),
    },
    create: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || user.lastName || 'User',
    },
  });

  return {
    clerkUser: user,
    dbUser,
  };
}

export async function requireUserJson() {
  try {
    const result = await requireUser();
    return { success: true, user: result };
  } catch (error) {
    return { 
      success: false, 
      error: 'Authentication required', 
      redirect: '/sign-in' 
    };
  }
}