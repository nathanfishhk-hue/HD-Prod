import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const SignInPage: React.FC = () => {
  const { signInWithGoogle, clientId, setClientId } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [draft, setDraft] = useState(clientId);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans">
      {/* Hidden GIS button mount */}
      <div id="gsi-hidden" className="hidden" />
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded bg-red-950 border border-red-600 flex items-center justify-center font-bebas text-2xl font-bold text-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]">HD</div>
          <h1 className="font-bebas text-3xl tracking-wider text-zinc-100">HEAVY DUTY <span className="text-red-600">RECOMP</span></h1>
          <p className="text-xs font-mono-code text-zinc-500">HIT • REGULAR • 6-WK • MENTZER • YATES • JONES</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 shadow-2xl">
          <h2 className="font-bebas text-xl text-zinc-100 tracking-wider mb-1">SIGN IN TO CONTINUE</h2>
          <p className="text-xs font-mono-code text-zinc-500 mb-4">Each Google account gets its own isolated profile — nothing clashes.</p>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-full py-3 font-mono-code font-bold text-sm transition"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="G" className="w-5 h-5 hidden" />
            <span className="w-5 h-5 rounded-full bg-white border border-zinc-300 flex items-center justify-center text-[13px] font-bold text-zinc-700">G</span>
            Continue with Google
          </button>

          <div className="mt-3 text-center">
            <button onClick={() => setShowSetup(v => !v)} className="text-[11px] font-mono-code text-zinc-500 hover:text-zinc-300 underline">
              {showSetup ? 'Hide setup' : 'Setup Google Client ID'}
            </button>
          </div>

          {showSetup && (
            <div className="mt-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
              <p className="text-[11px] font-mono-code text-zinc-400 leading-relaxed">
                <b className="text-zinc-200">One-time setup (free):</b><br/>
                1) console.cloud.google.com → New Project → APIs → OAuth consent → External<br/>
                2) Credentials → Create OAuth Client ID → Web → Add origin: <span className="text-sky-400">https://nathanfishhk-hue.github.io</span> (+ http://localhost:5173 for dev)<br/>
                3) Paste Client ID below. Set <span className="text-amber-300">VITE_GOOGLE_CLIENT_ID</span> in env for production instead.
              </p>
              <div className="flex gap-1.5">
                <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="xxx.apps.googleusercontent.com" className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono-code text-zinc-200" />
                <button onClick={() => { setClientId(draft.trim()); alert('Saved. Tap Google sign-in again.'); }} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-xs font-mono-code font-bold text-zinc-200">Save</button>
              </div>
              {!clientId && <p className="text-[11px] font-mono-code text-amber-400">No ID yet → Google button creates local demo user. Add ID to get real Google accounts.</p>}
            </div>
          )}

          <p className="text-[10px] font-mono-code text-zinc-600 mt-3 text-center">By continuing you agree to local storage of your profile. PWA offline still works after first sign-in.</p>
        </div>

        <p className="text-[10px] font-mono-code text-zinc-600 text-center mt-4">Need help? Share your Google Client ID after creating it.</p>
      </div>
    </div>
  );
};
