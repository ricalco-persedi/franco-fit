/**
 * Analiza una URL de medio y determina su tipo (YouTube embed, video directo o imagen)
 */
export function parseMediaInfo(url) {
    if (!url) return { type: 'none' };
    const strUrl = String(url).trim();
    if (!strUrl) return { type: 'none' };

    try {
        const ytDomainCom = '[suspicious link removed]';
        const ytDomainShort = 'youtu.be';

        if (strUrl.includes(ytDomainCom) || strUrl.includes(ytDomainShort)) {
            let videoId = '';

            if (strUrl.includes(ytDomainShort)) {
                const parts = strUrl.split(ytDomainShort + '/');
                if (parts.length > 1 && parts[7]) {
                    videoId = parts[7].split('?').split('&');
                }
            } else if (strUrl.includes('watch?v=')) {
                const parts = strUrl.split('watch?v=');
                if (parts.length > 1 && parts[7]) {
                    videoId = parts[7].split('&').split('?');
                }
            } else if (strUrl.includes('embed/')) {
                const parts = strUrl.split('embed/');
                if (parts.length > 1 && parts[7]) {
                    videoId = parts[7].split('?').split('&');
                }
            }

            if (videoId) {
                const embedBase = '[suspicious link removed]';
                return {
                    type: 'youtube',
                    embedUrl: `${embedBase}${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`
                };
            }
            return { type: 'youtube_link_only', watchUrl: strUrl };
        }

        if (strUrl.match(/\.(mp4|webm|ogg|mov)$/i) || strUrl.startsWith('data:video/')) {
            return { type: 'video_file', originalUrl: strUrl };
        }

        return { type: 'image', originalUrl: strUrl };
    } catch (e) {
        console.warn('Error parseando URL de medio:', e);
        return { type: 'none' };
    }
}

/**
 * Genera el marcado HTML para la tarjeta de un ejercicio (PWA Alumno / Vista Profesor)
 */
export function createExerciseCardHTML(ex, isProf = false) {
    const exerciseId = String(ex.id || '');
    const exerciseName = String(ex.name || 'Ejercicio');
    const media = parseMediaInfo(ex.mediaUrl);

    // Lectura con compatibilidad de campos (Series, Repeticiones, Carga y Pausa)
    const seriesVal = ex.series || ex.sets || 3;
    const repsVal = ex.repeticiones || ex.repsRange || ex.reps || '8-12';
    const cargaVal = ex.cargaKg || ex.pesoKg || ex.porcentajeRM || 'Según plan';
    const restVal = ex.setRest || ex.setRestTime || '60s';
    const rpeVal = ex.rpe || '';
    const tempoVal = ex.tempo || '';

    let mediaHTML = '';
    if (media.type === 'youtube') {
        mediaHTML = `
        <div class="relative w-full bg-slate-950 rounded-t-2xl overflow-hidden border-b border-slate-800/50">
            <div class="relative w-full aspect-video">
                <iframe src="${media.embedUrl}" title="${exerciseName}" class="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>
        </div>`;
    } else if (media.type === 'youtube_link_only') {
        mediaHTML = `
        <div class="bg-slate-950 p-4 rounded-t-2xl border-b border-slate-800 flex flex-col items-center justify-center gap-2 text-center">
            <a href="${media.watchUrl}" target="_blank" rel="noopener noreferrer" class="bg-red-600 hover:bg-red-500 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition">
                <i data-feather="play-circle" class="w-4 h-4"></i> Reproducir Video en YouTube
            </a>
        </div>`;
    } else if (media.type === 'video_file') {
        mediaHTML = `
        <div class="relative h-48 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/50">
            <video src="${media.originalUrl}" controls playsinline class="w-full h-full object-cover"></video>
        </div>`;
    } else if (media.type === 'image') {
        mediaHTML = `
        <div class="relative h-44 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-800/50">
            <img src="${media.originalUrl}" alt="${exerciseName}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\\'p-4 text-[10px] text-slate-500 text-center\\'>Imagen/GIF no disponible.</div>';">
        </div>`;
    }

    const actionButtons = isProf ? `
        <div class="flex justify-end gap-2 pt-1 border-t border-slate-800/80">
            <button onclick="window.editExerciseInModal('${exerciseId}')" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 font-bold">
                <i data-feather="edit-2" class="w-3 h-3"></i> Editar
            </button>
            <button onclick="window.deleteExerciseFromRoutine('${exerciseId}')" class="text-[11px] bg-rose-950/80 hover:bg-rose-900 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-800 flex items-center gap-1 font-bold">
                <i data-feather="trash-2" class="w-3 h-3"></i> Eliminar
            </button>
        </div>` : '';

    return `
    <div class="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative space-y-0">
        ${mediaHTML}
        
        <div class="p-4 space-y-3">
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                <h4 class="text-xs font-black text-amber-400 uppercase tracking-wider">${exerciseName}</h4>
                <span class="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    ${ex.category || ex.tipo || 'Ejercicio'}
                </span>
            </div>

            <!-- GRILLA PRINCIPAL DE MÉTRICAS (SERIES, REPETICIONES Y CARGA) -->
            <div class="grid grid-cols-3 gap-2 text-xs">
                <div class="bg-slate-950 p-2 rounded-xl text-center border border-slate-800/80">
                    <span class="text-amber-400 text-[10px] font-bold block uppercase">Series</span>
                    <span class="text-white font-black text-sm">${seriesVal}</span>
                </div>
                <div class="bg-slate-950 p-2 rounded-xl text-center border border-slate-800/80">
                    <span class="text-sky-400 text-[10px] font-bold block uppercase">Reps</span>
                    <span class="text-white font-black text-sm">${repsVal}</span>
                </div>
                <div class="bg-slate-950 p-2 rounded-xl text-center border border-slate-800/80">
                    <span class="text-emerald-400 text-[10px] font-bold block uppercase">Carga</span>
                    <span class="text-white font-black text-sm truncate block">${cargaVal}</span>
                </div>
            </div>

            <!-- DETALLES DE INTENSIDAD, CADENCIA Y PAUSA -->
            <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[10px] grid grid-cols-2 gap-2">
                <div><span class="text-slate-400 block">Pausa entre series:</span><strong class="text-amber-300 font-bold">${restVal}</strong></div>
                ${rpeVal ? `<div><span class="text-slate-400 block">Esfuerzo:</span><strong class="text-emerald-300 font-bold truncate block">${rpeVal}</strong></div>` : ''}
                ${tempoVal ? `<div><span class="text-slate-400 block">Cadencia (Tempo):</span><strong class="text-sky-300 font-bold">${tempoVal}</strong></div>` : ''}
            </div>

            ${ex.notes ? `
            <div class="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 leading-snug">
                <span class="text-amber-400 font-bold uppercase block mb-0.5">Indicaciones:</span>
                ${ex.notes}
            </div>` : ''}

            ${actionButtons}
        </div>
    </div>`;
}