import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google';
}

const LS_KEY = 'hd_auth_user_v1';
const CLIENT_ID_KEY = 'hd_google_client_id_v1';

interface AuthCtx {
  user: AuthUser | null;
  signInWithGoogle: () => void;
  signOut: () => void;
  clientId: string;
  setClientId: (id: string) => void;
}

const Ctx = createContext<AuthCtx>(null as any);
export const useAuth = () => useContext(Ctx);

declare global { interface Window { google?: any } }

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [clientId, setClientIdState] = useState(() => {
    // env takes precedence, then saved
    const env = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
    try { return env || localStorage.getItem(CLIENT_ID_KEY) || ''; } catch { return env; }
  });

  const setClientId = (id: string) => {
    setClientIdState(id);
    try { localStorage.setItem(CLIENT_ID_KEY, id); } catch {}
  };

  useEffect(() => {
    if (user) localStorage.setItem(LS_KEY, JSON.stringify(user));
    else localStorage.removeItem(LS_KEY);
  }, [user]);

  // load GIS script if clientId present
  useEffect(() => {
    if (!clientId) return;
    if (document.getElementById('gsi-script')) return;
    const s = document.createElement('script');
    s.id = 'gsi-script';
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, [clientId]);

  const signInWithGoogle = () => {
    if (!clientId) {
      alert('Add Google Client ID first (see setup below). Using demo sign-in for now.');
      // demo local user
      const demo: AuthUser = { id: 'demo-' + Date.now().toString(36), name: 'Demo User', email: 'demo@local', provider: 'google', avatar: '' };
      setUser(demo);
      return;
    }
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      // fallback demo while script loads
      setTimeout(signInWithGoogle, 600);
      return;
    }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp: any) => {
        try {
          const payload = JSON.parse(atob(resp.credential.split('.')[1]));
          const u: AuthUser = {
            id: payload.sub,
            name: payload.name || payload.email?.split('@')[0] || 'User',
            email: payload.email || '',
            avatar: payload.picture || '',
            provider: 'google',
          };
          setUser(u);
        } catch {
          alert('Google sign-in failed — check Client ID / authorized origin.');
        }
      },
      auto_select: false,
    });
    google.accounts.id.prompt((n: any) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        // fallback to popup
        google.accounts.id.renderButton(document.getElementById('gsi-hidden')!, { theme: 'outline', size: 'large' });
        // trigger click via One Tap fallback: show button
        const btn = document.getElementById('gsi-hidden')?.querySelector('div[role="button"]') as HTMLElement;
        if (btn) btn.click();
        else alert('Allow popups and ensure https://nathanfishhk-hue.github.io is in Google Cloud → Authorized JavaScript origins.');
      }
    });
  };

  const signOut = () => {
    try { (window as any).google?.accounts?.id?.disableAutoSelect?.(); } catch {}
    setUser(null);
  };

  return <Ctx.Provider value={{ user, signInWithGoogle, signOut, clientId, setClientId }}>{children}</Ctx.Provider>;
};
