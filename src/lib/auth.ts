import React, { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

interface AuthContextType extends AuthState {
  signUp: () => Promise<void>;
  signUpSuperAdmin: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: () => Promise<void>;
  updatePassword: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Provide mock auth context that does nothing
  const mockAuthValue: AuthContextType = {
    user: null,
    loading: false,
    error: null,
    signUp: async () => {},
    signUpSuperAdmin: async () => {},
    signIn: async () => {},
    signOut: async () => {},
    resetPassword: async () => {},
    updatePassword: async () => {}
  };

  return React.createElement(AuthContext.Provider, { value: mockAuthValue }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
