import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import type { User } from './types';

const STORAGE_KEY = 'dealership.session';

interface Session { token: string; user: User }

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(() => {
    const s = loadSession();
    api.setToken(s?.token ?? null);
    return s;
  });

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    api.setToken(null);
    setSession(null);
  }, []);

  // If the API ever answers 401 (e.g. expired JWT) drop back to the login screen.
  useEffect(() => {
    api.onUnauthorized(logout);
    return () => api.onUnauthorized(null);
  }, [logout]);

  async function login(email: string, password: string) {
    const { token, user } = await api.login(email, password);
    api.setToken(token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    setSession({ token, user });
  }

  async function register(name: string, email: string, password: string) {
    await api.register(name, email, password);
    await login(email, password); // sign the new user straight in
  }

  return session ? <Dashboard user={session.user} onLogout={logout} /> : <AuthPage onLogin={login} onRegister={register} />;
}
