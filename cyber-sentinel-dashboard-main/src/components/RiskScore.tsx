import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RiskScoreProps {
  score: number;
  className?: string;
}

export const RiskScore = ({ score, className = '' }: RiskScoreProps) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getRiskLevel = () => {
    if (score < 30) return { level: 'Low', color: 'text-success', glow: 'glow-safe' };
    if (score < 70) return { level: 'Medium', color: 'text-warning', glow: 'glow-warning' };
    return { level: 'High', color: 'text-danger', glow: 'glow-danger' };
  };

  const { level, color, glow } = getRiskLevel();
  const circumference = 2 * Math.PI * 70;
  const offset = circumference - (displayScore / 100) * circumference;

  return (
    <div className={`glass-panel p-8 ${className}`}>
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold text-foreground mb-6">Overall Risk Score</h3>
        
        <div className={`relative w-48 h-48 ${score > 50 ? glow : ''}`}>
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted/30"
            />
            {/* Animated progress circle */}
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              className={color}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className={`text-5xl font-bold ${color}`}
            >
              {displayScore}
            </motion.div>
            <div className="text-sm text-muted-foreground mt-1">out of 100</div>
          </div>

          {/* Pulse effect for high risk */}
          {score > 70 && (
            <div className="absolute inset-0 rounded-full border-2 border-danger radar-pulse" />
          )}
        </div>

        <div className="mt-6 text-center">
          <div className={`text-2xl font-semibold ${color}`}>{level} Risk</div>
          <p className="text-sm text-muted-foreground mt-2">
            {score < 30 && 'All systems operating normally'}
            {score >= 30 && score < 70 && 'Some alerts require attention'}
            {score >= 70 && 'Critical alerts detected'}
          </p>
        </div>
      </div>
    </div>
  );
};
