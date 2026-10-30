import React, { useState } from 'react';
import { Activity, Music, MessageCircle, MapPin, Radio, X, Trash2, Smartphone, Type, Check } from 'lucide-react';

export const WatchPreview: React.FC = () => {
  const [largeFont, setLargeFont] = useState(true);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center gap-6 p-4">
      {/* Visual Watch Display Frame */}
      <div className="relative w-[320px] h-[320px] rounded-full p-2.5 bg-gradient-to-br from-neutral-850 via-neutral-900 to-black ring-1 ring-white/10 shadow-2xl flex items-center justify-center select-none shrink-0">
        
        {/* Watch Bezel Marks */}
        <div className="absolute inset-1.5 rounded-full border border-neutral-700/40 pointer-events-none" />

        {/* AMOLED Screen 466x466 scaled */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-black text-white flex flex-col items-center justify-start border border-neutral-800 p-4 pt-6">
          
          {/* Top TimeText */}
          <div className="text-center mb-1">
            <span className="text-neutral-400 font-bold text-xs tracking-wider">
              10:09
            </span>
          </div>

          {/* Curved Position Indicator on Right Edge */}
          <div className="absolute right-2 top-16 bottom-16 w-0.5 bg-cyan-400 rounded-full" />

          {/* List Content */}
          <div className="w-full flex-1 overflow-hidden flex flex-col items-center gap-2">
            
            {/* Header */}
            <div className="text-center mb-0.5">
              <h3 className={`font-extrabold text-cyan-400 ${largeFont ? 'text-base leading-tight' : 'text-xs'}`}>
                Apps Activas
              </h3>
              <p className={`text-neutral-400 font-semibold ${largeFont ? 'text-xs' : 'text-[10px]'}`}>
                3 en ejecución
              </p>
            </div>

            {/* App Card 1: Spotify */}
            <div className="w-[96%] rounded-2xl bg-neutral-900 border border-neutral-800 p-2.5 shadow">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-purple-400 shrink-0">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className={`font-bold text-white leading-tight truncate ${largeFont ? 'text-sm' : 'text-xs'}`}>
                      Spotify
                    </h4>
                    <span className={`font-semibold text-cyan-300 block ${largeFont ? 'text-[11px]' : 'text-[9px]'}`}>
                      112 MB RAM • Hace 2m
                    </span>
                  </div>
                </div>

                {/* Big Close Button (40dp on Wear OS) */}
                <button
                  className={`rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30 ${
                    largeFont ? 'w-8 h-8' : 'w-6 h-6'
                  }`}
                  title="Cerrar app"
                >
                  <X className={largeFont ? 'w-4 h-4' : 'w-3 h-3'} />
                </button>
              </div>
            </div>

            {/* App Card 2: Strava */}
            <div className="w-[96%] rounded-2xl bg-neutral-900 border border-neutral-800 p-2.5 shadow">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h4 className={`font-bold text-white leading-tight truncate ${largeFont ? 'text-sm' : 'text-xs'}`}>
                      Strava GPS
                    </h4>
                    <span className={`font-semibold text-cyan-300 block ${largeFont ? 'text-[11px]' : 'text-[9px]'}`}>
                      145 MB RAM • Hace 5m
                    </span>
                  </div>
                </div>

                <button
                  className={`rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30 ${
                    largeFont ? 'w-8 h-8' : 'w-6 h-6'
                  }`}
                  title="Cerrar app"
                >
                  <X className={largeFont ? 'w-4 h-4' : 'w-3 h-3'} />
                </button>
              </div>
            </div>

            {/* "Cerrar Todas" Big Button */}
            <div className="w-[94%] mt-0.5">
              <div className={`w-full rounded-full bg-red-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md ${
                largeFont ? 'py-2 text-xs' : 'py-1 text-[10px]'
              }`}>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Cerrar Todas</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Typography Explainer & Toggle */}
      <div className="max-w-md flex flex-col gap-3">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Type className="w-4 h-4 text-cyan-400" />
          <span>Tipografía Optimizada para Pantalla de Reloj</span>
        </div>
        
        <p className="text-xs text-neutral-300 leading-relaxed">
          En un reloj de 1.43 pulgadas como el Xiaomi Watch 2, las fuentes estándar de móvil (11sp–12sp) obligan a forzar la vista y provocan toques erróneos.
          En el código Kotlin incluido en el repositorio hemos aplicado:
        </p>

        <ul className="text-xs text-neutral-400 space-y-2">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Títulos en 16sp – 18sp:</strong> Nombres de apps y cabecera en negrita para lectura inmediata de un vistazo en la muñeca.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>RAM y Tiempo en 13sp Alto Contraste:</strong> Color cian (#80DEEA) sobre fondo negro puro AMOLED.</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Botones de Toque Ampliado (38dp–52dp):</strong> Botones de aspa y &quot;Cerrar Todas&quot; para pulsación cómoda con el pulgar.</span>
          </li>
        </ul>

        {/* Font Toggle */}
        <div className="pt-2">
          <button
            onClick={() => setLargeFont(!largeFont)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-cyan-300 border border-neutral-700 transition-colors"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{largeFont ? 'Ver cómo se vería con letra pequeña (por defecto)' : 'Ver con Letra Grande (Optimizada)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
