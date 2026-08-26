import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Plus, Key, Eye, EyeOff, X, MessageCircle } from 'lucide-react';
import { useHitStorage } from '../../hooks/useHitStorage';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';
import { DEFAULT_WEEK_PHASES } from '../../data/defaultProgram';
import { WorkoutDayConfig, ExerciseDefinition } from '../../types/hit';

interface ChatMsg { role: 'user' | 'assistant'; content: string; programJson?: ParsedProgram | null }
interface ParsedProgram { name: string; description: string; days: { title: string; description?: string; exerciseNames: string[] }[]; weeks?: number }

const LS_KEY = 'hd_ai_key_v1';
const LS_MODEL = 'hd_ai_model_v1';
const LS_BASE = 'hd_ai_base_v1';

const SYSTEM_PROMPT = `You are HEAVY DUTY AI COACH - expert HIT program builder (Mentzer/Yates/Jones).
Rules:
- HIT: 1 working set to failure after 1-2 warmups, tempo 3/1/4, rest 2-3min, rest-pause 10-15s +1-2 reps, drop 20% on machines/cables in Overload/Peak, double progression +2.5-5kg, <60min, 3x/week default but adapt to user's days.
- If user unsure, ASK one question at a time: goal, days/week, injuries/ankle, equipment (small gym = NO Nautilus, use cables/dumbbells), experience, favorite/hated muscles, time per session. Never assume.
- Available exercises (MUST use ONLY these names exactly): ${EXERCISE_LIBRARY.map(e=>e.name).join(', ')}.
- When ready to build, output JSON block:
\`\`\`json
{"name":"MY CUSTOM PROGRAM","description":"...","days":[{"title":"DAY A: CHEST & BACK","description":"...","exerciseNames":["Pec Deck Fly","Incline Barbell Press 30deg","Dumbbell Pullover","Chest-Supported Row","Rack Pull (Knee Height)"]}]}
\`\`\`
- 3-6 days, 4-6 exercises per day, ankle-safe if needed, 6 weeks standard phases.
- Never replace existing programs.
- Concise brutalist tone.`;

function parseProgram(text: string): ParsedProgram | null {
  const m = text.match(/```json\s*([\s\S]*?)```/);
  if (!m) return null;
  try { const j = JSON.parse(m[1]); if (j.name && Array.isArray(j.days)) return j as ParsedProgram; } catch {}
  return null;
}

