import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/services/api';
import { DEMO_SESSION_KEY, DEMO_USER } from '@/services/demoApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem(DEMO_SESSION_KEY) === 'true') {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('crm_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((response) => setUser(response.data.data))
      .catch(() => localStorage.removeItem('crm_token'))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => {
    const persist = (payload) => {
      localStorage.setItem('crm_token', payload.token);
      setUser(payload.user);
    };

    return {
      user,
      loading,
      setUser,
      async login(email, password) {
        if (email.toLowerCase() === DEMO_USER.email && password === 'Demo@123') {
          localStorage.removeItem('crm_token');
          localStorage.setItem(DEMO_SESSION_KEY, 'true');
          setUser(DEMO_USER);
          return DEMO_USER;
        }
        const { data } = await api.post('/auth/login', { email, password });
        persist(data);
        return data.user;
      },
      async register(payload) {
        const { data } = await api.post('/auth/register', payload);
        persist(data);
        return data.user;
      },
      logout() {
        localStorage.removeItem('crm_token');
        localStorage.removeItem(DEMO_SESSION_KEY);
        setUser(null);
      },
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
