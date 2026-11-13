/**
 * Renderiza el encabezado fijo y el menú relacional superior optimizado para pantallas móviles
 */
export function renderHeader(activeStudent = null, activeTab = 'ficha') {
    const studentName = activeStudent 
        ? `${activeStudent.lastname || ''}, ${activeStudent.firstname || ''}`.trim() 
        : 'Ningún alumno seleccionado';
        
    const studentDni = activeStudent?.dni ? `DNI: ${activeStudent.dni}` : 'Sin DNI';

    // 🔍 Cálculo dinámico del Panorama General de Entidades Guardadas
    let panoramaText = 'Sin planificaciones guardadas';
    if (activeStudent) {
        const savedEntities = [];
        
        if (activeStudent.firstname || activeStudent.lastname || activeStudent.dni || activeStudent.datosAntropometricos?.peso || activeStudent.historialLesiones || activeStudent.evaluacionInicial) {
            savedEntities.push('Ficha');
        }
        if (activeStudent.macrociclo?.fase || activeStudent.macrociclo?.objetivo) {
            savedEntities.push('Macrociclo');
        }
        if (activeStudent.mesociclo?.numeroSemanas || activeStudent.mesociclo?.enfoque) {
            savedEntities.push('Mesociclo');
        }
        if (activeStudent.microciclo?.diasPorSemana || activeStudent.microciclo?.diasAsignados) {
            savedEntities.push('Microciclo');
        }

        const hasRoutineData = activeStudent.routine && Object.values(activeStudent.routine).some(w => Object.values(w).some(d => Array.isArray(d) && d.length > 0));
        if (hasRoutineData) {
            savedEntities.push('Ejercicio');

            const allExercises = Object.values(activeStudent.routine).flatMap(w => Object.values(w).flat());
            if (allExercises.some(ex => ex.series || ex.tipoSerie || ex.setRest)) savedEntities.push('Series');
            if (allExercises.some(ex => ex.repeticiones || ex.repsRange || ex.rpe)) savedEntities.push('Repeticiones');
            if (allExercises.some(ex => ex.cargaKg || ex.porcentajeRM)) savedEntities.push('Carga');
        }

        if (activeStudent.visibilitySettings && Object.keys(activeStudent.visibilitySettings).length > 0) {
            savedEntities.push('Visibilidad');
        }

        if (savedEntities.length > 0) {
            panoramaText = savedEntities.join(' - ');
        }
    }

    // 1. Barra del Alumno Activo con Panorama General en 2 Líneas
    const studentBannerHTML = activeStudent ? `
    <div class="bg-slate-900/95 border-b border-amber-500/30 px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-2 min-w-0 flex-1">
            <span class="flex h-2 w-2 relative shrink-0">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <div class="min-w-0 flex-1 leading-tight space-y-0.5">
                <strong class="text-amber-400 text-[11px] font-black truncate block">${studentName} (${studentDni})</strong>
                <!-- 🟢 Se habilita la visualización en 2 líneas -->
                <span class="text-[9px] text-emerald-400 font-bold block leading-tight line-clamp-2 break-words" title="${panoramaText}">
                    📋 Guardado: ${panoramaText}
                </span>
            </div>
        </div>
        <button onclick="window.deselectStudent()" class="bg-slate-800 hover:bg-slate-700 text-amber-300 text-[9px] font-bold px-2 py-1 rounded-lg border border-slate-700 shrink-0 transition active:scale-95">
            Cambiar
        </button>
    </div>` : '';

    // 2. Menú de Entidades Relacionales Superior
    const relationalNavHTML = activeStudent ? `
    <nav class="bg-slate-950 border-b border-slate-800 overflow-x-auto no-scrollbar">
        <div class="flex items-center gap-1 px-2 py-1.5 min-w-max text-[10px] font-bold">
            <button onclick="window.switchRelationalTab('ficha')" 
                class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 ${activeTab === 'ficha' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="user" class="w-3 h-3"></i> Ficha
            </button>
            <button onclick="window.switchRelationalTab('macrociclo')" 
                class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 ${activeTab === 'macrociclo' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="target" class="w-3 h-3"></i> Macrociclo
            </button>
            <button onclick="window.switchRelationalTab('mesociclo')" 
                class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 ${activeTab === 'mesociclo' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="calendar" class="w-3 h-3"></i> Mesociclo
            </button>
            <button onclick="window.switchRelationalTab('microciclo')" 
                class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 ${activeTab === 'microciclo' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="grid" class="w-3 h-3"></i> Microciclo
            </button>
            <button onclick="window.switchRelationalTab('ejercicio')" 
                class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 ${activeTab === 'ejercicio' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="film" class="w-3 h-3"></i> Ejercicio
            </button>
            <button onclick="window.switchRelationalTab('series')" 
                class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 ${activeTab === 'series' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="repeat" class="w-3 h-3"></i> Series
            </button>
            <button onclick="window.switchRelationalTab('repeticiones')" 
                class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 ${activeTab === 'repeticiones' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="hash" class="w-3 h-3"></i> Repeticiones
            </button>
            <button onclick="window.switchRelationalTab('carga')" 
                class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 ${activeTab === 'carga' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="disc" class="w-3 h-3"></i> Carga / Peso
            </button>
            <button onclick="window.switchRelationalTab('visibilidad')" 
                class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 ${activeTab === 'visibilidad' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="eye" class="w-3 h-3"></i> Visibilidad
            </button>
            <button onclick="window.switchRelationalTab('resumen')"
                class="px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 ${activeTab === 'resumen' ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'text-slate-400 hover:text-white bg-slate-900/80'}">
                <i data-feather="check-square" class="w-3 h-3"></i> Resumen
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