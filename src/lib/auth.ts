import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side auth verification for API routes
export async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'No authorization header provided' };
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return { user: null, error: 'Invalid or expired token' };
    }

    return { user, error: null };
  } catch (error) {
    return { user: null, error: 'Auth verification failed' };
  }
}

// Client-side auth hook
export function useAuth() {
  // This will be implemented by the frontend team
  // Returns current user session from Supabase
  return {
    user: null,
    loading: true,
    signIn: () => {},
    signOut: () => {}
  };
}