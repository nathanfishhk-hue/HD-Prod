import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'email';
}

const LS_KEY = 'hd_auth_user_v1';
const CLIENT_ID_KEY = 'hd_google_client_id_v1';
const LOCAL_USERS_KEY = 'hd_local_users_v1';

interface LocalUserRec { id: string; name: string; email: string; pw: string; }

interface AuthCtx {
  user: AuthUser | null;
  signInWithGoogle: () => void;
  signUpWithEmail: (name: string, email: string, pw: string) => string | null;
  signInWithEmail: (email: string, pw: string) => string | null;
  signOut: () => void;
  clientId: string;
  setClientId: (id: string) => void;
}

const Ctx = createContext<AuthCtx>(null as any);
export const useAuth = () => useContext(Ctx);

declare global { interface Window { google?: any } }

function loadLocalUsers(): Record<string, LocalUserRec> {
  try { const s = localStorage.getItem(LOCAL_USERS_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
}
function saveLocalUsers(m: Record<string, LocalUserRec>) { try { localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(m)); } catch {} }
function hashId(email: string) { return 'em_' + btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g,'').slice(0,16) + '_' + email.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,6); }

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const DEFAULT_CLIENT_ID = '590497588669-3vpqju68u65ujb9r0vorkbvk87ihccm5.apps.googleusercontent.com';
  const [clientId, setClientIdState] = useState(() => {
    const env = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
    try { return env || localStorage.getItem(CLIENT_ID_KEY) || DEFAULT_CLIENT_ID; } catch { return env || DEFAULT_CLIENT_ID; }
  });

  const setClientId = (id: string) => { setClientIdState(id); try { localStorage.setItem(CLIENT_ID_KEY, id); } catch {} };

  useEffect(() => { if (user) localStorage.setItem(LS_KEY, JSON.stringify(user)); else localStorage.removeItem(LS_KEY); }, [user]);

  useEffect(() => {
    if (!clientId) return;
    if (document.getElementById('gsi-script')) return;
    const s = document.createElement('script'); s.id='gsi-script'; s.src='https://accounts.google.com/gsi/client'; s.async=true; s.defer=true; document.head.appendChild(s);
  }, [clientId]);

  const signInWithGoogle = () => {
    if (!clientId) { const demo: AuthUser = { id: 'demo-'+Date.now().toString(36), name:'Demo User', email:'demo@local', provider:'google', avatar:'' }; setUser(demo); return; }
    const google = (window as any).google;
    if (!google?.accounts?.id) { setTimeout(signInWithGoogle, 600); return; }
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (resp: any) => {
        try {
          const payload = JSON.parse(atob(resp.credential.split('.')[1]));
          const u: AuthUser = { id: payload.sub, name: payload.name || payload.email?.split('@')[0] || 'User', email: payload.email || '', avatar: payload.picture || '', provider:'google' };
          setUser(u);
        } catch { alert('Google sign-in failed — check Client ID / authorized origin.'); }
      },
      auto_select:false,
    });
    google.accounts.id.prompt((n:any)=>{ if(n.isNotDisplayed()||n.isSkippedMoment()){ google.accounts.id.renderButton(document.getElementById('gsi-hidden')!, {theme:'outline', size:'large'}); const btn=document.getElementById('gsi-hidden')?.querySelector('div[role="button"]') as HTMLElement; if(btn) btn.click(); else alert('Allow popups and ensure https://nathanfishhk-hue.github.io is in Google Cloud → Authorized JavaScript origins.'); }});
  };

  const signUpWithEmail = (name: string, email: string, pw: string): string | null => {
    email = email.trim().toLowerCase(); name=name.trim(); if(!email||!pw||!name) return 'Name, email, password required';
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email';
    if(pw.length < 6) return 'Password min 6 chars';
    const users = loadLocalUsers();
    if(users[email]) return 'Email already registered — use Sign In';
    const id = hashId(email);
    users[email] = { id, name, email, pw };
    saveLocalUsers(users);
    setUser({ id, name, email, provider:'email' });
    return null;
  };
  const signInWithEmail = (email: string, pw: string): string | null => {
    email=email.trim().toLowerCase(); if(!email||!pw) return 'Email + password required';
    const users = loadLocalUsers();
    const rec = users[email];
    if(!rec) return 'No account for this email — Sign Up first';
    if(rec.pw !== pw) return 'Wrong password';
    setUser({ id: rec.id, name: rec.name, email: rec.email, provider:'email' });
    return null;
  };

  const signOut = () => { try{(window as any).google?.accounts?.id?.disableAutoSelect?.();}catch{} setUser(null); };

  return <Ctx.Provider value={{ user, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut, clientId, setClientId }}>{children}</Ctx.Provider>;
};
