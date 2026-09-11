import React from 'react';
import { CircularProgress } from '../ui/CircularProgress';

interface MacroRingsProps {
  proteinConsumed: number;
  proteinTarget: number;
  carbsConsumed: number;
  carbsTarget: number;
  fatConsumed: number;
  fatTarget: number;
}

export const MacroRings: React.FC<MacroRingsProps> = ({
  proteinConsumed, proteinTarget,
  carbsConsumed, carbsTarget,
  fatConsumed, fatTarget,
}) => {
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 shadow-sm">
      <h3 className="text-xs font-medium text-zinc-500 mb-3 text-center">Macros</h3>
      <div className="flex flex-col items-center gap-3">
        <CircularProgress
          value={proteinConsumed}
          max={proteinTarget}
          color="#10b981"
          label={`${Math.round(proteinConsumed)}g`}
          sublabel="Protein"
          size={70}
          strokeWidth={6}
        />
        <div className="flex gap-3">
          <CircularProgress
            value={carbsConsumed}
            max={carbsTarget}
            color="#3b82f6"
            label={`${Math.round(carbsConsumed)}g`}
            sublabel="Carbs"
            size={55}
            strokeWidth={5}
          />
          <CircularProgress
            value={fatConsumed}
            max={fatTarget}
            color="#f59e0b"
            label={`${Math.round(fatConsumed)}g`}
            sublabel="Fat"
            size={55}
            strokeWidth={5}
          />
        </div>
      </div>
    </div>
  );
};
