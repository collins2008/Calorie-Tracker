import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { CorrelationDataPoint } from '../../hooks/useCorrelationData';
import { BarChart3 } from 'lucide-react';

interface CorrelationMatrixCardProps {
  data: CorrelationDataPoint[];
  targetWeight: number;
}

export const CorrelationMatrixCard: React.FC<CorrelationMatrixCardProps> = ({ data, targetWeight }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-2xl p-6 shadow-sm min-h-[350px] flex flex-col items-center justify-center border border-zinc-800/50">
        <BarChart3 size={48} className="text-zinc-800 mb-4" />
        <p className="text-zinc-500 font-medium text-sm">Not enough data to map correlation.</p>
        <p className="text-zinc-600 text-xs mt-1">Log your weight and meals to generate the matrix.</p>
      </div>
    );
  }

  const latestWeight = data[data.length - 1].weight;
  const startWeight = data[0].weight;
  const delta = latestWeight - startWeight;
  const isLoss = delta <= 0;

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 shadow-sm min-h-[380px] flex flex-col border border-zinc-800/50 relative overflow-hidden">
      <div className="flex justify-between items-start mb-8 z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={16} className="text-indigo-400" />
            <h3 className="text-sm font-semibold text-zinc-400">Correlation Matrix</h3>
          </div>
          <p className="text-xs text-zinc-500">Calorie Deficit vs. Weight Trend</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-zinc-100">{latestWeight.toFixed(1)} <span className="text-sm text-zinc-500 font-medium">kg</span></div>
          {data.length > 1 && (
            <div className={`text-sm font-medium ${isLoss ? 'text-emerald-400' : 'text-amber-400'}`}>
              {delta > 0 ? '+' : ''}{delta.toFixed(1)} kg overall
            </div>
          )}
        </div>
      </div>

      <div className="h-56 w-full -ml-4 z-10">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#52525b"
              fontSize={11}
              tickFormatter={(val) => {
                try { return format(parseISO(val), 'MMM d'); } catch { return val; }
              }}
              minTickGap={20}
              axisLine={false}
              tickLine={false}
            />
            {/* Left Y Axis for Weight */}
            <YAxis 
              yAxisId="weight"
              orientation="left"
              stroke="#10b981" 
              fontSize={11} 
              domain={['dataMin - 1', 'dataMax + 1']} 
              tickFormatter={(val) => val.toFixed(1)}
              width={40}
              axisLine={false}
              tickLine={false}
            />
            {/* Right Y Axis for Calories */}
            <YAxis 
              yAxisId="calories"
              orientation="right"
              domain={[0, 'dataMax + 800']}
              hide 
            />
            
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#f4f4f5', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 500 }}
              labelStyle={{ color: '#a1a1aa', fontSize: '11px', marginBottom: '4px' }}
              labelFormatter={(label) => {
                try { return format(parseISO(label as string), 'MMM d, yyyy'); } catch { return label; }
              }}
            />

            {/* Target Weight Line */}
            <ReferenceLine yAxisId="weight" y={targetWeight} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} />
            
            {/* Calories Consumed Bar */}
            <Bar 
              yAxisId="calories" 
              dataKey="consumed" 
              name="Calories Consumed" 
              fill="#6366f1" 
              opacity={0.25} 
              radius={[4, 4, 0, 0]} 
            />
            
            {/* Weight Trend Line */}
            <Line
              yAxisId="weight"
              type="monotone"
              dataKey="weight"
              name="Body Weight"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex justify-between text-[11px] text-zinc-500 px-2 font-medium">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Weight Trend
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500 opacity-50"></span> Daily Calories
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span> Target Weight
        </span>
      </div>
    </div>
  );
};
