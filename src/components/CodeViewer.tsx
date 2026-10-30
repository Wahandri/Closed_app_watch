import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Sparkles, FolderTree } from 'lucide-react';
import { GITHUB_REPOSITORY_FILES, ProjectFile } from '../data/kotlinCodebase';
import { generateProjectZip } from '../utils/zipExporter';

export const CodeViewer: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>(GITHUB_REPOSITORY_FILES.find(f => f.filename === 'MainActivity.kt')?.path || GITHUB_REPOSITORY_FILES[0].path);
  const [copied, setCopied] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const activeFile: ProjectFile = GITHUB_REPOSITORY_FILES.find(f => f.path === selectedPath) || GITHUB_REPOSITORY_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    <div className="flex flex-col rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-xl">
      {/* Top Banner with ZIP Download CTA */}
      <div className="px-4 py-3 bg-gradient-to-r from-cyan-950/60 via-neutral-900 to-neutral-950 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white">
            Estructura de archivos lista para clonar o hacer push a GitHub
          </span>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isZipping ? 'Generando ZIP...' : 'Descargar Proyecto Completo (.ZIP)'}</span>
        </button>
      </div>

      {/* File Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-neutral-950 border-b border-neutral-800 overflow-x-auto">
        {GITHUB_REPOSITORY_FILES.map((file) => {
          const isSelected = file.path === selectedPath;
          return (
            <button
              key={file.path}
              onClick={() => setSelectedPath(file.path)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                isSelected
                  ? 'bg-neutral-800 text-cyan-400 border border-neutral-700 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{file.filename}</span>
            </button>
          );
        })}
      </div>

      {/* File Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 bg-neutral-900 border-b border-neutral-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-300">
            <span className="text-cyan-400 font-bold truncate">{activeFile.path}</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{activeFile.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copiar Archivo</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSingle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
            title="Descargar este archivo suelto"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Descargar</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="relative max-h-[540px] overflow-auto bg-[#0d1117] p-4 font-mono text-xs text-neutral-200 leading-relaxed scrollbar-thin">
        <pre className="overflow-x-auto whitespace-pre">
          <code>{activeFile.content}</code>
        </pre>
      </div>

      {/* Footer Info Pill */}
      <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Listo para compilar localmente con Gradle o automáticamente en GitHub Actions
        </span>
        <span className="font-mono text-neutral-500">
          {activeFile.content.split('\n').length} líneas
        </span>
      </div>
    </div>
  );
};
