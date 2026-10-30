import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Trash2,
  Plus,
  Volume2,
  VolumeX,
  X,
  Activity,
  Music,
  MessageCircle,
  MapPin,
  Radio,
  Cpu,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone
} from 'lucide-react';
import {
  AppInfo,
  INITIAL_WATCH_APPS,
  filterUserFacingApps,
  simulateKillApp,
  simulateKillAll,
  calculateMemoryUsage,
} from '../logic/appManager';

export const WatchEmulator: React.FC = () => {
  const [apps, setApps] = useState<AppInfo[]>(() => filterUserFacingApps(INITIAL_WATCH_APPS, false));
  const [closingPackage, setClosingPackage] = useState<string | null>(null);
  const [showSystemApps, setShowSystemApps] = useState(false);
  const [hapticSound, setHapticSound] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timeStr, setTimeStr] = useState('10:09');
  const [scrollProgress, setScrollProgress] = useState(0);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play subtle haptic click sound
  const playHapticTick = () => {
    if (!hapticSound) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      const ctx = audioCtxRef.current;
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.035);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.035);
      }
    } catch {
      // Audio not permitted or supported
    }
  };

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleCloseApp = (packageName: string, appName: string) => {
    playHapticTick();
    setClosingPackage(packageName);

    setTimeout(() => {
      const { updatedApps, freedRamMb } = simulateKillApp(apps, packageName);
      setApps(updatedApps);
      setClosingPackage(null);
      showToast(`Cerrada: ${appName} (+${freedRamMb}MB liberados)`);
    }, 220);
  };

  const handleKillAll = () => {
    playHapticTick();
    const { updatedApps, freedRamMb, countKilled } = simulateKillAll(apps, showSystemApps);
    setApps(updatedApps);
    showToast(`${countKilled} apps cerradas (+${freedRamMb}MB liberados)`);
  };

  const handleReset = () => {
    playHapticTick();
    setApps(filterUserFacingApps(INITIAL_WATCH_APPS, showSystemApps));
    showToast('Lista de aplicaciones reiniciada');
  };

  const handleAddSampleApp = () => {
    playHapticTick();
    const newApp: AppInfo = {
      id: `app_${Date.now()}`,
      packageName: 'com.komoot.android',
      appName: 'Komoot Rutas',
      iconName: 'navigation',
      category: 'navigation',
      ramMb: 118,
      lastActiveMinutesAgo: 1,
      isSystem: false,
      isRunning: true,
      versionName: '1.2.0',
    };
    if (apps.some(a => a.packageName === newApp.packageName)) {
      showToast('Komoot ya está en ejecución');
      return;
    }
    setApps([newApp, ...apps]);
    showToast('Abierta nueva app: Komoot');
  };

  const handleToggleSystem = () => {
    const nextVal = !showSystemApps;
    setShowSystemApps(nextVal);
    setApps(filterUserFacingApps(INITIAL_WATCH_APPS, nextVal));
    showToast(nextVal ? 'Mostrando procesos del sistema' : 'Filtrando: Solo apps de usuario');
  };

  // Scroll listener for Rotary Crown & PositionIndicator
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      setScrollProgress(el.scrollTop / maxScroll);
    }
  };

  // Simulate digital crown rotation
  const rotateCrown = (delta: number) => {
    playHapticTick();
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop += delta;
    }
  };

  const memory = calculateMemoryUsage(apps, 2048);

  const renderAppIcon = (iconName: string, category: string) => {
    switch (category) {
      case 'fitness':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'music':
        return <Music className="w-4 h-4 text-purple-400" />;
      case 'communication':
        return <MessageCircle className="w-4 h-4 text-emerald-300" />;
      case 'navigation':
        return <MapPin className="w-4 h-4 text-sky-400" />;
      case 'system':
        return <Cpu className="w-4 h-4 text-amber-400" />;
      default:
        return <Radio className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-8 py-4">
      {/* LEFT: Xiaomi Watch 2 Hardware Simulation */}
      <div className="relative flex flex-col items-center">
        {/* Watch Chassis (Xiaomi Watch 2 46mm circular black aluminum casing) */}
        <div className="relative w-[340px] sm:w-[380px] h-[340px] sm:h-[380px] rounded-full p-3 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black shadow-2xl ring-1 ring-white/10 flex items-center justify-center select-none">
          
          {/* Subtle bezel ring with hour ticks */}
          <div className="absolute inset-2 rounded-full border border-neutral-700/60 pointer-events-none opacity-40">
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-2 bg-neutral-400 rounded-full" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-2 bg-neutral-400 rounded-full" />
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-1 bg-neutral-400 rounded-full" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-1 bg-neutral-400 rounded-full" />
          </div>

          {/* Right Crown Button (Physical Digital Crown - Rotatable & Clickable) */}
          <button
            onClick={() => rotateCrown(45)}
            title="Girar Corona Digital (Bajar lista)"
            className="absolute -right-3 top-[32%] w-4 h-12 rounded-r-md bg-gradient-to-b from-neutral-600 via-neutral-400 to-neutral-700 shadow-lg border-l border-neutral-900 active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 group z-20 cursor-ns-resize"
          >
            <div className="w-1.5 h-0.5 bg-neutral-800 rounded-full" />
            <div className="w-1.5 h-0.5 bg-neutral-800 rounded-full" />
            <div className="w-1.5 h-0.5 bg-neutral-800 rounded-full" />
          </button>

          {/* Right Secondary Button */}
          <button
            onClick={handleAddSampleApp}
            title="Botón Físico Inferior: Simular apertura de nueva app"
            className="absolute -right-2 top-[58%] w-3 h-10 rounded-r-sm bg-gradient-to-b from-neutral-700 via-neutral-500 to-neutral-800 shadow-md border-l border-neutral-900 active:scale-95 transition-transform z-20"
          />

          {/* Inner Display (1.43" AMOLED Round Screen 466x466) */}
          <div className="relative w-full h-full rounded-full overflow-hidden bg-black text-white flex flex-col border border-neutral-800/80 shadow-inner">
            
            {/* Top Wear OS TimeText */}
            <div className="absolute top-2 left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
              <span className="text-[11px] font-semibold tracking-wider text-neutral-300 drop-shadow">
                {timeStr}
              </span>
            </div>

            {/* PositionIndicator (Right curved scroll bar indicator) */}
            <div className="absolute right-2 top-16 bottom-16 w-1 z-30 pointer-events-none flex flex-col justify-center items-center">
              <div className="w-0.5 h-full bg-neutral-800/60 rounded-full relative overflow-hidden">
                <div
                  className="w-full bg-cyan-400 rounded-full transition-all duration-75"
                  style={{
                    height: '28%',
                    transform: `translateY(${scrollProgress * 250}%)`,
                  }}
                />
              </div>
            </div>

            {/* Notification Toast simulation */}
            {toastMessage && (
              <div className="absolute top-8 left-6 right-6 z-40 bg-neutral-900/95 border border-cyan-500/40 text-cyan-300 text-[11px] px-3 py-1.5 rounded-full text-center shadow-lg backdrop-blur-sm truncate animate-in fade-in zoom-in duration-200">
                {toastMessage}
              </div>
            )}

            {/* Scrollable ScalingLazyColumn Container */}
            <div
              ref={listContainerRef}
              onScroll={handleScroll}
              className="w-full h-full overflow-y-auto px-5 pt-11 pb-16 flex flex-col items-center"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {/* Header inside circular list */}
              <div className="text-center mb-3">
                <span className="inline-block text-[10px] font-bold tracking-wider text-cyan-400 uppercase bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/50">
                  Apps Recientes
                </span>
                <p className="text-[10px] text-neutral-400 mt-1">
                  {apps.length} {apps.length === 1 ? 'activa' : 'activas'}
                </p>
              </div>

              {/* Cards List with Scaling and Swipe physics */}
              {apps.length === 0 ? (
                <div className="flex flex-col items-center justify-center my-auto py-8 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-white">Memoria Libre</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">
                    No hay aplicaciones activas en segundo plano.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-3 px-3 py-1 rounded-full bg-cyan-500 text-black text-[11px] font-medium active:scale-95 transition-transform"
                  >
                    Restaurar lista
                  </button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-2.5">
                  {apps.map((app) => {
                    const isBeingClosed = closingPackage === app.packageName;
                    return (
                      <div
                        key={app.packageName}
                        className={`w-[92%] relative transition-all duration-200 ease-out ${
                          isBeingClosed
                            ? 'opacity-0 -translate-x-full scale-75 max-h-0 py-0 overflow-hidden'
                            : 'opacity-100 translate-x-0 scale-100 max-h-36'
                        }`}
                      >
                        {/* AppCard (Wear OS Material Spec simulation) */}
                        <div
                          onClick={() => handleCloseApp(app.packageName, app.appName)}
                          className="relative rounded-2xl bg-neutral-900/90 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-800 p-2.5 transition-colors shadow-md cursor-pointer select-none"
                        >
                          {/* Row 1: Icon, App Name, Close Button */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700/50">
                                {renderAppIcon(app.iconName, app.category)}
                              </div>
                              <div className="truncate">
                                <h4 className="text-[12px] font-semibold text-white leading-tight truncate">
                                  {app.appName}
                                </h4>
                                <span className="text-[9px] text-neutral-400 block truncate">
                                  {app.packageName}
                                </span>
                              </div>
                            </div>

                            {/* Direct Close Button on card */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCloseApp(app.packageName, app.appName);
                              }}
                              title={`Cerrar ${app.appName}`}
                              className="w-6 h-6 rounded-full bg-red-500/10 hover:bg-red-500/30 text-red-400 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Row 2: Memory & Time Info */}
                          <div className="mt-1.5 pt-1 border-t border-neutral-800/80 flex items-center justify-between text-[9px] text-neutral-400">
                            <span className="text-cyan-400/90 font-mono">
                              ~{app.ramMb} MB RAM
                            </span>
                            <span className="flex items-center gap-0.5 text-neutral-400">
                              <Clock className="w-2.5 h-2.5" /> Hace {app.lastActiveMinutesAgo}m
                            </span>
                          </div>

                          {/* Action Hint */}
                          <div className="text-[8px] text-neutral-500 text-center mt-1 select-none">
                            Pulsa o toca X para cerrar
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* "Cerrar Todas" Chip */}
                  <div className="w-[88%] mt-2 pb-2">
                    <button
                      onClick={handleKillAll}
                      className="w-full py-2 px-3 rounded-full bg-red-600/90 hover:bg-red-600 text-white font-medium text-[11px] flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cerrar Todas
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Curve Indicator Overlay */}
            <div className="absolute bottom-1 left-0 right-0 h-4 bg-gradient-to-t from-black to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Digital Crown Rotary Controls Indicator */}
        <div className="flex items-center gap-3 mt-4 text-xs text-neutral-400">
          <span className="text-neutral-500">Corona Digital:</span>
          <button
            onClick={() => rotateCrown(-60)}
            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 active:scale-95 text-[11px]"
          >
            ▲ Girar Arriba
          </button>
          <button
            onClick={() => rotateCrown(60)}
            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 active:scale-95 text-[11px]"
          >
            ▼ Girar Abajo
          </button>
        </div>
      </div>

      {/* RIGHT: Live Watch Telemetry & Control Deck */}
      <div className="w-full max-w-md flex flex-col gap-4">
        
        {/* Device Status Card */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Xiaomi Watch 2</h3>
                <p className="text-[11px] text-neutral-400">Snapdragon W5+ Gen 1 • Wear OS 3.5 / 4</p>
              </div>
            </div>
            <button
              onClick={() => setHapticSound(!hapticSound)}
              title={hapticSound ? 'Silenciar Háptica' : 'Activar Sonido Háptico'}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              {hapticSound ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
            </button>
          </div>

          {/* RAM Meter Gauge */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-400">Memoria RAM (LPDDR4X 2GB)</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {memory.usedMb} MB / 2048 MB ({memory.percentage}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  memory.percentage > 75
                    ? 'bg-red-500'
                    : memory.percentage > 50
                    ? 'bg-amber-400'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${memory.percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
              <span>Libre: {memory.freeMb} MB</span>
              <span>Procesos del SO base: ~820 MB</span>
            </div>
          </div>

          {/* Quick Simulation Actions */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={handleAddSampleApp}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              Lanzar Otra App
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              Restaurar Apps
            </button>
          </div>

          <div className="mt-2.5">
            <button
              onClick={handleToggleSystem}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                showSystemApps
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                  : 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              {showSystemApps ? 'Ocultar Procesos del Sistema' : 'Mostrar Procesos del Sistema (Debug)'}
            </button>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 text-xs text-neutral-300 flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Características Implementadas en Código:</span>
          </div>
          <ul className="space-y-1.5 text-neutral-400 text-[11px]">
            <li className="flex items-start gap-1.5">
              <span className="text-cyan-400">✔</span>
              <span><strong>ScalingLazyColumn:</strong> Escalado automático de tarjetas en los bordes curvos de la pantalla circular.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-cyan-400">✔</span>
              <span><strong>Gesto de Cierre Rápido:</strong> Pulsación y descarte animado que simula e invoca el cierre de la app.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-cyan-400">✔</span>
              <span><strong>Filtrado FLAG_SYSTEM:</strong> Ignora procesos vitales de Android/Xiaomi UI para evitar bootloops.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <span className="text-cyan-400">✔</span>
              <span><strong>Corona Digital (Rotary Input):</strong> Navegación fluida girando la corona del Xiaomi Watch 2.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
