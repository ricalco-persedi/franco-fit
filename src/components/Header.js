/**
 * Componente: Header.js
 * Encabezado fijo y menú relacional superior optimizado para dispositivos móviles.
 * Versión simplificada:
 *  - Pestañas relacionales limpias: Ficha, Macrociclo, Mesociclo, Microciclo, Ejercicio, Visibilidad, Resumen.
 *  - Eliminadas las pestañas obsoletas: Series, Repeticiones, Carga/Peso.
 *  - Eliminada la barra de seguimiento '📋 Guardado: ...' (reemplazada por el módulo Resumen).
 */

export function renderHeader(activeStudent = null, activeTab = 'ficha') {
    const studentName = activeStudent
        ? `${activeStudent.lastname || ''}, ${activeStudent.firstname || ''}`.trim()
        : 'Ningún alumno seleccionado';
    const studentDni = activeStudent?.dni ? `DNI: ${activeStudent.dni}` : 'Sin DNI';

    // 1. Barra del Alumno Activo (Limpia, sin línea redundante de 'Guardado')
    const studentBannerHTML = activeStudent ? `
    <div class="bg-slate-900/95 border-b border-amber-500/30 px-3 py-2 flex items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-2 min-w-0 flex-1">
            <span class="flex h-2 w-2 relative shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <div class="min-w-0 flex-1 leading-tight">
                <strong class="text-amber-400 text-xs font-black truncate block">${studentName}</strong>
                <span class="text-[10px] text-slate-400 font-semibold block">${studentDni}</span>
            </div>
        </div>
        <button onclick="window.deselectStudent()" class="bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 shrink-0 transition active:scale-95 cursor-pointer">
            Cambiar Alumno
        </button>
    </div>` : '';

    // 2. Menú de Entidades Relacionales Superior (Consolidado: 7 Módulos Clave)
    const relationalNavHTML = activeStudent ? `
    <nav class="bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar">
        <div class="flex items-center gap-1.5 px-2 py-2 min-w-max text-[10px] font-bold">
            <button onclick="window.switchRelationalTab('ficha')" class="px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === 'ficha' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="user" class="w-3.5 h-3.5"></i> Ficha
            </button>

            <button onclick="window.switchRelationalTab('macrociclo')" class="px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === 'macrociclo' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="target" class="w-3.5 h-3.5"></i> Macrociclo
            </button>

            <button onclick="window.switchRelationalTab('mesociclo')" class="px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === 'mesociclo' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="calendar" class="w-3.5 h-3.5"></i> Mesociclo
            </button>

            <button onclick="window.switchRelationalTab('microciclo')" class="px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === 'microciclo' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="grid" class="w-3.5 h-3.5"></i> Microciclo
            </button>

            <button onclick="window.switchRelationalTab('ejercicio')" class="px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === 'ejercicio' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="film" class="w-3.5 h-3.5"></i> Ejercicio
            </button>

            <button onclick="window.switchRelationalTab('visibilidad')" class="px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === 'visibilidad' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="eye" class="w-3.5 h-3.5"></i> Visibilidad
            </button>

            <button onclick="window.switchRelationalTab('resumen')" class="px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${activeTab === 'resumen' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="check-square" class="w-3.5 h-3.5"></i> Resumen
            </button>
        </div>
    </nav>` : '';

    return `
    <header class="sticky top-0 z-40 bg-slate-950/95 text-white border-b border-amber-500/60 shadow-xl backdrop-blur-md w-full">
        <div class="max-w-md mx-auto w-full">
            <div class="px-3 py-1.5 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                    <div class="h-8 w-8 shrink-0 rounded-lg overflow-hidden shadow border border-amber-400/70 bg-slate-900 flex items-center justify-center">
                        <img src="/imagenes/FC-MARCA.png" alt="FC" class="h-full w-full object-cover" onerror="this.onerror=null; this.src='/logo.png';">
                    </div>
                    <div class="flex flex-col min-w-0 leading-tight">
                        <span class="text-[11px] font-black tracking-wider text-sky-200 uppercase truncate">FC TRAINING</span>
                        <span class="text-[9px] font-semibold text-slate-300 truncate">Prof. Franco Comeglio</span>
                    </div>
                </div>

                <div class="flex items-center gap-1.5 shrink-0">
                    <span class="bg-amber-500 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full uppercase shadow">Profesor</span>
                    <button id="btn-logout" class="bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-700/80 p-1.5 rounded-lg text-xs font-black transition active:scale-95" title="Cerrar Sesión">
                        <i data-feather="log-out" class="w-3 h-3 text-rose-400"></i>
                    </button>
                </div>
            </div>
            ${studentBannerHTML}
            ${relationalNavHTML}
        </div>
    </header>`;
}