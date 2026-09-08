/**
 * Genera la tarjeta HTML para un ejercicio individual.
 * Soporta fuentes de video MP4/WebM o GIF animados en bucle.
 * 
 * @param {Object} ex - Objeto del ejercicio (name, sets, reps, videoUrl, notes)
 * @returns {string} Cadena HTML optimizada para Tailwind.
 */
export function renderExerciseCard(ex) {
  const isVideo = ex.videoUrl && (ex.videoUrl.endsWith('.mp4') || ex.videoUrl.endsWith('.webm'));

  return `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 pdf-avoid-break">
      <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <h4 class="text-xs font-black text-amber-400 uppercase tracking-wider">${ex.name || 'Ejercicio'}</h4>
        <span class="text-[10px] bg-slate-950 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800 font-bold">
          ${ex.sets || 0} series × ${ex.reps || 0} reps
        </span>
      </div>

      ${ex.videoUrl ? `
        <div class="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 shadow-inner">
          ${isVideo ? `
            <video 
              src="${ex.videoUrl}" 
              autoplay 
              loop 
              muted 
              playsinline 
              class="w-full h-full object-cover"
              onerror="this.parentElement.innerHTML='<div class=\\'p-4 text-[10px] text-slate-500 text-center\\'>No se pudo cargar el video demostrativo.</div>';"
            ></video>
          ` : `
            <img 
              src="${ex.videoUrl}" 
              alt="${ex.name}" 
              class="w-full h-full object-cover"
              onerror="this.parentElement.innerHTML='<div class=\\'p-4 text-[10px] text-slate-500 text-center\\'>Imagen/GIF no disponible.</div>';"
            />
          `}
        </div>
      ` : ''}

      ${ex.notes ? `
        <p class="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50 italic">
          <strong class="text-slate-300 not-italic">Nota:</strong> ${ex.notes}
        </p>
      ` : ''}
    </div>
  `;
}