
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useOrientation } from './hooks/useOrientation';
import LevelVisualizer from './components/LevelVisualizer';
import { 
  GeometricLogo, 
  StatusIndicator, 
  MedicalCross, 
  DangerTriangle,
  LabBorder 
} from './components/LaboratoryUI';
import { CalibrationOffset } from './types';

type Language = 'PL' | 'US';

const translations = {
  PL: {
    initTitle: "Inicjalizacja Sensorów",
    initDesc: "Diagnostyka laboratoryjna wymaga autoryzacji dostępu do akceleracji sprzętowej i silników haptycznych.",
    authorizeBtn: "Autoryzuj System",
    systemState: "Stan Systemu",
    centered: "STAN_WYCENTROWANO",
    optimal: "STAN_OPTYMALNY",
    critical: "KRYTYCZNY_POZA_ZAKRESEM",
    warning: "OSTRZEŻENIE_ZAKRESU",
    highDev: "DUŻE_ODCHYLENIE",
    aligning: "WYRÓWNYWANIE",
    pitchRel: "Δ Pochylenie Rel",
    rollRel: "Δ Przechylenie Rel",
    dangerWarn: "OSTRZEŻENIE: NADMIERNE ODCHYLENIE",
    targetActive: "CELOWANIE PRZEMIESZCZENIA AKTYWNE",
    magnitude: "Magnituda",
    haptics: "Haptyka",
    source: "Źródło",
    zeroBtn: "Zeruj Sensor",
    resetBtn: "Resetuj Cel",
    masterReset: "[ RESET_GŁÓWNY ]",
    dangerEngaged: "ZAGROŻENIE_AKTYWNE",
    streamActive: "STRUMIEŃ_AKTYWNY",
  },
  US: {
    initTitle: "Initialize Sensors",
    initDesc: "Laboratory-grade diagnostics require authorization to access hardware acceleration and haptic engines.",
    authorizeBtn: "Authorize System",
    systemState: "System State",
    centered: "STATE_CENTERED",
    optimal: "STATE_OPTIMAL",
    critical: "CRITICAL_OOB",
    warning: "RANGE_WARNING",
    highDev: "HIGH_DEVIATION",
    aligning: "ALIGNING",
    pitchRel: "Δ Pitch Rel",
    rollRel: "Δ Roll Rel",
    dangerWarn: "WARNING: EXCESSIVE DEVIATION",
    targetActive: "DISPLACEMENT TARGETING ACTIVE",
    magnitude: "Magnitude",
    haptics: "Haptics",
    source: "Source",
    zeroBtn: "Zero Sensor",
    resetBtn: "Reset Target",
    masterReset: "[ MASTER_RESET ]",
    dangerEngaged: "DANGER_ENGAGED",
    streamActive: "STREAM_ACTIVE",
  }
};

