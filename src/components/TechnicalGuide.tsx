import React from 'react';
import { ShieldCheck, Cpu, Smartphone, Layers, Zap, AlertTriangle, Terminal, CheckCircle2 } from 'lucide-react';

export const TechnicalGuide: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 text-neutral-300">
      
      {/* Introduction Card */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              Arquitectura Técnica Wear OS: Xiaomi Watch 2
            </h2>
            <p className="text-xs text-neutral-400">
              Snapdragon W5+ Gen 1 • 2GB RAM • Wear OS 3.5 / 4 (Android 11/13 API 30+)
            </p>
          </div>
        </div>
        <p className="text-sm text-neutral-300 leading-relaxed">
          En Wear OS, gestionar procesos recientes requiere entender cómo interactúan los componentes circulares de 
          <strong> Jetpack Compose</strong> con las políticas de aislamiento (sandbox) de procesos de Android moderno.
          A continuación tienes los detalles técnicos de cada uno de los 3 requisitos solicitados.
        </p>
      </div>

      {/* 1. UI Circular y Gestos */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-md">
        <div className="flex items-center gap-2.5 text-cyan-400 font-semibold text-base mb-3">
          <Layers className="w-5 h-5" />
          <h3>1. Interfaz Circular con Jetpack Compose for Wear OS</h3>
        </div>
        
        <div className="space-y-4 text-xs leading-relaxed text-neutral-300">
          <p>
            A diferencia de un teléfono con <code className="text-cyan-300 font-mono">LazyColumn</code> estándar, las pantallas redondas de 1.43 pulgadas (466x466) como la del Xiaomi Watch 2 sufren recortes en las cuatro esquinas. Por eso se utilizan los componentes oficiales de <strong>androidx.wear.compose</strong>:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <h4 className="font-semibold text-white text-xs mb-1">ScalingLazyColumn</h4>
              <p className="text-neutral-400">
                Calcula automáticamente la transformación de perspectiva y escala (de 0.7f a 1.0f) a medida que las tarjetas entran o salen de los polos superior e inferior de la esfera.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <h4 className="font-semibold text-white text-xs mb-1">Corona Rotatoria (Rotary Input)</h4>
              <p className="text-neutral-400">
                El Xiaomi Watch 2 posee una corona digital con feedback háptico. En el código adjunto se vincula con <code className="text-cyan-300 font-mono">Modifier.onRotaryScrollEvent</code> para permitir desplazarte sin tapar la pantalla con el dedo.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <h4 className="font-semibold text-white text-xs mb-1">Gesto de Cierre / Deslizamiento</h4>
              <p className="text-neutral-400">
                Implementado mediante animaciones de descarte con <code className="text-cyan-300 font-mono">AnimatedVisibility</code> (fade + shrink vertical/horizontal), además del botón directo de aspa para accesibilidad rápida.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <h4 className="font-semibold text-white text-xs mb-1">AppCard & Iconos</h4>
              <p className="text-neutral-400">
                Cada tarjeta extrae el <code className="text-cyan-300 font-mono">Drawable</code> original del <code className="text-cyan-300 font-mono">PackageManager</code> y lo convierte a Bitmap de Compose, junto con la estimación de RAM y tiempo transcurrido.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Detección de Apps sin Root */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-md">
        <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-base mb-3">
          <ShieldCheck className="w-5 h-5" />
          <h3>2. Lógica de Detección sin Permisos Root</h3>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
          <p>
            En versiones antiguas de Android (pre-Android 5.1), <code className="text-cyan-300 font-mono">getRunningTasks()</code> devolvía todas las apps abiertas. Desde Android 8 a Android 13/14 (que es la base de Wear OS 3.5 y 4), Google aisló este método por privacidad y seguridad.
          </p>

          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <h4 className="font-semibold text-white">¿Cómo lo resuelve nuestra implementación?</h4>
            <ul className="list-disc list-inside space-y-1.5 text-neutral-400">
              <li>
                <strong>UsageStatsManager:</strong> Es la API oficial de Android moderna. Registra las aplicaciones usadas recientemente y calcula su último instante de actividad (<code className="text-cyan-300 font-mono">lastTimeUsed</code>). Requiere el permiso especial <code className="text-amber-300 font-mono">PACKAGE_USAGE_STATS</code>.
              </li>
              <li>
                <strong>Filtrado de Procesos del Sistema:</strong> Evaluamos <code className="text-cyan-300 font-mono">(appInfo.flags and ApplicationInfo.FLAG_SYSTEM) == 0</code>. Esto excluye automáticamente la interfaz del sistema (SystemUI), el lanzador de Xiaomi (<code className="text-neutral-400 font-mono">com.xiaomi.wearos.launcher</code>), los servicios de Google Play y controladores de hardware.
              </li>
              <li>
                <strong>ActivityManager.getRunningAppProcesses():</strong> Proporciona soporte complementario para procesos de fondo no durmientes.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Funcionalidad de Cierre y Seguridad Android */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-md">
        <div className="flex items-center gap-2.5 text-red-400 font-semibold text-base mb-3">
          <Zap className="w-5 h-5" />
          <h3>3. Funcionalidad de Cierre: La Realidad Técnica de Android</h3>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-neutral-300">
          <p>
            Existe una distinción técnica crucial que todo desarrollador de Android debe conocer:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>killBackgroundProcesses(pkg)</span>
              </div>
              <p className="text-neutral-400">
                <strong>Permiso:</strong> <code className="text-emerald-300 font-mono">android.permission.KILL_BACKGROUND_PROCESSES</code> (Normal, no requiere root).
                <br /><br />
                <strong>Qué hace:</strong> El sistema operativo mata de inmediato todos los procesos en segundo plano, servicios no prioritarios y caches de memoria asociados a ese paquete. Es exactamente lo que hace el botón de "optimizar RAM" de Android.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>forceStopPackage(pkg)</span>
              </div>
              <p className="text-neutral-400">
                <strong>Permiso:</strong> <code className="text-amber-300 font-mono">android.permission.FORCE_STOP_PACKAGES</code> (Firma de sistema / Privilegiado).
                <br /><br />
                <strong>Alcance:</strong> Las aplicaciones normales de usuario no pueden invocarlo directamente salvo que uses <strong>Shizuku</strong> (ADB local) o un <strong>AccessibilityService</strong> que automatice el clic en "Forzar detención" en Ajustes.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200">
            <strong>Recomendación para tu app personal:</strong> La implementación que te proporcionamos utiliza <code className="font-mono">killBackgroundProcesses</code>, lo cual es 100% seguro, limpia la memoria RAM del Xiaomi Watch 2 y no requiere root ni modificaciones peligrosas en el firmware.
          </div>
        </div>
      </div>

      {/* 4. Comandos Rápidos ADB */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-md">
        <div className="flex items-center gap-2.5 text-purple-400 font-semibold text-base mb-3">
          <Terminal className="w-5 h-5" />
          <h3>4. Otorgar Permisos por ADB en el Xiaomi Watch 2</h3>
        </div>

        <p className="text-xs text-neutral-300 mb-3">
          Para que la app pueda leer qué aplicaciones están en segundo plano sin entrar a menús ocultos de Wear OS, ejecuta este comando una sola vez en tu consola de PC/Mac:
        </p>

        <div className="bg-neutral-950 p-3 rounded-xl font-mono text-xs text-cyan-300 border border-neutral-800 overflow-x-auto">
          adb shell appops set com.example.wearrecentapps android:get_usage_stats allow
        </div>
      </div>

    </div>
  );
};
