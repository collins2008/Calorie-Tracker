import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  size = 100,
  strokeWidth = 8,
  color = '#10b981',
  label,
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(Math.max(value / safeMax, 0), 1);
  const offset = circumference - percent * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          strokeWidth={strokeWidth}
          stroke="#27272a"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          {label && <span className="text-xs font-bold text-zinc-100">{label}</span>}
          {sublabel && <span className="text-[9px] text-zinc-500">{sublabel}</span>}
        </div>
      )}
    </div>
  );
};
