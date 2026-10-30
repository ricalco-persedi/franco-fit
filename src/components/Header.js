export function renderHeader(activeRole = null, activeStudentName = '') {
    const roleBadge = activeRole === 'prof' 
        ? `<span class="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow">Profesor</span>`
        : activeRole === 'student'
        ? `<span class="bg-sky-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase shadow">${activeStudentName || 'Alumno'}</span>`
        : '';

    const changeKeyBtn = activeRole === 'prof' ? `
        <button onclick="window.changeProfPassword()" class="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl border border-slate-800 transition shadow-md flex items-center justify-center" title="Cambiar Clave de Profesor">
            <i data-feather="key" class="w-4 h-4"></i>
        </button>` : '';

    return `
    <header class="sticky top-0 z-40 bg-slate-950/95 text-white border-b-2 border-amber-500/80 px-3 py-2.5 shadow-2xl backdrop-blur-md">
        <div class="max-w-md mx-auto flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
                <div class="h-11 w-11 shrink-0 rounded-xl overflow-hidden shadow-md border border-amber-400/80 bg-slate-900 flex items-center justify-center">
                    <img src="/imagenes/FC-MARCA.png" 
                         alt="FC" 
                         class="h-full w-full object-cover" 
                         onerror="this.onerror=null; this.src='/logo.png';">
                </div>
                <div class="flex flex-col min-w-0 leading-tight">
                    <span class="text-sm font-black tracking-wider text-sky-200 uppercase truncate">FC TRAINING</span>
                    <span class="text-[11px] font-semibold text-slate-200 truncate">Prof. Franco Comeglio</span>
                    <span class="text-[10px] font-medium text-emerald-400 flex items-center gap-1 truncate">
                        <i data-feather="phone" class="w-2.5 h-2.5"></i> +54 9 261 693-9818
                    </span>
                    <span class="text-[9px] font-bold text-amber-400/90 tracking-widest uppercase truncate">MENDOZA, ARGENTINA</span>
                </div>
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
                ${roleBadge}
                ${changeKeyBtn}
                ${activeRole ? `
                <button id="btn-logout" class="bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-700/80 px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-lg transition active:scale-95" title="Cerrar Sesión">
                    <i data-feather="log-out" class="w-3.5 h-3.5 text-rose-400"></i>
                    <span>Salir</span>
                </button>` : ''}
            </div>
        </div>
    </header>`;
}