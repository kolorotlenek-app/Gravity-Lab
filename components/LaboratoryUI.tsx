
import React from 'react';

export const MedicalCross: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={`w-6 h-6 ${className}`}>
    <path d="M12 4v16m-8-8h16" strokeLinecap="round" />
  </svg>
);

export const DangerTriangle: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-6 h-6 ${className}`}>
    <path d="M12 2L2 22h20L12 2z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 9v4" strokeLinecap="round" />
    <path d="M12 17h.01" strokeLinecap="round" />
  </svg>
);

export const GeometricLogo: React.FC<{ active?: boolean }> = ({ active }) => (
  <div className="flex items-center gap-2 mb-8">
    <div className={`relative w-10 h-10 border border-slate-700 flex items-center justify-center rounded-sm rotate-45 transition-colors ${active ? 'border-blue-500' : ''}`}>
      <div className={`absolute w-6 h-6 border flex items-center justify-center transition-colors ${active ? 'border-blue-400/50' : 'border-slate-800'}`}>
        <div className={`w-1 h-1 rounded-full glow-blue transition-colors ${active ? 'bg-blue-400' : 'bg-slate-700'}`} />
      </div>
    </div>
    <div className="flex flex-col">
      <span className="text-xs tracking-[0.3em] font-bold text-slate-100">GR</span>
      <span className="text-[10px] tracking-wider text-slate-500 font-medium uppercase">GRAVITY LAB</span>
    </div>
  </div>
);

export const StatusIndicator: React.FC<{ label: string; value: string; active?: boolean; variant?: 'default' | 'danger' }> = ({ label, value, active, variant = 'default' }) => (
  <div className={`flex flex-col border-l-2 pl-4 py-1 transition-colors ${variant === 'danger' ? 'border-red-900' : 'border-slate-800'}`}>
    <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{label}</span>
    <span className={`mono text-sm font-bold transition-colors ${active ? (variant === 'danger' ? 'text-red-500' : 'text-blue-400') : 'text-slate-300'}`}>{value}</span>
  </div>
);

export const LabBorder: React.FC<{ children: React.ReactNode; className?: string; isDanger?: boolean }> = ({ children, className = "", isDanger }) => (
  <div className={`relative p-6 border transition-all duration-500 bg-slate-900/40 backdrop-blur-xl shadow-2xl rounded-lg overflow-hidden ${isDanger ? 'border-red-900 shadow-red-900/10' : 'border-slate-800'} ${className}`}>
    <div className={`absolute top-0 right-0 w-8 h-8 border-t border-r pointer-events-none transition-colors ${isDanger ? 'border-red-700' : 'border-slate-700'}`} />
    <div className={`absolute bottom-0 left-0 w-8 h-8 border-b border-l pointer-events-none transition-colors ${isDanger ? 'border-red-700' : 'border-slate-700'}`} />
    {children}
  </div>
);