export const FloatingAIChat: React.FC<{ storage: ReturnType<typeof useHitStorage> }> = ({ storage }) => {
  const { exerciseLibrary, createProgram } = storage;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>(() => {
    const s = localStorage.getItem('hd_ai_history_v2');
    if (s) try { return JSON.parse(s); } catch {}
    return [{ role: 'assistant', content: 'Yo — I\'m your Heavy Duty AI Coach. Tell me your goal, days/week, injuries, and what you love/hate. Say "not sure" and I\'ll ask one at a time. I\'ll build a brand NEW program for Builder — never touching HD RECOMP 6-WK.' }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(LS_KEY) || '');
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem(LS_BASE) || 'https://api.openai.com/v1');
  const [model, setModel] = useState(() => localStorage.getItem(LS_MODEL) || 'gpt-4o-mini');
  const [showKey, setShowKey] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ localStorage.setItem('hd_ai_history_v2', JSON.stringify(messages.slice(-30))); },[messages]);
  useEffect(()=>{ chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); },[messages, loading]);
  useEffect(()=>{ localStorage.setItem(LS_KEY, apiKey); },[apiKey]);
  useEffect(()=>{ localStorage.setItem(LS_BASE, baseUrl); },[baseUrl]);
  useEffect(()=>{ localStorage.setItem(LS_MODEL, model); },[model]);

  const send = async () => {
    const t = input.trim();
    if (!t || loading) return;
    if (!apiKey.trim()) { alert('Paste OpenAI API key first (stored locally). Get at https://platform.openai.com/api-keys'); return; }
    const userMsg: ChatMsg = { role: 'user', content: t };
    setMessages(p=>[...p, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl.replace(/\/$/,'')}/chat/completions`, {
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey.trim()}`},
        body: JSON.stringify({ model, messages:[{role:'system',content:SYSTEM_PROMPT}, ...[...messages, userMsg].map(m=>({role:m.role, content:m.content}))], temperature:0.7, max_tokens:1800 })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `API ${res.status}`);
      const reply = data.choices?.[0]?.message?.content || 'No reply.';
      const parsed = parseProgram(reply);
      setMessages(p=>[...p, {role:'assistant', content:reply, programJson: parsed}]);
    } catch(e:any){ setMessages(p=>[...p,{role:'assistant', content:`⚠️ ${e.message}. Check key/base/model.`}]); }
    finally{ setLoading(false); }
  };

  const saveNew = (p: ParsedProgram) => {
    const days: WorkoutDayConfig[] = p.days.map((d, idx)=>{
      const key = String.fromCharCode(65+idx);
      const exs: ExerciseDefinition[] = d.exerciseNames.map(name=>{
        const f = exerciseLibrary.find(e=>e.name.toLowerCase()===name.toLowerCase()) || EXERCISE_LIBRARY.find(e=>e.name.toLowerCase()===name.toLowerCase());
        if(!f) throw new Error(`Unknown exercise "${name}"`);
        return f;
      });
      return { dayKey:key, title:d.title.toUpperCase(), subtitle: d.description?.slice(0,40)||'AI Built', description: d.description||d.title, exercises: exs };
    });
    const weeks = DEFAULT_WEEK_PHASES.slice(0, p.weeks||6);
    const name = (p.name||`AI PROGRAM ${new Date().toLocaleDateString()}`).toUpperCase();
    const newId = createProgram(name, p.description||'AI Coach HIT 3/1/4', undefined);
    const raw = localStorage.getItem('hit_programs_v4');
    if(raw){
      try{
        const progs = JSON.parse(raw);
        if(progs[newId]){ progs[newId].days = days; progs[newId].weeks = weeks; progs[newId].name = name; progs[newId].description = p.description||progs[newId].description; localStorage.setItem('hit_programs_v4', JSON.stringify(progs)); storage.switchProgram(newId); setTimeout(()=>window.location.reload(), 400); return; }
      }catch{}
    }
    storage.switchProgram(newId);
    alert(`Created "${name}" with ${days.length} days. Check BUILDER.`);
    setOpen(false);
  };

  return (
    <>
      {/* Floating circle */}
      <button onClick={()=>setOpen(v=>!v)} className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_4px_24px_rgba(192,38,211,0.5)] flex items-center justify-center border-2 border-fuchsia-400/50 transition" aria-label="AI Coach">
        {open ? <X className="w-6 h-6"/> : <Bot className="w-7 h-7"/>}
      </button>
      {open && (
        <div className="fixed bottom-36 right-4 z-40 w-[92vw] max-w-[380px] h-[64vh] max-h-[560px] bg-zinc-950 border-2 border-fuchsia-800/60 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
          <div className="bg-fuchsia-950/40 border-b border-fuchsia-800/40 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-fuchsia-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white"/></div>
              <div>
                <div className="font-bebas text-sm text-fuchsia-300 tracking-wider">AI COACH</div>
                <div className="text-[10px] font-mono-code text-zinc-400">Builds NEW program → Builder</div>
              </div>
            </div>
            <button onClick={()=>setOpen(false)} className="p-1.5 bg-zinc-900 rounded-full text-zinc-400"><X className="w-4 h-4"/></button>
          </div>

          <div className="p-2 bg-zinc-900/50 border-b border-zinc-800 space-y-1">
            <div className="flex gap-1">
              <input type={showKey?'text':'password'} value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-... (stored locally)" className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs font-mono-code" />
              <button onClick={()=>setShowKey(v=>!v)} className="p-1.5 bg-zinc-800 rounded text-zinc-400">{showKey?<EyeOff className="w-3.5 h-3.5"/>:<Eye className="w-3.5 h-3.5"/>}</button>
            </div>
            <div className="flex gap-1">
              <input value={model} onChange={e=>setModel(e.target.value)} placeholder="gpt-4o-mini" className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] font-mono-code" />
              <input value={baseUrl} onChange={e=>setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-[11px] font-mono-code text-zinc-500" />
            </div>
            {!apiKey && <div className="text-[10px] font-mono-code text-amber-400 flex items-center gap-1"><Key className="w-3 h-3"/> Paste key to chat.</div>}
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-950">
            {messages.map((m,i)=>(
              <div key={i} className={`flex gap-2 ${m.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role==='user'?'bg-red-600 text-white rounded-br-sm':'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-sm'}`}>
                  <div className="flex items-center gap-1 mb-1 text-[10px] font-mono-code opacity-60">{m.role==='user'?<User className="w-3 h-3"/>:<Bot className="w-3 h-3"/>}{m.role.toUpperCase()}</div>
                  <div className="whitespace-pre-wrap break-words text-[13px]">{m.content.replace(/```json[\s\S]*?```/g, m.programJson?'✅ Program ready below.':'').trim()}</div>
                  {m.programJson && (
                    <div className="mt-3 bg-zinc-950 border border-fuchsia-800/60 rounded-lg p-2">
                      <div className="font-bebas text-fuchsia-400 flex items-center gap-1 text-sm"><Sparkles className="w-3.5 h-3.5"/>{m.programJson.name}</div>
                      <div className="text-xs text-zinc-400">{m.programJson.description}</div>
                      <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {m.programJson.days.map((d,idx)=><div key={idx} className="text-[11px] bg-zinc-900 rounded px-2 py-1 border border-zinc-800"><b>{d.title}</b> — {d.exerciseNames.join(' • ')}</div>)}
                      </div>
                      <button onClick={()=>saveNew(m.programJson!)} className="mt-2 w-full py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded font-mono-code font-bold text-xs flex items-center justify-center gap-1"><Plus className="w-4 h-4"/> ADD TO BUILDER (NEW)</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-2 text-xs font-mono-code text-zinc-500 animate-pulse">AI thinking...</div>}
          </div>

          <div className="p-2 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask to build program..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-fuchsia-700" />
            <button onClick={send} disabled={loading||!input.trim()} className="p-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40 text-white rounded-full"><Send className="w-4 h-4"/></button>
          </div>
        </div>
      )}
      {/* Hint pill when closed */}
      {!open && <div className="fixed bottom-20 right-[76px] z-40 hidden sm:flex items-center gap-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono-code px-2.5 py-1 rounded-full shadow"><MessageCircle className="w-3.5 h-3.5 text-fuchsia-400"/> AI Coach</div>}
    </>
  );
};