const App: React.FC = () => {
  const { data, error, isPermissionGranted, requestPermission } = useOrientation();
  const [lang, setLang] = useState<Language>('US');
  const [calibration, setCalibration] = useState<CalibrationOffset>({ beta: 0, gamma: 0 });
  const [targetOffset, setTargetOffset] = useState<CalibrationOffset>({ beta: 0, gamma: 0 });
  
  const t = translations[lang];
  const wasLevelRef = useRef(false);
  const wasDangerRef = useRef(false);
  const fullscreenRequestedRef = useRef(false);

  const pitch = useMemo(() => data.beta - calibration.beta, [data.beta, calibration.beta]);
  const roll = useMemo(() => data.gamma - calibration.gamma, [data.gamma, calibration.gamma]);

  const diffPitch = Math.abs(pitch - targetOffset.beta);
  const diffRoll = Math.abs(roll - targetOffset.gamma);
  
  const isCentered = diffPitch < 0.3 && diffRoll < 0.3;
  const isLevel = diffPitch < 0.6 && diffRoll < 0.6;
  
  const deviation = Math.sqrt(Math.pow(diffPitch, 2) + Math.pow(diffRoll, 2));
  const sensorMagnitude = Math.sqrt(Math.pow(pitch, 2) + Math.pow(roll, 2));
  const isDanger = deviation > 10 || sensorMagnitude > 13.5;

  const statusLabel = useMemo(() => {
    if (isCentered) return t.centered;
    if (isLevel) return t.optimal;
    if (isDanger) return sensorMagnitude > 14 ? t.critical : t.warning;
    if (deviation > 5) return t.highDev;
    return t.aligning;
  }, [isCentered, isLevel, isDanger, deviation, sensorMagnitude, t]);

  const enterFullScreen = () => {
    if (fullscreenRequestedRef.current) return;
    const doc = document.documentElement;
    if (doc.requestFullscreen) {
      doc.requestFullscreen().catch(() => {
        // Silently fail if blocked or already in fullscreen
      });
    }
    fullscreenRequestedRef.current = true;
  };

  useEffect(() => {
    if (!("vibrate" in navigator)) return;
    if (isLevel && !wasLevelRef.current) navigator.vibrate([40, 30, 40]);
    if (isDanger && !wasDangerRef.current) navigator.vibrate([100, 50, 100]);
    wasLevelRef.current = isLevel;
    wasDangerRef.current = isDanger;
  }, [isLevel, isDanger]);

  const handleAuthorize = () => {
    enterFullScreen();
    requestPermission();
  };

  const handleLanguageSelect = (newLang: Language) => {
    enterFullScreen();
    setLang(newLang);
  };

  const calibrateSensor = () => {
    setCalibration({ beta: data.beta, gamma: data.gamma });
    if ("vibrate" in navigator) navigator.vibrate(50);
  };

  const resetTarget = () => {
    setTargetOffset({ beta: 0, gamma: 0 });
    if ("vibrate" in navigator) navigator.vibrate([20, 10, 20]);
  };

  const resetAll = () => {
    setCalibration({ beta: 0, gamma: 0 });
    setTargetOffset({ beta: 0, gamma: 0 });
    if ("vibrate" in navigator) navigator.vibrate([20, 20, 20]);
  };

  const handleTargetMove = (targetPitch: number, targetRoll: number) => {
    setTargetOffset({ beta: targetPitch, gamma: targetRoll });
  };

  if (isPermissionGranted === null) {
    return (
      <div className="min-h-screen bg-grid flex flex-col items-center justify-center p-8 bg-slate-950 text-slate-100">
        <GeometricLogo />
        <LabBorder>
          <div className="text-center">
            <h1 className="text-lg font-bold text-slate-100 mb-2 uppercase tracking-tighter">{t.initTitle}</h1>
            <p className="text-sm text-slate-400 mb-8 max-w-[240px] mx-auto leading-relaxed">{t.initDesc}</p>
            
            <div className="flex gap-2 mb-6 justify-center">
              <button 
                onClick={() => handleLanguageSelect('PL')}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${lang === 'PL' ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
              >
                PL
              </button>
              <button 
                onClick={() => handleLanguageSelect('US')}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${lang === 'US' ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
              >
                US
              </button>
            </div>

            <button 
              onClick={handleAuthorize}
              className="w-full py-4 bg-blue-600 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-sm active:scale-95 transition-transform shadow-lg shadow-blue-900/20"
            >
              {t.authorizeBtn}
            </button>
          </div>
        </LabBorder>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-grid flex flex-col items-center p-6 sm:p-12 select-none touch-none overflow-hidden transition-colors duration-1000 ${isDanger ? 'bg-slate-950/80' : 'bg-slate-950'}`}>
      <div className="w-full max-w-md flex justify-between items-start mb-8">
        <GeometricLogo active={isLevel} />
        <div className="text-right">
          <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{t.systemState}</div>
          <div className="flex items-center gap-2 justify-end">
            {isDanger && <DangerTriangle className="w-3 h-3 text-red-500 animate-pulse" />}
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isLevel ? 'bg-blue-400 glow-blue animate-pulse' : isDanger ? 'bg-red-500 shadow-[0_0_8px_red]' : 'bg-slate-700'}`} />
            <span className={`mono text-[10px] font-bold uppercase transition-colors ${isLevel ? 'text-blue-400' : isDanger ? 'text-red-500' : 'text-slate-500'}`}>
              {statusLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-md flex flex-col justify-center gap-10">
        <LabBorder isDanger={isDanger}>
          <div className="absolute top-4 left-4 flex gap-2">
             <div className={`w-1 h-1 ${isDanger ? 'bg-red-900' : 'bg-slate-700'}`} />
             <div className={`w-1 h-1 ${isDanger ? 'bg-red-900' : 'bg-slate-700'}`} />
          </div>
          
          <LevelVisualizer 
            pitch={pitch} 
            roll={roll} 
            targetOffset={targetOffset}
            isLevel={isLevel} 
            isDanger={isDanger}
            onTargetMove={handleTargetMove}
          />
          
          <div className={`grid grid-cols-2 gap-8 mt-12 border-t pt-8 transition-colors ${isDanger ? 'border-red-900/40' : 'border-slate-800'}`}>
            <StatusIndicator 
              label={t.pitchRel} 
              value={`${(pitch - targetOffset.beta).toFixed(2)}°`} 
              active={Math.abs(pitch - targetOffset.beta) < 0.6}
              variant={isDanger ? 'danger' : 'default'}
            />
            <StatusIndicator 
              label={t.rollRel} 
              value={`${(roll - targetOffset.gamma).toFixed(2)}°`} 
              active={Math.abs(roll - targetOffset.gamma) < 0.6}
              variant={isDanger ? 'danger' : 'default'}
            />
          </div>

          <div className="mt-6 text-center">
            <span className={`text-[9px] uppercase tracking-[0.3em] transition-colors ${isDanger ? 'text-red-900 animate-pulse' : 'text-slate-600'}`}>
              {isDanger ? t.dangerWarn : t.targetActive}
            </span>
          </div>
        </LabBorder>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 border border-slate-800 bg-slate-900/30 rounded flex flex-col items-center justify-center">
            <span className="text-[8px] uppercase text-slate-500 tracking-tighter mb-1">{t.magnitude}</span>
            <span className={`mono text-[10px] font-bold ${isDanger ? 'text-red-500' : 'text-slate-400'}`}>{deviation.toFixed(1)}°</span>
          </div>
          <div className="p-3 border border-slate-800 bg-slate-900/30 rounded flex flex-col items-center justify-center">
            <span className="text-[8px] uppercase text-slate-500 tracking-tighter mb-1">{t.haptics}</span>
            <span className={`mono text-[10px] font-bold ${isDanger ? 'text-red-400' : 'text-blue-400'}`}>LINK_OK</span>
          </div>
          <div className="p-3 border border-slate-800 bg-slate-900/30 rounded flex flex-col items-center justify-center">
            <span className="text-[8px] uppercase text-slate-500 tracking-tighter mb-1">{t.source}</span>
            <span className="mono text-[10px] font-bold text-slate-400">IMU_V4</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md mt-8 grid grid-cols-2 gap-4">
        <button 
          onClick={calibrateSensor}
          className="py-4 border border-slate-800 bg-slate-900 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-300 rounded-sm active:bg-slate-800 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2 hover:border-slate-600"
        >
          <MedicalCross className="w-3 h-3 text-blue-400" />
          {t.zeroBtn}
        </button>
        <button 
          onClick={resetTarget}
          className="py-4 border border-slate-800 bg-slate-900 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 rounded-sm active:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {t.resetBtn}
        </button>
      </div>

      <div className="w-full max-w-md mt-8 pt-4 border-t border-slate-900 flex justify-between items-center text-[8px] text-slate-600 uppercase tracking-[0.2em] mono">
        <div className="flex gap-2 items-center">
          <div className={`w-1 h-1 rounded-full animate-pulse ${isDanger ? 'bg-red-500' : 'bg-blue-500/50'}`} />
          <span>{isDanger ? t.dangerEngaged : t.streamActive}</span>
        </div>
        <button onClick={resetAll} className="opacity-40 hover:opacity-100 transition-opacity flex gap-4 uppercase">
          {t.masterReset}
        </button>
      </div>
    </div>
  );
};

export default App;
