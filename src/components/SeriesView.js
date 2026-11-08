/**
 * Componente para renderizar la gestión de la Entidad Relacional Series
 */
export function renderSeriesView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para configurar las series.</p>
        </div>`;
    }

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const diasAsignados = student.microciclo?.diasAsignados || ['Lunes', 'Miércoles', 'Viernes'];
    const diaNombre = diasAsignados[prepDay - 1] || `Día ${prepDay}`;

    const routine = student.routine || {};
    const exercisesOfDay = (routine[prepWeek] && routine[prepWeek][prepDay]) || [];

    const visibility = student.visibilitySettings || {};
    const visSeriesGlobal = visibility.seriesGlobal !== false;

    // Tipos de series y estructuras de agrupamiento
    const tiposSerieBase = [
        'Tradicional / Normal',
        'Superserie (Biserie A1-A2)',
        'Triserie (A1-A2-A3)',
        'Circuito / WOD',
        'Drop Set (Series descendentes)',
        'Rest-Pause',
        'Piramidal Ascendente',
        'Piramidal Descendente',
        'Serie Gigante'
    ];

    let exercisesHTML = '';

    if (exercisesOfDay.length === 0) {
        exercisesHTML = `
        <div class="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-3 shadow-lg">
            <i data-feather="alert-circle" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs text-slate-300 font-semibold leading-relaxed">
                No hay ejercicios cargados aún para la <strong class="text-sky-300">Semana ${prepWeek}</strong> - <strong class="text-amber-300">Día ${prepDay} (${diaNombre})</strong>.
            </p>
            <button onclick="window.switchRelationalTab('ejercicio')" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer">
                <i data-feather="film" class="w-4 h-4"></i> Ir a Cargar Ejercicios Primero
            </button>
        </div>`;
    } else {
        exercisesHTML = exercisesOfDay.map((ex, idx) => {
            const exId = String(ex.id || '');
            const exName = ex.name || `Ejercicio ${idx + 1}`;
            const exBloque = ex.bloque || 'Desarrollo';
            const numSeries = ex.series || 3;
            const currentTipoSerie = ex.tipoSerie || 'Tradicional / Normal';
            const pausaSeries = ex.setRest || '60s';
            const visExSeries = ex.visibleSeries !== false;

            return `
            <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3 ex-series-card" data-ex-id="${exId}">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div class="min-w-0 flex-1 pr-2">
                        <span class="text-[9px] font-black uppercase tracking-wider text-amber-400 block">${exBloque}</span>
                        <strong class="text-xs text-white font-black truncate block">${exName}</strong>
                    </div>

                    <!-- CASILLA DE VISIBILIDAD DE SERIES DE ESTE EJERCICIO -->
                    <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none shrink-0 ${visExSeries ? 'text-amber-400' : 'text-slate-500'}">
                        <input type="checkbox" id="vis-series-ex-${exId}" ${visExSeries ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                        <span>${visExSeries ? '👁️ Visible' : '🔒 Oculto'}</span>
                    </label>
                </div>

                <!-- 1. CANTIDAD DE SERIES -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-slate-400">Número de Series (Sets)</label>
                    <div class="flex items-center gap-2">
                        <div class="flex gap-1 overflow-x-auto no-scrollbar py-0.5">
                            ${[1, 2, 3, 4, 5, 6].map(n => `
                                <button type="button" onclick="window.setSeriesCountForEx('${exId}', ${n})"
                                    class="series-count-btn-${exId} text-xs font-black px-3 py-1.5 rounded-xl border transition cursor-pointer ${numSeries === n ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}">
                                    ${n}
                                </button>
                            `).join('')}
                        </div>
                        <input type="number" id="series-count-input-${exId}" value="${numSeries}" min="1" max="20"
                            class="w-16 bg-slate-950 border border-amber-500/50 rounded-xl p-1.5 text-xs text-amber-400 font-black text-center focus:outline-none">
                    </div>
                </div>

                <!-- 2. TIPO DE SERIE / AGRUPACIÓN -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-slate-400">Tipo de Serie / Estructura</label>
                    <select id="series-tipo-select-${exId}" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer">
                        ${tiposSerieBase.map(tipo => `
                            <option value="${tipo}" ${currentTipoSerie === tipo ? 'selected' : ''}>${tipo}</option>
                        `).join('')}
                    </select>
                </div>

                <!-- 3. PAUSA ENTRE SERIES -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-slate-400">Pausa / Descanso entre Series</label>
                    <div class="grid grid-cols-4 gap-1.5">
                        ${['30s', '45s', '60s', '90s', '2m', '3m'].map(p => `
                            <button type="button" onclick="window.setSeriesRestForEx('${exId}', '${p}')"
                                class="series-rest-btn-${exId} text-[11px] font-bold py-1.5 rounded-xl border transition cursor-pointer ${pausaSeries === p ? 'bg-sky-500 text-slate-950 border-sky-400 font-black shadow' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}">
                                ${p}
                            </button>
                        `).join('')}
                        <input type="text" id="series-rest-custom-${exId}" value="${['30s', '45s', '60s', '90s', '2m', '3m'].includes(pausaSeries) ? pausaSeries : (pausaSeries || '60s')}" placeholder="Ej: 120s"
                            class="col-span-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5 text-xs text-sky-300 font-bold text-center focus:outline-none focus:border-sky-400">
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    return `
    <div class="space-y-4">
        <!-- HEADER DE LA ENTIDAD -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2 min-w-0">
                <i data-feather="repeat" class="w-5 h-5 text-amber-400 shrink-0"></i>
                <div class="min-w-0">
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider truncate">Configuración de Series</h2>
                    <span class="text-[10px] text-slate-300 font-bold block truncate">
                        📍 Editando: <span class="text-sky-300">Semana ${prepWeek}</span> • <span class="text-amber-300">Día ${prepDay} (${diaNombre})</span>
                    </span>
                </div>
            </div>
            ${exercisesOfDay.length > 0 ? `
            <button onclick="window.saveSeriesStudent()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0">
                <i data-feather="save" class="w-3.5 h-3.5"></i> Guardar Series
            </button>` : ''}
        </div>

        <!-- REGLA GLOBAL DE VISIBILIDAD DE SERIES -->
        ${exercisesOfDay.length > 0 ? `
        <div class="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 shadow-xl flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i data-feather="eye" class="w-4 h-4 text-amber-400"></i>
                <span class="text-xs text-slate-200 font-bold">Visibilidad General de Series para el Alumno</span>
            </div>
            <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visSeriesGlobal ? 'text-amber-400' : 'text-slate-500'}">
                <input type="checkbox" id="vis-series-global" ${visSeriesGlobal ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                <span>${visSeriesGlobal ? '👁️ Visible' : '🔒 Oculto'}</span>
            </label>
        </div>` : ''}

        <!-- LISTA DE EJERCICIOS PARA CONFIGURAR SUS SERIES -->
        <div class="space-y-3">
            ${exercisesHTML}
        </div>

        <!-- BOTÓN INFERIOR DE GUARDADO -->
        ${exercisesOfDay.length > 0 ? `
        <button onclick="window.saveSeriesStudent()" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3 rounded-2xl shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <i data-feather="check-circle" class="w-4 h-4"></i> Guardar Todas las Series del Día
        </button>` : ''}
    </div>`;
}