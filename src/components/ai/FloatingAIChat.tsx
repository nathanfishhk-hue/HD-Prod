import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Plus, X, MessageCircle, Trash2, Zap } from 'lucide-react';
import { useHitStorage } from '../../hooks/useHitStorage';
import { EXERCISE_LIBRARY } from '../../data/exerciseLibrary';
import { DEFAULT_WEEK_PHASES } from '../../data/defaultProgram';
import { WorkoutDayConfig, ExerciseDefinition } from '../../types/hit';

interface ChatMsg { role: 'user' | 'assistant'; content: string; programJson?: ParsedProgram | null }
interface ParsedProgram { name: string; description: string; days: { title: string; description?: string; exerciseNames: string[] }[]; weeks?: number }

type Slots = {
  goal: string;
  days: number;
  style: '' | 'hit' | 'regular';
  experience: string;
  loves: string;
  hates: string;
};

const DEFAULT_SLOTS: Slots = { goal: '', days: 3, style: '', experience: 'Intermediate', loves: '', hates: '' };

function pickExercises(muscle: string, count: number, exclude: Set<string>): ExerciseDefinition[] {
  let pool = EXERCISE_LIBRARY.filter(e => e.muscleGroup === muscle);
  pool = pool.filter(e => !exclude.has(e.name));
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function buildFreeProgram(slots: Slots, nameOverride?: string): ParsedProgram {
  const d = slots.days;
  const goal = (slots.goal || 'recomp').toLowerCase();
  const isHit = slots.style === 'hit' || slots.style === '';
  const styleLabel = isHit ? 'HIT' : 'REGULAR';
  const styleDesc = isHit ? 'HIT 3/1/4, 1 set to failure + rest-pause/drop, <60min' : 'REGULAR 3-4 sets x 8-12, 90s rest, RPE 8-9, progressive overload';
  const hatesLegs = slots.hates.toLowerCase().includes('leg') || goal.includes('upper');
  const lovesChest = slots.loves.toLowerCase().includes('chest');
  const exclude = new Set<string>();
  const days: ParsedProgram['days'] = [];
  const titleFor = (i: number) => String.fromCharCode(65 + i);

  if (d === 3) {
    const chestCount = lovesChest ? 3 : 2;
    const chestEx = pickExercises('Chest', chestCount, exclude); chestEx.forEach(e=>exclude.add(e.name));
    const backEx = pickExercises('Lats/Back', 2, exclude); backEx.forEach(e=>exclude.add(e.name));
    days.push({ title: `DAY ${titleFor(0)}: CHEST & BACK`, description: isHit ? 'Pre-exhaust + compounds HIT 3/1/4' : 'Push/Pull compounds 3x8-12', exerciseNames: [...chestEx, ...backEx].map(e=>e.name) });
    const legN = hatesLegs ? 3 : 4;
    const legEx = pickExercises('Legs', legN, exclude); legEx.forEach(e=>exclude.add(e.name));
    const absEx = pickExercises('Abs', 1, exclude); absEx.forEach(e=>exclude.add(e.name));
    days.push({ title: `DAY ${titleFor(1)}: LEGS & ABS`, description: isHit ? 'HIT legs' : 'Legs + core 3x10-15', exerciseNames: [...legEx, ...absEx].map(e=>e.name) });
    const shEx = pickExercises('Shoulders', 2, exclude); shEx.forEach(e=>exclude.add(e.name));
    const biEx = pickExercises('Biceps', 1, exclude); biEx.forEach(e=>exclude.add(e.name));
    const triEx = pickExercises('Triceps', 1, exclude); triEx.forEach(e=>exclude.add(e.name));
    days.push({ title: `DAY ${titleFor(2)}: SHOULDERS & ARMS`, description: isHit ? 'Delts + arms to failure' : 'Shoulders + arms volume', exerciseNames: [...shEx, ...biEx, ...triEx].map(e=>e.name) });
  } else if (d === 4) {
    const a = pickExercises('Chest', 2, exclude); a.forEach(e=>exclude.add(e.name));
    const a2 = pickExercises('Triceps', 1, exclude); a2.forEach(e=>exclude.add(e.name));
    days.push({ title: `DAY ${titleFor(0)}: CHEST & TRICEPS`, description: isHit ? 'Push HIT' : 'Push 3x8-12', exerciseNames: [...a, ...a2].map(e=>e.name) });
    const b = pickExercises('Lats/Back', 2, exclude); b.forEach(e=>exclude.add(e.name));
    const b2 = pickExercises('Biceps', 1, exclude); b2.forEach(e=>exclude.add(e.name));
    days.push({ title: `DAY ${titleFor(1)}: BACK & BICEPS`, description: isHit ? 'Pull HIT' : 'Pull 3x8-12', exerciseNames: [...b, ...b2].map(e=>e.name) });
    const c = pickExercises('Legs', hatesLegs ? 2 : 3, exclude); c.forEach(e=>exclude.add(e.name));
    const c2 = pickExercises('Abs', 1, exclude); c2.forEach(e=>exclude.add(e.name));
    days.push({ title: `DAY ${titleFor(2)}: LEGS & ABS`, description: 'Legs', exerciseNames: [...c, ...c2].map(e=>e.name) });
    const sh = pickExercises('Shoulders', 2, exclude); sh.forEach(e=>exclude.add(e.name));
    days.push({ title: `DAY ${titleFor(3)}: SHOULDERS & ARMS`, description: 'Delta pump', exerciseNames: sh.map(e=>e.name) });
  } else if (d <= 2) {
    const allChest = pickExercises('Chest', 2, exclude); allChest.forEach(e=>exclude.add(e.name));
    const allBack = pickExercises('Lats/Back', 2, exclude); allBack.forEach(e=>exclude.add(e.name));
    const allLegs = pickExercises('Legs', hatesLegs ? 2 : 3, exclude);
    days.push({ title: `DAY ${titleFor(0)}: FULL BODY A`, description: isHit ? 'Compound HIT' : 'Full body heavy', exerciseNames: [...allChest, ...allBack, ...allLegs].map(e=>e.name) });
    const sh = pickExercises('Shoulders', 1, exclude);
    const arms = [...pickExercises('Biceps', 1, exclude), ...pickExercises('Triceps', 1, exclude)];
    days.push({ title: `DAY ${titleFor(1)}: FULL BODY B`, description: 'Shoulders + arms + abs', exerciseNames: [...sh, ...arms, ...pickExercises('Abs', 1, exclude)].map(e=>e.name) });
  } else {
    days.push({ title: `DAY ${titleFor(0)}: CHEST`, description: isHit ? 'Chest HIT' : 'Chest volume', exerciseNames: pickExercises('Chest', 3, exclude).map(e=>e.name) });
    days.push({ title: `DAY ${titleFor(1)}: BACK`, description: isHit ? 'Back HIT' : 'Back volume', exerciseNames: pickExercises('Lats/Back', 3, exclude).map(e=>e.name) });
    days.push({ title: `DAY ${titleFor(2)}: LEGS`, description: 'Legs', exerciseNames: [...pickExercises('Legs', 3, exclude), ...pickExercises('Abs', 1, exclude)].map(e=>e.name) });
    days.push({ title: `DAY ${titleFor(3)}: SHOULDERS`, description: 'Delts', exerciseNames: pickExercises('Shoulders', 3, exclude).map(e=>e.name) });
    if (d >= 5) days.push({ title: `DAY ${titleFor(4)}: ARMS`, description: 'Bis + tris', exerciseNames: [...pickExercises('Biceps', 2, exclude), ...pickExercises('Triceps', 2, exclude)].map(e=>e.name) });
    if (d >= 6) days.push({ title: `DAY ${titleFor(5)}: CHEST & BACK PUMP`, description: 'Weak point', exerciseNames: [...pickExercises('Chest', 1, exclude), ...pickExercises('Lats/Back', 1, exclude), ...pickExercises('Abs', 1, exclude)].map(e=>e.name) });
  }

  const base = goal.includes('strength') ? 'STRENGTH' : goal.includes('hypertrophy') || goal.includes('muscle') ? 'HYPERTROPHY' : 'RECOMP';
  const name = (nameOverride || `${base} ${d}X ${styleLabel}`).toUpperCase();
  const desc = `${d}x/week ${styleDesc}. ${slots.loves ? `Loves ${slots.loves}. ` : ''}${slots.hates ? `Hates ${slots.hates}.` : ''}`.trim();
  return { name, description: desc, days, weeks: 6 };
}

function parseSlotsFromText(text: string, cur: Slots): { slots: Slots; answered: string[] } {
  const t = text.toLowerCase();
  const next = { ...cur };
  const answered: string[] = [];
  if (/\b(3|4|5|6)\s*x?\s*(day|per week|times)/.test(t) || /\b(3|4|5|6) days?\b/.test(t)) {
    const m = t.match(/\b(3|4|5|6)\b/); if (m) { next.days = parseInt(m[0], 10); answered.push('days'); }
  } else if (t.includes('2 day') || t.includes('twice')) { next.days = 2; answered.push('days'); }
  if (t.includes('recomp')) { next.goal = 'recomp'; answered.push('goal'); }
  else if (t.includes('strength')) { next.goal = 'strength'; answered.push('goal'); }
  else if (t.includes('hypertrophy') || t.includes('muscle') || t.includes('size')) { next.goal = 'hypertrophy'; answered.push('goal'); }
  else if (t.includes('fat loss') || t.includes('cut')) { next.goal = 'recomp'; answered.push('goal'); }
  if (t.includes('hit') || t.includes('heavy duty') || t.includes('failure') || t.includes('mentzer') || t.includes('yates')) { next.style = 'hit'; answered.push('style'); }
  else if (t.includes('regular') || t.includes('normal') || t.includes('classic') || t.includes('volume') || t.includes('traditional') || t.includes('3x') || t.includes('4x')) { next.style = 'regular'; answered.push('style'); }
  if (t.includes('beginner')) { next.experience = 'Beginner'; answered.push('exp'); }
  else if (t.includes('advanced')) { next.experience = 'Advanced'; answered.push('exp'); }
  else if (t.includes('intermediate')) { next.experience = 'Intermediate'; answered.push('exp'); }
  if (t.includes('love') || t.includes('like') || t.includes('prefer')) { next.loves = text.slice(0, 60); answered.push('loves'); }
  if (t.includes('hate') || t.includes('dislike')) { next.hates = text.slice(0, 60); answered.push('hates'); }
  return { slots: next, answered };
}

export const FloatingAIChat: React.FC<{ storage: ReturnType<typeof useHitStorage> }> = ({ storage }) => {
  const { exerciseLibrary, createProgram } = storage;
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<Slots>(DEFAULT_SLOTS);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [messages, setMessages] = useState<ChatMsg[]>([{ role: 'assistant', content: 'Yo — Heavy Duty AI Coach (FREE, no key needed). I build a brand NEW program for Builder — never touching HD RECOMP 6-WK.\n\nI cover HIT (1 set to failure, 3/1/4) AND Regular (3-4 sets volume). Tell me what you want, or say "not sure" and I\'ll ask one at a time.\n\nTry: "Build me 4-day HIT recomp, love chest" or "Build me regular 5-day hypertrophy"' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const questions = [
    'HIT style or Regular? (HIT = 1 set to failure, 3/1/4 tempo · Regular = 3-4 sets x 8-12, classic volume)',
    'What\'s your goal? (recomp / strength / hypertrophy)',
    'How many days/week can you train? (2-6, default 3)',
    'Experience? (beginner / intermediate / advanced)',
    'What do you LOVE training? (e.g. chest, back, arms)',
    'What do you HATE? (e.g. legs)',
  ];

  useEffect(()=>{ chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }); },[messages, loading]);

  const askNext = (s: Slots, idx: number) => {
    if (idx < questions.length) {
      setMessages(p=>[...p, { role: 'assistant', content: questions[idx] }]);
      setQuestionIdx(idx+1);
    } else {
      const prog = buildFreeProgram(s);
      setMessages(p=>[...p, { role: 'assistant', content: `Got it — ${s.days}x/week ${s.goal || 'recomp'} ${s.style.toUpperCase() || 'HIT'}. Built below.`, programJson: prog }]);
    }
  };

  const handleSend = () => {
    const t = input.trim();
    if (!t || loading) return;
    setInput('');
    setMessages(p=>[...p, { role: 'user', content: t }]);
    setLoading(true);
    setTimeout(()=>{
      const low = t.toLowerCase();
      const isNotSure = low.includes('not sure') || low.includes('unsure') || low === 'help';
      const wantsBuild = low.includes('build') || low.includes('create') || low.includes('make') || low.includes('program') || low.includes('workout');

      if (isNotSure && questionIdx === 0) {
        setMessages(p=>[...p, { role: 'assistant', content: questions[0] }]);
        setQuestionIdx(1);
        setLoading(false);
        return;
      }

      const { slots: parsed } = parseSlotsFromText(t, slots);
      const merged = { ...slots, ...parsed };

      if (wantsBuild) {
        const finalSlots: Slots = {
          goal: merged.goal || 'recomp',
          days: merged.days || 3,
          style: (merged.style as Slots['style']) || (low.includes('regular') ? 'regular' : 'hit'),
          experience: merged.experience || 'Intermediate',
          loves: merged.loves || slots.loves,
          hates: merged.hates || slots.hates,
        };
        // if still no style and user didn't state, ask style explicitly
        if (!parsed.style && !low.includes('hit') && !low.includes('regular') && !low.includes('heavy duty')) {
          setSlots(finalSlots);
          setMessages(p=>[...p, { role: 'assistant', content: 'Quick one — HIT or Regular? (reply "HIT" for 1 set failure 3/1/4, or "Regular" for 3-4 sets volume)' }]);
          setQuestionIdx(1); // next answers will fill
          // store pending build slots for after style answer
          (window as any).__pendingSlots = finalSlots;
          setLoading(false);
          return;
        }
        setSlots(finalSlots);
        const prog = buildFreeProgram(finalSlots, t.slice(0, 30));
        setMessages(p=>[...p, { role: 'assistant', content: `Building ${finalSlots.days}x ${finalSlots.goal} ${finalSlots.style.toUpperCase()}...`, programJson: prog }]);
        setLoading(false);
        return;
      }

      if (questionIdx > 0 && questionIdx <= questions.length) {
        const curQ = questionIdx - 1;
        const updated = { ...merged } as Slots;
        // handle HIT/Regular question
        if (curQ === 0) {
          if (low.includes('hit') || low.includes('heavy')) updated.style = 'hit';
          else if (low.includes('regular') || low.includes('normal') || low.includes('classic') || low.includes('volume')) updated.style = 'regular';
          else if (!updated.style) updated.style = 'hit';
          // if we had pending build, merge and build now
          const pending = (window as any).__pendingSlots as Slots | undefined;
          if (pending) {
            const final = { ...pending, style: updated.style };
            delete (window as any).__pendingSlots;
            setSlots(final);
            const prog = buildFreeProgram(final);
            setMessages(p=>[...p, { role: 'assistant', content: `Perfect — building ${final.days}x ${final.goal} ${final.style.toUpperCase()}...`, programJson: prog }]);
            setLoading(false);
            return;
          }
        }
        if (curQ === 1 && !updated.goal) updated.goal = t.slice(0, 30);
        if (curQ === 2) {
          const m = t.match(/\b[2-6]\b/); if (m) updated.days = parseInt(m[0], 10);
        }
        if (curQ === 4) updated.loves = t;
        if (curQ === 5) updated.hates = t;
        setSlots(updated);
        if (questionIdx < questions.length) {
          askNext(updated, questionIdx);
        } else {
          const prog = buildFreeProgram(updated);
          setMessages(p=>[...p, { role: 'assistant', content: `Perfect — built ${updated.days}x ${updated.goal || 'recomp'} ${updated.style.toUpperCase()}.`, programJson: prog }]);
        }
        setLoading(false);
        return;
      }

      if (low.includes('hello') || low.includes('hi')) {
        setMessages(p=>[...p, { role: 'assistant', content: 'Hey! Tell me goal + days + style (HIT or Regular), or say "not sure". I\'ll ask one by one then build.' }]);
      } else {
        setMessages(p=>[...p, { role: 'assistant', content: 'Got you. Say "build me 3-day HIT recomp" or "build regular 4-day" or "not sure" to start questions. I generate FREE locally — no API, no cost.' }]);
      }
      setLoading(false);
    }, 450);
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
    const isHit = p.description.includes('HIT 3/1/4');
    const fallbackDesc = isHit ? 'AI HIT 3/1/4 FREE' : 'AI REGULAR 3x8-12 FREE';
    const newId = createProgram(name, p.description||fallbackDesc, undefined);
    const raw = localStorage.getItem('hit_programs_v4');
    if(raw){
      try{
        const progs = JSON.parse(raw);
        if(progs[newId]){ progs[newId].days = days; progs[newId].weeks = weeks; progs[newId].name = name; progs[newId].description = p.description||progs[newId].description; localStorage.setItem('hit_programs_v4', JSON.stringify(progs)); storage.switchProgram(newId); setTimeout(()=>window.location.reload(), 400); return; }
      }catch{}
    }
    storage.switchProgram(newId);
    setOpen(false);
  };

  return (
    <>
      <button onClick={()=>setOpen(v=>!v)} className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_4px_24px_rgba(192,38,211,0.5)] flex items-center justify-center border-2 border-fuchsia-400/50 transition" aria-label="AI Coach">
        {open ? <X className="w-6 h-6"/> : <Bot className="w-7 h-7"/>}
      </button>
      {open && (
        <div className="fixed bottom-36 right-4 z-40 w-[92vw] max-w-[380px] h-[64vh] max-h-[560px] bg-zinc-950 border-2 border-fuchsia-800/60 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
          <div className="bg-fuchsia-950/40 border-b border-fuchsia-800/40 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-fuchsia-600 flex items-center justify-center"><Bot className="w-4 h-4 text-white"/></div>
              <div>
                <div className="font-bebas text-sm text-fuchsia-300 tracking-wider flex items-center gap-1">AI COACH <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded font-mono-code flex items-center gap-0.5"><Zap className="w-3 h-3"/> FREE</span></div>
                <div className="text-[10px] font-mono-code text-zinc-400">HIT or Regular → NEW program → Builder</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={()=>{ setMessages([{ role:'assistant', content:'Cleared. Say "not sure" or "build me 3-day HIT..."'}]); setSlots(DEFAULT_SLOTS); setQuestionIdx(0); }} className="p-1.5 bg-zinc-900 rounded-full text-zinc-500 hover:text-zinc-300" title="Clear"><Trash2 className="w-4 h-4"/></button>
              <button onClick={()=>setOpen(false)} className="p-1.5 bg-zinc-900 rounded-full text-zinc-400"><X className="w-4 h-4"/></button>
            </div>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-zinc-950">
            {messages.map((m,i)=>(
              <div key={i} className={`flex gap-2 ${m.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role==='user'?'bg-red-600 text-white rounded-br-sm':'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-sm'}`}>
                  <div className="flex items-center gap-1 mb-1 text-[10px] font-mono-code opacity-60">{m.role==='user'?<User className="w-3 h-3"/>:<Bot className="w-3 h-3"/>}{m.role.toUpperCase()}</div>
                  <div className="whitespace-pre-wrap break-words text-[13px]">{m.content}</div>
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
            {loading && <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-2 text-xs font-mono-code text-zinc-500 animate-pulse">Thinking...</div>}
          </div>

          <div className="p-2 border-t border-zinc-800 bg-zinc-950 flex items-center gap-2">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder='Try: "build HIT 4-day" or "regular 5-day"...' className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-fuchsia-700" />
            <button onClick={handleSend} disabled={loading||!input.trim()} className="p-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40 text-white rounded-full"><Send className="w-4 h-4"/></button>
          </div>
        </div>
      )}
      {!open && <div className="fixed bottom-20 right-[76px] z-40 hidden sm:flex items-center gap-1 bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono-code px-2.5 py-1 rounded-full shadow"><MessageCircle className="w-3.5 h-3.5 text-fuchsia-400"/> AI Coach · HIT or Regular</div>}
    </>
  );
};
