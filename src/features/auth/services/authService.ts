import { supabase } from '../../../lib/api/supabaseClient';
import type { LoginCredentials, RegisterCredentials } from '../types';

export const authService = {
  login: ({ email, password }: LoginCredentials) =>
    supabase.auth.signInWithPassword({ email, password }),

  register: async ({ email, password, full_name, phone }: RegisterCredentials) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name, phone } },
    });
    if (error) throw error;
    return data;
  },

  logout: () => supabase.auth.signOut(),

  forgotPassword: (email: string) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    }),

  updatePassword: (newPassword: string) =>
    supabase.auth.updateUser({ password: newPassword }),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    supabase.auth.onAuthStateChange(callback),
};
