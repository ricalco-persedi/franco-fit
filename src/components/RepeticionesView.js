/**
 * Componente para renderizar la gestión de la Entidad Relacional Repeticiones
 */
export function renderRepeticionesView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para configurar las repeticiones.</p>
        </div>`;
    }

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const diasAsignados = student.microciclo?.diasAsignados || ['Lunes', 'Miércoles', 'Viernes'];
    const diaNombre = diasAsignados[prepDay - 1] || `Día ${prepDay}`;

    const routine = student.routine || {};
    const exercisesOfDay = (routine[prepWeek] && routine[prepWeek][prepDay]) || [];

    const visibility = student.visibilitySettings || {};
    const visRepsGlobal = visibility.repetitionGlobal !== false;

    // Presets comunes de repeticiones e intensidad
    const repsPresets = ['1-5', '6-8', '8-12', '12-15', '15-20', 'Al fallo / AMRAP'];
    const rpePresets = [
        '-',
        'RPE 6 (Fácil / Calentamiento)',
        'RPE 7 (Moderado / 3 reps en reserva)',
        'RPE 8 (Exigente / 2 reps en reserva)',
        'RPE 9 (Muy exigente / 1 rep en reserva)',
        'RPE 10 (Fallo muscular / 0 reps en reserva)',
        'RIR 3', 'RIR 2', 'RIR 1', 'RIR 0 (Fallo)'
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
            const repsVal = ex.repeticiones || ex.repsRange || '8-12';
            const rpeVal = ex.rpe || '-';
            const tempoVal = ex.tempo !== undefined && ex.tempo !== null ? ex.tempo : '0';
            const visExReps = ex.visibleReps !== false;

            return `
            <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3 ex-reps-card" data-ex-id="${exId}">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div class="min-w-0 flex-1 pr-2">
                        <span class="text-[9px] font-black uppercase tracking-wider text-amber-400 block">${exBloque}</span>
                        <strong class="text-xs text-white font-black truncate block">${exName}</strong>
                    </div>

                    <!-- CASILLA DE VISIBILIDAD DE REPETICIONES DE ESTE EJERCICIO -->
                    <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none shrink-0 ${visExReps ? 'text-amber-400' : 'text-slate-500'}">
                        <input type="checkbox" id="vis-reps-ex-${exId}" ${visExReps ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                        <span>${visExReps ? '👁️ Visible' : '🔒 Oculto'}</span>
                    </label>
                </div>

                <!-- 1. CANTIDAD / RANGO DE REPETICIONES -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-slate-400">Objetivo / Rango de Repeticiones</label>
                    <div class="space-y-2">
                        <div class="flex flex-wrap gap-1">
                            ${repsPresets.map(preset => `
                                <button type="button" onclick="window.setRepsPresetForEx('${exId}', '${preset}')"
                                    class="reps-preset-btn-${exId} text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${repsVal === preset ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}">
                                    ${preset}
                                </button>
                            `).join('')}
                        </div>
                        <input type="text" id="reps-input-${exId}" value="${repsVal}" placeholder="Ej: 10, 8-12, 12-10-8-6 o Al fallo"
                            class="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400">
                    </div>
                </div>

                <!-- 2. CARÁCTER DEL ESFUERZO / INTENSIDAD PERCIBIDA (RPE / RIR) -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-slate-400">Carácter del Esfuerzo (RPE / RIR)</label>
                    <select id="reps-rpe-select-${exId}" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer">
                        ${rpePresets.map(rpe => `
                        <option value="${rpe}" ${rpeVal === rpe ? 'selected' : ''}>${rpe === '-' ? '- (Sin RPE / RIR)' : rpe}</option>
                        `).join('')}
                    </select>
                </div>

                <!-- 3. CADENCIA DE EJECUCIÓN / TEMPO (TUT) -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-slate-400">Cadencia / Tempo de Ejecución (Excéntrica - Pausa - Concéntrica - Pausa)</label>
                    <div class="grid grid-cols-5 gap-1.5">
                        ${['0', '2-0-1-0', '3-0-1-0', '4-1-1-0', 'Excéntrica lenta'].map(t => `
                            <button type="button" onclick="window.setTempoPresetForEx('${exId}', '${t}')"
                                class="tempo-btn-${exId} text-[10px] font-bold py-1.5 rounded-xl border transition cursor-pointer ${tempoVal === t ? 'bg-sky-500 text-slate-950 border-sky-400 font-black shadow' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}">
                                ${t}
                            </button>
                        `).join('')}
                        <input type="text" id="reps-tempo-input-${exId}" value="${tempoVal}" placeholder="Ej: 0 o 3-0-1-0"
                            class="col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-sky-300 font-bold text-center focus:outline-none focus:border-sky-400">
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
                <i data-feather="hash" class="w-5 h-5 text-amber-400 shrink-0"></i>
                <div class="min-w-0">
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider truncate">Configuración de Repeticiones</h2>
                    <span class="text-[10px] text-slate-300 font-bold block truncate">
                        📍 Editando: <span class="text-sky-300">Semana ${prepWeek}</span> • <span class="text-amber-300">Día ${prepDay} (${diaNombre})</span>
                    </span>
                </div>
            </div>
            ${exercisesOfDay.length > 0 ? `
            <button onclick="window.saveRepeticionesStudent()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0">
                <i data-feather="save" class="w-3.5 h-3.5"></i> Guardar Reps
            </button>` : ''}
        </div>

        <!-- REGLA GLOBAL DE VISIBILIDAD DE REPETICIONES -->
        ${exercisesOfDay.length > 0 ? `
        <div class="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 shadow-xl flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i data-feather="eye" class="w-4 h-4 text-amber-400"></i>
                <span class="text-xs text-slate-200 font-bold">Visibilidad General de Repeticiones para el Alumno</span>
            </div>
            <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visRepsGlobal ? 'text-amber-400' : 'text-slate-500'}">
                <input type="checkbox" id="vis-reps-global" ${visRepsGlobal ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                <span>${visRepsGlobal ? '👁️ Visible' : '🔒 Oculto'}</span>
            </label>
        </div>` : ''}

        <!-- LISTA DE EJERCICIOS PARA CONFIGURAR SUS REPETICIONES -->
        <div class="space-y-3">
            ${exercisesHTML}
        </div>

        <!-- BOTÓN INFERIOR DE GUARDADO -->
        ${exercisesOfDay.length > 0 ? `
        <button onclick="window.saveRepeticionesStudent()" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3 rounded-2xl shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <i data-feather="check-circle" class="w-4 h-4"></i> Guardar Todas las Repeticiones del Día
        </button>` : ''}
    </div>`;
}