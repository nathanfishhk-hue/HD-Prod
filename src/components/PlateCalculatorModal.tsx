import React, { useState } from 'react';
import { X, Calculator } from 'lucide-react';
import { calculatePlates } from '../utils/hitCalculators';
import { WeightUnit } from '../types/hit';

interface PlateCalculatorModalProps {
  initialWeightKg: number;
  unitPreference: WeightUnit;
  onClose: () => void;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  initialWeightKg,
  unitPreference,
  onClose
}) => {
  const [totalWeight, setTotalWeight] = useState<number>(initialWeightKg || 80);
  const [barWeight, setBarWeight] = useState<number>(20); // 20kg bar default

  const { perSideKg, plates } = calculatePlates(totalWeight, barWeight);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border-2 border-red-700/80 rounded-xl max-w-md w-full p-5 shadow-[0_0_50px_rgba(220,38,38,0.3)] relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-red-500" />
            <h3 className="font-bebas text-xl text-zinc-100 tracking-wider">PLATE CALCULATOR</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-red-400 p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono-code text-zinc-400 uppercase mb-1">
              TOTAL TARGET WEIGHT ({unitPreference.toUpperCase()})
            </label>
            <input
              type="number"
              step="2.5"
              value={totalWeight}
              onChange={e => setTotalWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 font-mono-code text-2xl font-bold text-red-500 focus:outline-none focus:border-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-code text-zinc-400 uppercase mb-1">
              BAR OR BASE WEIGHT (KG)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '20kg Olympic', val: 20 },
                { label: '15kg Bar', val: 15 },
                { label: '0kg Machine', val: 0 }
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setBarWeight(opt.val)}
                  className={`py-1.5 text-xs font-mono-code rounded border ${
                    barWeight === opt.val
                      ? 'bg-red-950 border-red-600 text-red-400 font-bold'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded p-3 text-center">
            <div className="text-xs font-mono-code text-zinc-400">LOAD PER SIDE</div>
            <div className="font-bebas text-3xl text-emerald-400 tracking-wider my-1">
              {perSideKg} KG <span className="text-sm font-sans text-zinc-400">/ SIDE</span>
            </div>
          </div>

          {/* Visual plate graphics */}
          <div>
            <div className="text-xs font-mono-code text-zinc-400 uppercase mb-2">PLATES REQUIRED PER SIDE:</div>
            {plates.length === 0 ? (
              <div className="text-xs font-mono-code text-zinc-500 py-3 text-center bg-zinc-900/50 rounded">
                Target weight is equal to or less than bar weight. No additional plates required.
              </div>
            ) : (
              <div className="space-y-2">
                {plates.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-8 rounded-sm border border-black/40 flex items-center justify-center font-mono-code text-[9px] font-black text-black"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="font-mono-code text-sm font-bold text-zinc-100">
                        {p.plateKg} kg Plate
                      </span>
                    </div>
                    <div className="font-bebas text-xl text-red-500">
                      x {p.countPerSide} <span className="text-xs font-mono-code text-zinc-400">per side</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="mt-5 w-full brutalist-button-red py-2.5 rounded font-mono-code font-bold text-sm tracking-widest"
        >
          CONFIRM & CLOSE
        </button>
      </div>
    </div>
  );
};
