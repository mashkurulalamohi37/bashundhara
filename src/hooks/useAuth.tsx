import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import { authService } from "@/services/authService";
import type { AppUser, Role } from "@/types";

interface AuthValue {
  user: AppUser | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<AppUser>;
  loginAs: (role: Role) => Promise<AppUser>;
  logout: () => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(authService.restore());
    setReady(true);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const u = await authService.login(identifier, password);
    authService.persist(u);
    setUser(u);
    return u;
  }, []);

  const loginAs = useCallback(async (role: Role) => {
    const u = await authService.loginAs(role);
    authService.persist(u);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    authService.persist(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      ready,
      isAuthenticated: !!user,
      login,
      loginAs,
      logout,
      hasRole: (roles) => (user ? roles.includes(user.role) : false),
    }),
    [user, ready, login, loginAs, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}