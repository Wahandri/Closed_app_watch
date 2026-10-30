import React, { useState } from 'react';
import {
  Github,
  Download,
  Terminal,
  FileCode,
  Watch,
  Check,
  Copy,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Type
} from 'lucide-react';
import { WatchPreview } from './components/WatchPreview';
import { CodeViewer } from './components/CodeViewer';
import { generateProjectZip } from './utils/zipExporter';

export default function App() {
  const [activeTab, setActiveTab] = useState<'github' | 'preview' | 'code' | 'adb'>('github');
  const [copiedCommands, setCopiedCommands] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const gitBashSnippet = `# 1. Inicializar repositorio git
git init

# 2. Agregar todos los archivos y hacer commit inicial
git add .
git commit -m "feat: Xiaomi Watch 2 Recent Apps Manager with Large Fonts"

# 3. Vincular con tu repositorio en GitHub y subir
git branch -M main
git remote add origin https://github.com/TU_USUARIO/wear-recent-apps.git
git push -u origin main`;

  const handleCopyCommands = async () => {
    try {
      await navigator.clipboard.writeText(gitBashSnippet);
      setCopiedCommands(true);
      setTimeout(() => setCopiedCommands(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const zipBlob = await generateProjectZip();
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'WearRecentApps-XiaomiWatch2.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-neutral-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-cyan-500/20">
              <Github className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  Wear OS Build Hub • Xiaomi Watch 2
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Listo para GitHub
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Código fuente Android en Kotlin • Jetpack Compose • Letra Grande (Watch) • Compilación de APK
              </p>
            </div>
          </div>

          {/* Action & Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800">
              <button
                onClick={() => setActiveTab('github')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'github'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                <span>Subir a GitHub</span>
              </button>

              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Letra Grande</span>
              </button>

              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'code'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Archivos (.kt / Gradle)</span>
              </button>

              <button
                onClick={() => setActiveTab('adb')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'adb'
                    ? 'bg-cyan-500 text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Instalar APK (ADB)</span>
              </button>
            </nav>

            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isZipping ? 'Generando...' : 'Descargar ZIP'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">

        {/* TAB 1: GITHUB SETUP & DIRECT WORKFLOW */}
        {activeTab === 'github' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Hero Card */}
            <div className="rounded-2xl bg-gradient-to-br from-cyan-950/40 via-neutral-900 to-neutral-950 border border-cyan-800/40 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800">
                      Turnkey Repository
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">Wear OS 3.5 / 4 • API 30-34</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white">
                    Proyecto completo listo para subir a GitHub y compilar la APK
                  </h2>
                  <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed max-w-2xl">
                    Incluye toda la estructura de Gradle, manifiesto de reloj, código Kotlin con <strong>letra grande optimizada para pantalla circular</strong>, y el flujo de <strong>GitHub Actions</strong> para compilar el APK automáticamente en la nube sin necesidad de tener Android Studio instalado.
                  </p>
                </div>

                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping}
                  className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-95 transition-all shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>{isZipping ? 'Preparando ZIP...' : 'Descargar Proyecto ZIP'}</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step GitHub Push Guide */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center text-xs font-bold">1</span>
                <span>Comandos para subir a tu GitHub</span>
              </h3>
              <p className="text-xs text-neutral-400">
                Crea un repositorio vacío en tu cuenta de GitHub (ej: <code className="text-cyan-300 font-mono">wear-recent-apps</code>), descomprime el ZIP descargado en tu ordenador, abre la terminal en esa carpeta y pega:
              </p>

              <div className="relative group">
                <pre className="p-4 rounded-xl bg-black text-cyan-300 font-mono text-xs border border-neutral-800 overflow-x-auto leading-relaxed">
                  {gitBashSnippet}
                </pre>
                <button
                  onClick={handleCopyCommands}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 font-medium flex items-center gap-1.5 transition-colors border border-neutral-700"
                >
                  {copiedCommands ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Copiar Comandos</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Automatic GitHub Actions APK Builder Card */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold">2</span>
                  <span>Compilación Automática en GitHub Actions (.github/workflows/build-apk.yml)</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
                  Incluido en el ZIP
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed">
                No necesitas tener instalado Android Studio ni el SDK en tu PC si no quieres. En cuanto hagas el <code className="text-cyan-300 font-mono">git push</code>, los servidores de GitHub ejecutarán automáticamente el workflow de Ubuntu, compilarán la APK con Gradle y la dejarán disponible para descargar en la pestaña <strong>Actions &gt; Artifacts</strong>:
              </p>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 font-mono text-xs text-neutral-300 space-y-1">
                <div className="text-neutral-500"># Ruta donde se generará la APK compilada:</div>
                <div className="text-emerald-400">app/build/outputs/apk/debug/app-debug.apk</div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('preview')}
                className="p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-cyan-400 transition-colors">
                    Ver Diseño con Letra Grande
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    18sp / 16sp para lectura cómoda en la pantalla del reloj
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => setActiveTab('adb')}
                className="p-4 rounded-2xl bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-cyan-400 transition-colors">
                    Instalar en Xiaomi Watch 2
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Comandos ADB por Wi-Fi y permiso de uso
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: WATCH SCREEN PREVIEW (LARGE FONT) */}
        {activeTab === 'preview' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Previsualización con Letra Grande (Optimizada para Reloj)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Xiaomi Watch 2
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Compara y comprueba cómo las fuentes ampliadas (16sp-18sp) y los botones táctiles de 38-52dp aseguran legibilidad perfecta en la muñeca.
              </p>
            </div>

            <WatchPreview />
          </div>
        )}

        {/* TAB 3: CODE VIEWER */}
        {activeTab === 'code' && (
          <div className="space-y-4">
            <CodeViewer />
          </div>
        )}

        {/* TAB 4: ADB GUIDE */}
        {activeTab === 'adb' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Instalación de la APK en el Xiaomi Watch 2 vía Wi-Fi
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Sin cables: depuración inalámbrica directa entre tu PC/Mac y el reloj
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-neutral-300">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <h4 className="font-bold text-cyan-400">Paso 1: Activar Opciones de Desarrollador</h4>
                  <p className="text-neutral-400">
                    En el reloj: <strong>Ajustes &gt; Sistema &gt; Información</strong>. Pulsa 7 veces seguidas en <strong>Número de compilación</strong>.
                    Luego ve a <strong>Ajustes &gt; Opciones de desarrollador</strong> y activa <em>Depuración ADB</em> y <em>Depuración inalámbrica</em>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <h4 className="font-bold text-cyan-400">Paso 2: Vincular por Wi-Fi</h4>
                  <p className="text-neutral-400">
                    Pulsa &quot;Vincular nuevo dispositivo&quot; en el reloj y ejecuta en tu terminal:
                  </p>
                  <pre className="p-2.5 rounded bg-black text-cyan-300 font-mono text-xs overflow-x-auto">
                    adb pair 192.168.1.XX:PUERTO_PAIR  # Introduce el código de 6 dígitos que muestra el reloj
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <h4 className="font-bold text-cyan-400">Paso 3: Conectar e Instalar APK</h4>
                  <pre className="p-2.5 rounded bg-black text-cyan-300 font-mono text-xs overflow-x-auto">
                    {`adb connect 192.168.1.XX:5555
adb install -r app-debug.apk`}
                  </pre>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5">
                  <h4 className="font-bold text-emerald-400">Paso 4: Conceder Permiso Especial de Acceso de Uso</h4>
                  <p className="text-neutral-400">
                    Dado que en Wear OS no siempre aparece el menú de &quot;Acceso a datos de uso&quot;, concédelo directamente por ADB:
                  </p>
                  <pre className="p-2.5 rounded bg-black text-emerald-400 font-mono text-xs overflow-x-auto">
                    adb shell appops set com.example.wearrecentapps android:get_usage_stats allow
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/60 py-4 text-center text-xs text-neutral-500 bg-neutral-950">
        <p>
          Wear OS Standalone Project for Xiaomi Watch 2 • Compilación nativa Android con Gradle y Jetpack Compose
        </p>
      </footer>

    </div>
  );
}
