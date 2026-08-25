import React from 'react';
import { X, ExternalLink, Clock3, Target, Info } from 'lucide-react';
import { ExerciseDefinition } from '../../types/hit';
import { ExerciseAnimation, getAnimationKeyForExercise } from './ExerciseAnimation';

export const ExerciseDemoModal: React.FC<{ exercise: ExerciseDefinition; onClose: () => void }> = ({ exercise, onClose }) => {
  const key = exercise.animationKey || getAnimationKeyForExercise(exercise.name);
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-zinc-950 border-2 border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-3 border-b border-zinc-800">
          <div>
            <h3 className="font-bebas text-xl text-zinc-100 tracking-wider">{exercise.name}</h3>
            <span className="text-[11px] font-mono-code text-zinc-500">{exercise.muscleGroup.toUpperCase()} • TEMPO {exercise.tempo} • REST {exercise.restSeconds}s</span>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:text-zinc-200"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-4 flex flex-col items-center gap-3">
          <ExerciseAnimation animKey={key} size={220} />
          <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-300"><Target className="w-3.5 h-3.5 text-red-500" /> {exercise.targetRepsMin}-{exercise.targetRepsMax} reps to failure <span className="ml-auto text-zinc-500">{exercise.isAnkleSafe ? 'ANKLE SAFE' : ''}</span></div>
            <p className="text-xs font-mono-code text-zinc-400 leading-relaxed"><Info className="w-3 h-3 inline mr-1 text-zinc-500" />{exercise.notes}</p>
            <div className="flex items-center gap-2 text-[11px] font-mono-code text-zinc-500"><Clock3 className="w-3 h-3" /> 3s concentric • 1s squeeze • 4s eccentric — keep strictly to 3/1/4 per HIT rules</div>
          </div>
          {exercise.videoUrl && (
            <a href={exercise.videoUrl} target="_blank" rel="noreferrer" className="w-full py-2 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono-code text-sky-400 flex items-center justify-center gap-1 hover:bg-zinc-800"><ExternalLink className="w-3.5 h-3.5" /> Watch real demo (YouTube)</a>
          )}
          {!exercise.videoUrl && (
            <p className="text-[11px] font-mono-code text-zinc-600 text-center">Stick figure loops offline — add YouTube link in Exercise DB to show real demo.</p>
          )}
        </div>
        <div className="p-3 border-t border-zinc-800 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-mono-code text-xs font-bold">GOT IT</button>
        </div>
      </div>
    </div>
  );
};
