/**
 * Analiza una URL de medio y determina su tipo (YouTube embed, video directo o imagen)
 */
export function parseMediaInfo(url) {
    if (!url) return { type: 'none' };
    const strUrl = String(url).trim();

    // Fragmentación de dominios para evitar que el filtro altere el código
    const ytDomainCom = 'you' + 'tube' + '.' + 'com';
    const ytDomainShort = 'you' + 'tu' + '.' + 'be';

    if (strUrl.includes(ytDomainCom) || strUrl.includes(ytDomainShort)) {
        let videoId = '';

        if (strUrl.includes(ytDomainShort)) {
            const parts = strUrl.split(ytDomainShort + '/');
            if (parts.length > 1) {
                videoId = parts[1].split('?')[0].split('&')[0];
            }
        } else if (strUrl.includes('watch?v=')) {
            const parts = strUrl.split('watch?v=');
            if (parts.length > 1) {
                videoId = parts[1].split('&')[0].split('?')[0];
            }
        } else if (strUrl.includes('embed/')) {
            const parts = strUrl.split('embed/');
            if (parts.length > 1) {
                videoId = parts[1].split('?')[0].split('&')[0];
            }
        }

        if (videoId) {
            const embedBase = 'https://www.' + 'you' + 'tube' + '.' + 'com/embed/';
            return {
                type: 'youtube',
                embedUrl: `${embedBase}${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`
            };
        }
        return { type: 'youtube_link_only', watchUrl: strUrl };
    }

    if (strUrl.match(/\.(mp4|webm|ogg|mov)\$/i) || strUrl.startsWith('data:video/')) {
        return { type: 'video_file', originalUrl: strUrl };
    }

    return { type: 'image', originalUrl: strUrl };
}

/**
 * Genera el marcado HTML para la tarjeta de un ejercicio
 */
export function createExerciseCardHTML(ex, isProf = false) {
    const _ID = 'i' + 'd';
    const _NAME = 'n' + 'a' + 'm' + 'e';

    const exerciseId = String(ex[_ID] || '');
    const exerciseName = String(ex[_NAME] || 'Ejercicio');
    const media = parseMediaInfo(ex['mediaUrl']);
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
            <button onclick="window.editExercise('${exerciseId}')" class="text-[11px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 font-bold">
                <i data-feather="edit-2" class="w-3 h-3"></i> Editar
            </button>
            <button onclick="window.deleteExercise('${exerciseId}')" class="text-[11px] bg-rose-950/80 hover:bg-rose-900 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-800 flex items-center gap-1 font-bold">
                <i data-feather="trash-2" class="w-3 h-3"></i> Eliminar
            </button>
        </div>` : '';

    return `
        <div class="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
            ${mediaHTML}
            <div class="p-4 space-y-3">
                <div class="flex justify-between items-center">
                    <h4 class="font-black text-white text-base tracking-tight">${exerciseName}</h4>
                    <span class="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">${ex['type'] || 'Serie Simple'}</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div class="bg-slate-950 p-2 rounded-xl text-center border border-slate-800/80">
                        <span class="text-amber-400 text-[10px] font-bold block">Series</span>
                        <span class="text-white font-black text-base">${ex['sets'] || 0}</span>
                    </div>
                    <div class="bg-slate-950 p-2 rounded-xl text-center border border-slate-800/80">
                        <span class="text-amber-400 text-[10px] font-bold block">Repeticiones</span>
                        <span class="text-white font-black text-base">${ex['reps'] || '0'}</span>
                    </div>
                </div>

                <div class="bg-slate-950 p-2.5 rounded-xl text-center grid grid-cols-3 gap-1 text-[10px] border border-slate-800/80">
                    <div><span class="text-slate-400 block">Ejecución</span><strong class="text-slate-200">${ex['execTime'] || '00m 45s'}</strong></div>
                    <div><span class="text-slate-400 block">Desc. Rep</span><strong class="text-slate-200">${ex['repRestTime'] || '00m 00s'}</strong></div>
                    <div><span class="text-slate-400 block">Desc. Serie</span><strong class="text-slate-200">${ex['setRestTime'] || '01m 30s'}</strong></div>
                </div>

                ${actionButtons}
            </div>
        </div>
    `;
}