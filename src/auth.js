import { supabase } from './supabaseClient';

export async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Create user profile in our `users` table with gamification fields
  if (data.user) {
    await supabase.from('users').insert({
      id: data.user.id,
      username,
      email,
      xp: 0,
      level: 1,
      badge: 'Rookie Coder',
      badge_description: 'Complete challenges to earn badges',
      preferred_mode: 'Classic'
    });
  }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function checkIfAdmin(userId) {
  const { data, error } = await supabase
    .from('admin')
    .select('id')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
    console.error('Error checking admin status:', error);
    return false;
  }
  
  return !!data; // Returns true if admin record exists, false otherwise
}

export async function signOut() {
  await supabase.auth.signOut();
}
