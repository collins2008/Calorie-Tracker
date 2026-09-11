import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
}) => {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (node) {
      const controls = animate(parseFloat(node.textContent?.replace(/[^0-9.-]/g, '') || '0'), value, {
        duration: 1,
        onUpdate: (v) => {
          node.textContent = prefix + v.toFixed(decimals) + suffix;
        },
      });
      return controls.stop;
    }
  }, [value, prefix, suffix, decimals]);

  return <span ref={nodeRef} className={className}>{prefix}{(0).toFixed(decimals)}{suffix}</span>;
};
