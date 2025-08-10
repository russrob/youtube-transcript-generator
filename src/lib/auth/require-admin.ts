import { requireUser } from './require-user';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const { clerkUser, dbUser } = await requireUser();
  
  // Check if user has admin role in database
  // Note: You'll need to add a 'role' field to your User model
  const isAdmin = dbUser.email?.includes('@admin') || // Temporary admin check
                  process.env.ADMIN_EMAILS?.split(',').includes(dbUser.email || '');
  
  if (!isAdmin) {
    redirect('/dashboard?error=access-denied');
  }

  return {
    clerkUser,
    dbUser,
  };
}

export async function requireAdminJson() {
  try {
    const result = await requireAdmin();
    return { success: true, user: result };
  } catch (error) {
    return { 
      success: false, 
      error: 'Admin access required', 
      redirect: '/dashboard?error=access-denied' 
    };
  }
}