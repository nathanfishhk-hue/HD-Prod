import React, { useState } from 'react';
import {
  Wrench,
  Lock,
  Unlock,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  ShieldAlert,
  Edit3,
  Database,
  Layers,
  X,
  Save,
  RefreshCw
} from 'lucide-react';
import { useHitStorage } from '../../hooks/useHitStorage';
import { ExerciseDefinition, WorkoutDayConfig, MuscleGroup } from '../../types/hit';

interface ProgramBuilderProps {
  storage: ReturnType<typeof useHitStorage>;
}

export const ProgramBuilder: React.FC<ProgramBuilderProps> = ({ storage }) => {
  const {
    weeks,
    days,
    programs,
    activeProgramId,
    activeProgram,
    switchProgram,
    createProgram,
    duplicateProgram,
    deleteProgram,
    renameProgram,
    exerciseLibrary,
    addExerciseToLibrary,
    updateExerciseInLibrary,
    deleteExerciseFromLibrary,
    resetExerciseLibrary,
    updateExercise,
    swapExercise,
    addExerciseToDay,
    removeExerciseFromDay,
    reorderExerciseInDay,
    addCustomDay,
    deleteDay,
    extendProgramWeeks,
    editModeLocked,
    toggleEditModeLock
  } = storage;

  const [activeDayKey, setActiveDayKey] = useState<string>(days[0]?.dayKey || 'A');

  // Program create state
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [newProgName, setNewProgName] = useState('');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [copyFromId, setCopyFromId] = useState<string>('hd-recomp-6wk');

  // Exercise library states
  const [showLibManager, setShowLibManager] = useState(false);
  const [editingLibId, setEditingLibId] = useState<string | null>(null);
  const [libEditForm, setLibEditForm] = useState<Partial<ExerciseDefinition>>({});
  const [showAddToDayModal, setShowAddToDayModal] = useState(false);
  const [selectedLibId, setSelectedLibId] = useState<string>(exerciseLibrary[0]?.id || '');

  // Add exercise to library form
  const [showAddLibModal, setShowAddLibModal] = useState(false);
  const [newExForm, setNewExForm] = useState<ExerciseDefinition>({
    id: '',
    name: '',
    muscleGroup: 'Chest',
    targetRepsMin: 6,
    targetRepsMax: 10,
    defaultWarmups: 1,
    defaultWorkingSets: 1,
    tempo: '3/1/4',
    restSeconds: 120,
    notes: '',
    alternatives: []
  });

  // Custom day
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState('DAY D: ARMS & CORE');

  const activeDay = days.find(d => d.dayKey === activeDayKey) || days[0];

  // Fix activeDayKey when switching programs
  React.useEffect(() => {
    if (!days.find(d => d.dayKey === activeDayKey)) {
      setActiveDayKey(days[0]?.dayKey || 'A');
    }
  }, [activeProgramId, days, activeDayKey]);

  const handleCreateProgram = () => {
    if (!newProgName.trim()) return;
    createProgram(newProgName, newProgDesc || 'Custom HIT program', copyFromId);
    setNewProgName(''); setNewProgDesc(''); setShowCreateProgram(false);
  };

  const handleAddLibExercise = () => {
    if (!newExForm.name.trim()) return alert('Name required');
    const id = 'ex-' + newExForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36).slice(0,3);
    addExerciseToLibrary({ ...newExForm, id });
    setShowAddLibModal(false);
    setNewExForm({ id: '', name: '', muscleGroup: 'Chest', targetRepsMin: 6, targetRepsMax: 10, defaultWarmups: 1, defaultWorkingSets: 1, tempo: '3/1/4', restSeconds: 120, notes: '', alternatives: [] });
  };

  const startEditLib = (ex: ExerciseDefinition) => {
    setEditingLibId(ex.id);
    setLibEditForm({ ...ex });
  };
  const saveEditLib = () => {
    if (!editingLibId || !libEditForm.name) return;
    updateExerciseInLibrary(editingLibId, libEditForm);
    setEditingLibId(null);
  };

  if (!activeProgram) return null;

  return (
    <div className="pb-28 max-w-4xl mx-auto px-3 sm:px-4 pt-3 overflow-x-hidden">
      {/* Header + Lock */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-4 mb-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-red-500" />
            <h2 className="font-bebas text-2xl text-zinc-100 tracking-wider">PROGRAM BUILDER</h2>
          </div>
          <p className="text-xs font-mono-code text-zinc-400">Create new programs without touching HD RECOMP 6-WK. Switch, duplicate, delete.</p>
        </div>
        <button
          onClick={toggleEditModeLock}
          className={`px-4 py-2 rounded font-mono-code font-bold text-xs flex items-center gap-2 ${editModeLocked ? 'bg-zinc-900 border border-zinc-700 text-zinc-300' : 'bg-amber-950 border-2 border-amber-500 text-amber-300'}`}
        >
          {editModeLocked ? <><Lock className="w-4 h-4" /><span>LOCKED</span></> : <><Unlock className="w-4 h-4" /><span>EDITING</span></>}
        </button>
      </div>
      {editModeLocked && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-lg p-3 mb-4 flex items-center gap-2 text-xs font-mono-code text-amber-300">
          <ShieldAlert className="w-4 h-4" /><span>Editing locked. Unlock to modify programs/exercises.</span>
        </div>
      )}

      {/* 1. PROGRAM SWITCHER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-4 mb-4 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-red-500" />
            <h3 className="font-bebas text-xl text-zinc-100">PROGRAMS</h3>
            <span className="text-xs font-mono-code bg-zinc-900 border border-zinc-700 px-2 py-0.5 rounded text-zinc-400">{Object.keys(programs).length} total</span>
          </div>
          {!editModeLocked && (
            <button onClick={() => setShowCreateProgram(true)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-mono-code text-xs font-bold flex items-center gap-1">
              <Plus className="w-4 h-4" /> NEW PROGRAM
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {Object.values(programs).map(p => (
            <button
              key={p.id}
              onClick={() => switchProgram(p.id)}
              className={`px-2.5 sm:px-3 py-2 rounded font-mono-code text-xs font-bold border flex flex-col items-start text-left min-w-[120px] sm:min-w-[140px] max-w-[48%] sm:max-w-none ${activeProgramId === p.id ? 'bg-red-600 border-red-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.4)]' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
            >
              <span className="tracking-wider flex items-center gap-1.5 truncate w-full">{p.name} {p.isDefault && <span className="text-[9px] bg-zinc-800 text-amber-400 px-1 rounded flex-shrink-0">DEFAULT</span>}</span>
              <span className="text-[10px] opacity-70 truncate">{p.days.length} days • {p.weeks.length} wks</span>
            </button>
          ))}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 overflow-hidden">
          <div>
            <div className="font-bebas text-lg text-zinc-100">{activeProgram.name}</div>
            <div className="text-xs font-mono-code text-zinc-400">{activeProgram.description}</div>
            <div className="text-[10px] font-mono-code text-zinc-500">Created {new Date(activeProgram.createdAt).toLocaleDateString()} • {activeProgram.days.length} days • {activeProgram.weeks.length} weeks</div>
          </div>
          {!editModeLocked && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button onClick={() => duplicateProgram(activeProgramId)} className="px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded text-xs font-mono-code flex items-center gap-1 hover:bg-zinc-700"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
              {!activeProgram.isDefault && (
                <button onClick={() => deleteProgram(activeProgramId)} className="px-2.5 py-1.5 bg-red-950 border border-red-800 text-red-300 rounded text-xs font-mono-code flex items-center gap-1 hover:bg-red-900"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
              )}
            </div>
          )}
        </div>

        {/* Rename inline when unlocked */}
        {!editModeLocked && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input value={activeProgram.name} onChange={e => renameProgram(activeProgramId, e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono-code text-zinc-100" placeholder="Program name" />
            <input value={activeProgram.description} onChange={e => renameProgram(activeProgramId, activeProgram.name, e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono-code text-zinc-400" placeholder="Description" />
          </div>
        )}
      </div>

      {/* 2. EXERCISE DATABASE */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-4 mb-4 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" />
            <h3 className="font-bebas text-xl text-zinc-100">EXERCISE DATABASE</h3>
            <span className="text-xs font-mono-code bg-sky-950 border border-sky-800 text-sky-300 px-2 py-0.5 rounded">{exerciseLibrary.length} exercises</span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => setShowLibManager(!showLibManager)} className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded text-xs font-mono-code">{showLibManager ? 'Hide' : 'Manage'}</button>
            {!editModeLocked && <button onClick={() => setShowAddLibModal(true)} className="px-3 py-1.5 bg-sky-900 border border-sky-700 text-sky-200 rounded text-xs font-mono-code flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> New Exercise</button>}
          </div>
        </div>
        {!showLibManager ? (
          <p className="text-xs font-mono-code text-zinc-500">Manage to add/edit/delete exercises. These appear in Program Builder swap dropdowns across all programs.</p>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {exerciseLibrary.map(ex => (
              <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                {editingLibId === ex.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={libEditForm.name} onChange={e => setLibEditForm({ ...libEditForm, name: e.target.value })} placeholder="Name" className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100" />
                      <select value={libEditForm.muscleGroup} onChange={e => setLibEditForm({ ...libEditForm, muscleGroup: e.target.value as MuscleGroup })} className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100">
                        {['Chest','Lats/Back','Legs','Shoulders','Biceps','Triceps','Abs'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <input type="number" value={libEditForm.targetRepsMin} onChange={e => setLibEditForm({ ...libEditForm, targetRepsMin: parseInt(e.target.value)||0 })} placeholder="Min" className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs" />
                      <input type="number" value={libEditForm.targetRepsMax} onChange={e => setLibEditForm({ ...libEditForm, targetRepsMax: parseInt(e.target.value)||0 })} placeholder="Max" className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs" />
                      <input type="number" value={libEditForm.restSeconds} onChange={e => setLibEditForm({ ...libEditForm, restSeconds: parseInt(e.target.value)||0 })} placeholder="Rest" className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs" />
                      <input value={libEditForm.tempo} onChange={e => setLibEditForm({ ...libEditForm, tempo: e.target.value })} placeholder="Tempo" className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs" />
                    </div>
                    <textarea value={libEditForm.notes} onChange={e => setLibEditForm({ ...libEditForm, notes: e.target.value })} placeholder="Notes" className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300" rows={2} />
                    <div className="flex gap-2">
                      <button onClick={saveEditLib} className="flex-1 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold flex items-center justify-center gap-1"><Save className="w-3.5 h-3.5" /> Save</button>
                      <button onClick={() => setEditingLibId(null)} className="px-4 py-1.5 bg-zinc-800 text-zinc-300 rounded text-xs"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="font-bebas text-sm text-zinc-100 truncate pr-1">{ex.name} <span className="text-[10px] font-mono-code text-zinc-500 font-normal">{ex.muscleGroup} • {ex.targetRepsMin}-{ex.targetRepsMax} • {ex.tempo}</span></div>
                      <div className="text-[11px] font-mono-code text-zinc-500 line-clamp-2 break-words">{ex.notes?.slice(0,90)}</div>
                    </div>
                    {!editModeLocked && (
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => startEditLib(ex)} className="p-1.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-300"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteExerciseFromLibrary(ex.id)} className="p-1.5 bg-red-950 border border-red-800 rounded text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {!editModeLocked && (
              <button onClick={resetExerciseLibrary} className="w-full py-2 border border-amber-800 bg-amber-950/30 text-amber-300 rounded text-xs font-mono-code flex items-center justify-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Reset library to defaults</button>
            )}
          </div>
        )}
      </div>

      {/* 3. DAY TABS */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-thin">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {days.map(d => (
            <button
              key={d.dayKey}
              onClick={() => setActiveDayKey(d.dayKey)}
              className={`px-3 py-2 rounded font-bebas text-lg tracking-wider flex-shrink-0 ${activeDayKey === d.dayKey ? 'bg-red-600 text-white' : 'bg-zinc-950 border border-zinc-800 text-zinc-400'}`}
            >
              {d.title.split(':')[0]}
            </button>
          ))}
        </div>
        {!editModeLocked && (
          <button onClick={() => setShowAddDayModal(true)} className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded font-mono-code text-xs font-bold flex items-center gap-1 flex-shrink-0"><Plus className="w-4 h-4 text-red-500" /> ADD DAY</button>
        )}
      </div>

      {/* 4. ACTIVE DAY EXERCISES */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 sm:p-4 mb-6 shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3 mb-4">
          <div>
            <h3 className="font-bebas text-2xl text-zinc-100">{activeDay?.title}</h3>
            <p className="text-xs font-mono-code text-zinc-400">{activeDay?.description}</p>
          </div>
          <div className="flex gap-1.5">
            {!editModeLocked && (
              <>
                <button onClick={() => setShowAddToDayModal(true)} className="px-3 py-1.5 bg-red-950 border border-red-600 rounded font-mono-code text-xs font-bold text-red-200 flex items-center gap-1"><Plus className="w-4 h-4" /> ADD EXERCISE</button>
                <button onClick={() => deleteDay(activeDayKey)} className="px-2 py-1.5 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-400"><Trash2 className="w-3.5 h-3.5" /></button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {activeDay?.exercises.map((ex, idx) => (
            <div key={ex.id + idx} className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 sm:p-3.5 flex flex-col gap-3 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-6 h-6 rounded bg-red-950 border border-red-700 text-red-400 font-mono-code font-bold text-xs flex items-center justify-center flex-shrink-0">{idx+1}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bebas text-lg sm:text-xl text-zinc-100 truncate pr-1">{ex.name}</h4>
                    <span className="text-[10px] font-mono-code text-zinc-500 block truncate">{ex.muscleGroup} • TEMPO {ex.tempo} • REST {ex.restSeconds}s</span>
                  </div>
                </div>
                {!editModeLocked && (
                  <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                    <button
                      onClick={() => {
                        const pool = exerciseLibrary.filter(e => e.muscleGroup === ex.muscleGroup);
                        if (pool.length <= 1) return;
                        const cur = pool.findIndex(p => p.id === ex.id);
                        const nxt = pool[(cur + 1) % pool.length];
                        swapExercise(activeDayKey, idx, nxt);
                      }}
                      className="p-1.5 sm:px-2 sm:py-1.5 bg-sky-950/60 border border-sky-800 hover:bg-sky-900 text-sky-300 rounded flex items-center gap-1 font-mono-code text-[11px] font-bold"
                      title={`Cycle similar ${ex.muscleGroup} (${exerciseLibrary.filter(e=>e.muscleGroup===ex.muscleGroup).length})`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">CYCLE</span>
                    </button>
                    <select value={ex.id} onChange={e => { const found = exerciseLibrary.find(x=>x.id===e.target.value); if(found) swapExercise(activeDayKey, idx, found); }} className="flex-1 sm:flex-none bg-zinc-950 border border-zinc-700 rounded px-2 py-1.5 text-xs font-mono-code text-zinc-300 min-w-0 sm:max-w-[180px]">
                      <option value={ex.id}>SWAP...</option>
                      {exerciseLibrary.map(lib => <option key={lib.id} value={lib.id}>{lib.name} ({lib.muscleGroup})</option>)}
                    </select>
                    <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => reorderExerciseInDay(activeDayKey, idx, Math.max(0, idx-1))} disabled={idx===0} className="p-1.5 bg-zinc-950 border border-zinc-800 rounded disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => reorderExerciseInDay(activeDayKey, idx, Math.min(activeDay.exercises.length-1, idx+1))} disabled={idx===activeDay.exercises.length-1} className="p-1.5 bg-zinc-950 border border-zinc-800 rounded disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeExerciseFromDay(activeDayKey, idx)} className="p-1.5 bg-red-950/60 border border-red-800 text-red-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                )}
              </div>
              {!editModeLocked && (
                <div className="bg-zinc-950 p-3 rounded border border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-code">
                  <div><label className="text-zinc-500 block text-[10px]">MIN REPS</label><input type="number" value={ex.targetRepsMin} onChange={e => updateExercise(activeDayKey, idx, { ...ex, targetRepsMin: parseInt(e.target.value)||0 })} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1" /></div>
                  <div><label className="text-zinc-500 block text-[10px]">MAX REPS</label><input type="number" value={ex.targetRepsMax} onChange={e => updateExercise(activeDayKey, idx, { ...ex, targetRepsMax: parseInt(e.target.value)||0 })} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1" /></div>
                  <div><label className="text-zinc-500 block text-[10px]">WARMUPS</label><input type="number" value={ex.defaultWarmups} onChange={e => updateExercise(activeDayKey, idx, { ...ex, defaultWarmups: parseInt(e.target.value)||0 })} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1" /></div>
                  <div><label className="text-zinc-500 block text-[10px]">REST S</label><input type="number" value={ex.restSeconds} onChange={e => updateExercise(activeDayKey, idx, { ...ex, restSeconds: parseInt(e.target.value)||0 })} className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1" /></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. EXTEND WEEKS */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
          <h3 className="font-bebas text-xl text-zinc-100">WEEKS • {weeks.length} WEEKS</h3>
          <span className="text-xs font-mono-code text-red-500 font-bold">{activeProgram.name}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => extendProgramWeeks(12)} disabled={weeks.length>=12} className="px-4 py-2 bg-red-950 border border-red-600 text-red-200 rounded text-xs font-bold disabled:opacity-40">EXTEND TO 12 WEEKS</button>
          <button onClick={() => extendProgramWeeks(weeks.length+1)} className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-200 rounded text-xs font-bold">+1 WEEK</button>
        </div>
      </div>

      {/* MODALS */}
      {showCreateProgram && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-red-700 rounded-xl max-w-md w-full p-5">
            <h3 className="font-bebas text-2xl mb-3">NEW PROGRAM</h3>
            <input value={newProgName} onChange={e => setNewProgName(e.target.value)} placeholder="Name e.g. PUSH PULL LEGS 4-WK" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm mb-2" />
            <input value={newProgDesc} onChange={e => setNewProgDesc(e.target.value)} placeholder="Description" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm mb-2" />
            <select value={copyFromId} onChange={e => setCopyFromId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm mb-4">
              {Object.values(programs).map(p => <option key={p.id} value={p.id}>Copy from: {p.name}</option>)}
              <option value="">Blank (HD defaults)</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateProgram(false)} className="px-3 py-1.5 bg-zinc-800 rounded text-xs">CANCEL</button>
              <button onClick={handleCreateProgram} className="px-4 py-1.5 bg-red-600 text-white rounded text-xs font-bold">CREATE</button>
            </div>
          </div>
        </div>
      )}

      {showAddLibModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-sky-700 rounded-xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bebas text-2xl mb-3">NEW EXERCISE</h3>
            <input value={newExForm.name} onChange={e => setNewExForm({ ...newExForm, name: e.target.value })} placeholder="Exercise name" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm mb-2" />
            <select value={newExForm.muscleGroup} onChange={e => setNewExForm({ ...newExForm, muscleGroup: e.target.value as MuscleGroup })} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm mb-2">
              {['Chest','Lats/Back','Legs','Shoulders','Biceps','Triceps','Abs'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input type="number" value={newExForm.targetRepsMin} onChange={e => setNewExForm({ ...newExForm, targetRepsMin: parseInt(e.target.value)||0 })} placeholder="Min reps" className="bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm" />
              <input type="number" value={newExForm.targetRepsMax} onChange={e => setNewExForm({ ...newExForm, targetRepsMax: parseInt(e.target.value)||0 })} placeholder="Max reps" className="bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm" />
              <input value={newExForm.tempo} onChange={e => setNewExForm({ ...newExForm, tempo: e.target.value })} placeholder="Tempo 3/1/4" className="bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm" />
              <input type="number" value={newExForm.restSeconds} onChange={e => setNewExForm({ ...newExForm, restSeconds: parseInt(e.target.value)||0 })} placeholder="Rest sec" className="bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm" />
            </div>
            <textarea value={newExForm.notes} onChange={e => setNewExForm({ ...newExForm, notes: e.target.value })} placeholder="Notes" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm mb-4" rows={3} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddLibModal(false)} className="px-3 py-1.5 bg-zinc-800 rounded text-xs">CANCEL</button>
              <button onClick={handleAddLibExercise} className="px-4 py-1.5 bg-sky-600 text-white rounded text-xs font-bold">ADD TO LIBRARY</button>
            </div>
          </div>
        </div>
      )}

      {showAddToDayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-red-700 rounded-xl max-w-md w-full p-5">
            <h3 className="font-bebas text-2xl mb-3">ADD EXERCISE TO {activeDay?.title.split(':')[0]}</h3>
            <select value={selectedLibId} onChange={e => setSelectedLibId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm mb-4">
              {exerciseLibrary.map(lib => <option key={lib.id} value={lib.id}>{lib.name} — {lib.muscleGroup}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddToDayModal(false)} className="px-3 py-1.5 bg-zinc-800 rounded text-xs">CANCEL</button>
              <button onClick={() => { const f = exerciseLibrary.find(x=>x.id===selectedLibId); if(f){ addExerciseToDay(activeDayKey, f); setShowAddToDayModal(false); } }} className="px-4 py-1.5 bg-red-600 text-white rounded text-xs font-bold">ADD</button>
            </div>
          </div>
        </div>
      )}

      {showAddDayModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-red-700 rounded-xl max-w-md w-full p-5">
            <h3 className="font-bebas text-2xl mb-3">NEW DAY</h3>
            <input value={newDayTitle} onChange={e => setNewDayTitle(e.target.value)} placeholder="DAY D: TITLE" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2.5 text-sm mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddDayModal(false)} className="px-3 py-1.5 bg-zinc-800 rounded text-xs">CANCEL</button>
              <button onClick={() => { if(!newDayTitle.trim()) return; const k = String.fromCharCode(65+days.length); addCustomDay({ dayKey: k, title: newDayTitle.toUpperCase(), subtitle: 'Custom', description: 'Custom HIT day.', exercises: [exerciseLibrary[0]] }); setActiveDayKey(k); setShowAddDayModal(false); }} className="px-4 py-1.5 bg-red-600 text-white rounded text-xs font-bold">CREATE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
