'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api, setToken, getToken } from './api';

const Ctx = createContext({
  user: null, loading: true, cloudinaryConfigured: true,
  login: async () => {}, logout: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cloudinaryConfigured, setCloudinaryConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!getToken()) { setLoading(false); return; }
      try {
        const data = await api.me();
        if (!cancelled) {
          setUser(data.user);
          setCloudinaryConfigured(data.cloudinary_configured !== false);
        }
      } catch {
        setToken(null);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loading) return;
    const isLogin = pathname === '/login';
    if (!user && !isLogin) router.replace('/login');
    if (user && isLogin) router.replace('/');
  }, [user, loading, pathname, router]);

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password);
    setToken(data.token);
    setUser(data.user);
    router.replace('/');
  }, [router]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    router.replace('/login');
  }, [router]);

  return (
    <Ctx.Provider value={{ user, loading, cloudinaryConfigured, login, logout }}>{children}</Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
