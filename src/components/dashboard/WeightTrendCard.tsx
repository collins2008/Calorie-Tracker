import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';

interface WeightTrendCardProps {
  entries: Array<{ date: string; weight: number }>;
  targetWeight: number;
  profileWeight?: number;
}

export const WeightTrendCard: React.FC<WeightTrendCardProps> = ({ entries, targetWeight, profileWeight = 0 }) => {
  const latestWeight = entries.length > 0 ? entries[entries.length - 1].weight : profileWeight;
  const startWeight = entries.length > 0 ? entries[0].weight : profileWeight;
  const delta = latestWeight - startWeight;
  const isLoss = delta <= 0;

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 shadow-sm min-h-[296px] flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-sm font-semibold text-zinc-400 mb-1">Current Weight</h3>
          <div className="text-2xl font-bold text-zinc-100">{latestWeight.toFixed(1)} kg</div>
        </div>
        {entries.length > 1 && (
          <div className={`text-sm font-medium ${isLoss ? 'text-emerald-400' : 'text-amber-400'}`}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg total
          </div>
        )}
      </div>

      <div className="h-48 w-full -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={entries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#52525b"
              fontSize={12}
              tickFormatter={(val) => {
                try {
                  return format(parseISO(val), 'MMM d');
                } catch {
                  return val;
                }
              }}
              minTickGap={20}
            />
            <YAxis 
              stroke="#52525b" 
              fontSize={12} 
              domain={['dataMin - 1', 'dataMax + 1']} 
              tickFormatter={(val) => val.toFixed(1)}
              width={40}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '0.5rem', color: '#f4f4f5' }}
              itemStyle={{ color: '#10b981' }}
              labelFormatter={(label) => {
                try {
                  return format(parseISO(label as string), 'MMM d, yyyy');
                } catch {
                  return label;
                }
              }}
            />
            <ReferenceLine y={targetWeight} stroke="#f59e0b" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-between text-xs text-zinc-500 px-2">
        <span>History</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Target: {targetWeight} kg
        </span>
      </div>
    </div>
  );
};
