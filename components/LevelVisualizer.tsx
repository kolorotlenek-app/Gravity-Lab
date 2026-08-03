
import React from 'react';

interface LevelVisualizerProps {
  pitch: number;
  roll: number;
  targetOffset: { beta: number; gamma: number };
  isLevel: boolean;
  isDanger: boolean;
  onTargetMove: (pitch: number, roll: number) => void;
}

const LevelVisualizer: React.FC<LevelVisualizerProps> = ({ pitch, roll, targetOffset, isLevel, isDanger, onTargetMove }) => {
  const sensitivity = 15; // Max degrees shown from center to edge

  // Sensor bubble positions
  const xPos = Math.min(Math.max(roll, -sensitivity), sensitivity);
  const yPos = Math.min(Math.max(pitch, -sensitivity), sensitivity);
  const xPercent = 50 + (xPos / sensitivity) * 50;
  const yPercent = 50 + (yPos / sensitivity) * 50;

  // Target disc positions
  const targetXPos = Math.min(Math.max(targetOffset.gamma, -sensitivity), sensitivity);
  const targetYPos = Math.min(Math.max(targetOffset.beta, -sensitivity), sensitivity);
  const targetXPercent = 50 + (targetXPos / sensitivity) * 50;
  const targetYPercent = 50 + (targetYPos / sensitivity) * 50;

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
    const dy = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
    onTargetMove(dy * sensitivity, dx * sensitivity);
  };

  const getRingSize = (degrees: number) => (degrees / sensitivity) * 100;
  const hasTargetOffset = Math.abs(targetOffset.beta) > 0.1 || Math.abs(targetOffset.gamma) > 0.1;

  return (
    <div 
      className="relative w-72 h-72 mx-auto flex items-center justify-center cursor-crosshair touch-none"
      onTouchMove={handleTouchMove}
    >
      {/* Dynamic Background Ring for Danger */}
      <div className={`absolute inset-0 rounded-full transition-all duration-700 ${isDanger ? 'bg-red-950/20 scale-105 border-red-500/30' : 'bg-transparent border-slate-900'} border-[0.5px]`} />
      
      {/* Outer Circle (15°) */}
      <div className={`absolute inset-0 border-[0.5px] rounded-full transition-colors duration-500 ${isLevel ? 'border-blue-500/50 bg-blue-500/5' : isDanger ? 'border-red-900' : 'border-slate-800'}`} />
      
      {/* Concentric Rings */}
      {[5, 10].map(deg => (
        <div 
          key={deg}
          className="absolute border-[0.5px] border-slate-800/50 border-dashed rounded-full pointer-events-none"
          style={{ width: `${getRingSize(deg)}%`, height: `${getRingSize(deg)}%` }}
        />
      ))}

      {/* Axis Lines */}
      <div className="absolute w-full h-[0.5px] bg-slate-900/50" />
      <div className="absolute h-full w-[0.5px] bg-slate-900/50" />

      {/* Degree Ticks */}
      {[5, 10].map((deg) => (
        <React.Fragment key={deg}>
          <div className="absolute h-1.5 w-px bg-slate-700" style={{ left: `${50 + (deg / sensitivity) * 50}%` }} />
          <span className="absolute mono text-[6px] text-slate-600 pointer-events-none" style={{ left: `${50 + (deg / sensitivity) * 50}%`, top: '52%' }}>{deg}°</span>
          <div className="absolute w-1.5 h-px bg-slate-700" style={{ top: `${50 + (deg / sensitivity) * 50}%` }} />
          <span className="absolute mono text-[6px] text-slate-600 pointer-events-none translate-x-2" style={{ top: `${50 + (deg / sensitivity) * 50}%`, left: '50%' }}>{deg}°</span>
        </React.Fragment>
      ))}

      {/* TARGET DISC */}
      <div 
        className="absolute pointer-events-none transition-all duration-100 ease-out z-10"
        style={{ left: `${targetXPercent}%`, top: `${targetYPercent}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className={`w-14 h-14 border rounded-full flex items-center justify-center transition-all duration-300 
          ${isLevel ? 'border-blue-500 bg-blue-900/20 glow-blue' : isDanger ? 'border-red-500/50 bg-red-950/20' : hasTargetOffset ? 'border-blue-400/30 bg-slate-900/50' : 'border-slate-800'}`}>
          <div className="absolute w-4 h-px bg-current opacity-30" />
          <div className="absolute h-4 w-px bg-current opacity-30" />
          <div className={`w-1 h-1 rounded-full ${isLevel ? 'bg-blue-400' : isDanger ? 'bg-red-500' : hasTargetOffset ? 'bg-blue-500/50' : 'bg-slate-700'}`} />
        </div>
      </div>

      {/* SENSOR BUBBLE */}
      <div 
        className={`absolute w-10 h-10 rounded-full border-2 transition-all duration-150 ease-out shadow-2xl flex items-center justify-center pointer-events-none z-20
          ${isLevel ? 'border-blue-400 bg-blue-500/20' : isDanger ? 'border-red-500 bg-red-950/40 animate-pulse' : 'border-slate-400 bg-slate-800'}`}
        style={{ left: `calc(${xPercent}% - 1.25rem)`, top: `calc(${yPercent}% - 1.25rem)` }}
      >
        <div className={`w-2.5 h-2.5 rounded-full ${isLevel ? 'bg-blue-400 glow-blue' : isDanger ? 'bg-red-500' : 'bg-slate-100'}`} />
      </div>

      {/* Circumference Ticks */}
      {[...Array(24)].map((_, i) => (
        <div 
          key={i} 
          className={`absolute w-px ${isDanger ? 'bg-red-900' : 'bg-slate-800'} ${i % 2 === 0 ? 'h-2' : 'h-1 opacity-50'}`} 
          style={{ transform: `rotate(${i * 15}deg) translateY(-142px)` }} 
        />
      ))}
    </div>
  );
};

export default LevelVisualizer;
