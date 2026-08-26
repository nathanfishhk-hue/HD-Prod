import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SignInPage: React.FC = () => {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, clientId, setClientId } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [draft, setDraft] = useState(clientId);
  const [mode, setMode] = useState<'signin'|'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const handleEmail = () => {
    setErr('');
    const e = mode==='signup' ? signUpWithEmail(name, email, pw) : signInWithEmail(email, pw);
    if(e) setErr(e);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans">
      <div id="gsi-hidden" className="hidden" />
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-14 h-14 rounded bg-red-950 border border-red-600 flex items-center justify-center font-bebas text-2xl font-bold text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]">HD</div>
          <h1 className="font-bebas text-3xl tracking-wider text-zinc-100">HEAVY DUTY <span className="text-red-600">RECOMP</span></h1>
          <p className="text-xs font-mono-code text-zinc-500">HIT • REGULAR • 6-WK • MENTZER • YATES • JONES</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-2xl">
          <h2 className="font-bebas text-xl text-zinc-100 tracking-wider mb-1">SIGN IN TO CONTINUE</h2>
          <p className="text-xs font-mono-code text-zinc-500 mb-4">Google or email — each account isolated, nothing clashes.</p>

          <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-full py-3 font-mono-code font-bold text-sm transition">
            <span className="w-5 h-5 rounded-full bg-white border border-zinc-300 flex items-center justify-center text-[13px] font-bold text-zinc-700">G</span>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-[11px] font-mono-code text-zinc-500">OR</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <div className="flex bg-zinc-950 border border-zinc-800 rounded-full p-1 mb-3">
            <button onClick={()=>{setMode('signin'); setErr('');}} className={`flex-1 py-1.5 rounded-full text-xs font-mono-code font-bold ${mode==='signin'?'bg-zinc-800 text-zinc-100':'text-zinc-500'}`}>Sign In</button>
            <button onClick={()=>{setMode('signup'); setErr('');}} className={`flex-1 py-1.5 rounded-full text-xs font-mono-code font-bold ${mode==='signup'?'bg-zinc-800 text-zinc-100':'text-zinc-500'}`}>Sign Up</button>
          </div>

          <div className="space-y-2">
            {mode==='signup' && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono-code text-zinc-100 placeholder:text-zinc-600" />}
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (any provider)" type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono-code text-zinc-100 placeholder:text-zinc-600" />
            <input value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password (min 6)" type="password" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm font-mono-code text-zinc-100 placeholder:text-zinc-600" />
            {err && <div className="text-xs font-mono-code text-red-400 bg-red-950/40 border border-red-800 rounded px-2 py-1.5">{err}</div>}
            <button onClick={handleEmail} className="w-full bg-red-600 hover:bg-red-700 text-white rounded-full py-3 font-mono-code font-bold text-sm">
              {mode==='signup' ? 'Create account' : 'Sign in with Email'}
            </button>
            <p className="text-[10px] font-mono-code text-zinc-600 text-center">Email accounts stored locally on this device (offline). Use Google for cross-device sync later.</p>
          </div>

          <div className="mt-4 text-center">
            <button onClick={() => setShowSetup(v => !v)} className="text-[11px] font-mono-code text-zinc-600 hover:text-zinc-300 underline">Google Client ID setup</button>
          </div>
          {showSetup && (
            <div className="mt-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
              <p className="text-[11px] font-mono-code text-zinc-400">If Google fails: ensure origin <span className="text-sky-400">https://nathanfishhk-hue.github.io</span> in Google Cloud → Credentials → OAuth Client → Authorized JavaScript origins.</p>
              <div className="flex gap-1.5">
                <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="xxx.apps.googleusercontent.com" className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono-code text-zinc-200" />
                <button onClick={() => { setClientId(draft.trim()); alert('Saved.'); }} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono-code font-bold text-zinc-200">Save</button>
              </div>
            </div>
          )}
        </div>
        <p className="text-[10px] font-mono-code text-zinc-600 text-center mt-4">PWA works offline after first sign-in. Each email/Google isolated via <span className="text-zinc-400">hit_*_{'{id}'}</span>.</p>
      </div>
    </div>
  );
};
