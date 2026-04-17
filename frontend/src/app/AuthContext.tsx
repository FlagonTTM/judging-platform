import { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'admin' | 'judge' | 'team';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextValue {
  user: CurrentUser | null;
  setUser: (u: CurrentUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
