/**
 * Componente para renderizar la gestión de la Entidad Relacional Carga / Peso
 */
export function renderCargaView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para configurar las cargas y pesos.</p>
        </div>`;
    }

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const diasAsignados = student.microciclo?.diasAsignados || ['Lunes', 'Miércoles', 'Viernes'];
    const diaNombre = diasAsignados[prepDay - 1] || `Día ${prepDay}`;

    const routine = student.routine || {};
    const exercisesOfDay = (routine[prepWeek] && routine[prepWeek][prepDay]) || [];

    const visibility = student.visibilitySettings || {};
    const visCargaGlobal = visibility.cargaGlobal !== false;

    // Presets de Porcentajes de RM y Estrategias de Carga
    const rmPresets = ['60%', '65%', '70%', '75%', '80%', '85%', '90%'];
    const metodosCargaBase = [
        'Carga Fija Constante',
        'Progresión Lineal Semanal (+2.5 kg / semana)',
        'Piramidal Ascendente (Mayor peso en cada serie)',
        'Piramidal Descendente (Menor peso en cada serie)',
        'Peso Corporal (Sin sobrecarga externa)',
        'Peso Corporal + Lastre',
        'Autorregulado según RPE / RIR del día'
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
            const cargaKgVal = ex.cargaKg || ex.pesoKg || '';
            const rmVal = ex.porcentajeRM || '75%';
            const metodoVal = ex.metodoCarga || 'Carga Fija Constante';
            const notasCarga = ex.notasCarga || '';
            const visExCarga = ex.visibleCarga !== false;

            return `
            <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3 ex-carga-card" data-ex-id="${exId}">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div class="min-w-0 flex-1 pr-2">
                        <span class="text-[9px] font-black uppercase tracking-wider text-amber-400 block">${exBloque}</span>
                        <strong class="text-xs text-white font-black truncate block">${exName}</strong>
                    </div>

                    <!-- CASILLA DE VISIBILIDAD DE CARGA DE ESTE EJERCICIO -->
                    <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none shrink-0 ${visExCarga ? 'text-amber-400' : 'text-slate-500'}">
                        <input type="checkbox" id="vis-carga-ex-${exId}" ${visExCarga ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                        <span>${visExCarga ? '👁️ Visible' : '🔒 Oculto'}</span>
                    </label>
                </div>

                <!-- 1. CARGA EN KILOGRAMOS (KG) -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-slate-400">Prescripción de Peso / Carga en Kg</label>
                    <div class="grid grid-cols-3 gap-2">
                        <div class="col-span-2">
                            <input type="text" id="carga-kg-input-${exId}" value="${cargaKgVal}" placeholder="Ej: 50 kg, 40-50-60 o Peso Corporal"
                                class="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400">
                        </div>
                        <button type="button" onclick="window.setCargaPresetForEx('${exId}', 'Peso Corporal')" 
                            class="bg-slate-950 hover:bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-2.5 rounded-xl border border-slate-800 transition text-center truncate">
                            🏋️ Corporal
                        </button>
                    </div>
                </div>

                <!-- 2. PORCENTAJE DE 1RM (%RM) -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-slate-400">Porcentaje de 1RM (%RM Estimado)</label>
                    <div class="space-y-2">
                        <div class="flex flex-wrap gap-1">
                            ${rmPresets.map(preset => `
                                <button type="button" onclick="window.setRMPresetForEx('${exId}', '${preset} RM')"
                                    class="rm-preset-btn-${exId} text-[10px] font-bold px-2.5 py-1.5 rounded-xl border transition cursor-pointer ${rmVal.includes(preset) ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}">
                                    ${preset}
                                </button>
                            `).join('')}
                        </div>
                        <input type="text" id="carga-rm-input-${exId}" value="${rmVal}" placeholder="Ej: 75% RM o RPE 8"
                            class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-300 font-bold focus:outline-none focus:border-emerald-400">
                    </div>
                </div>

                <!-- 3. MÉTODO Y ESTRATEGIA DE CARGA -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-slate-400">Estrategia de Carga y Progresión</label>
                    <select id="carga-metodo-select-${exId}" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-sky-300 font-bold focus:outline-none focus:border-sky-500 cursor-pointer">
                        ${metodosCargaBase.map(metodo => `
                            <option value="${metodo}" ${metodoVal === metodo ? 'selected' : ''}>${metodo}</option>
                        `).join('')}
                    </select>
                </div>

                <!-- 4. REGLAS DE SOBRECARGA PROGRESIVA -->
                <div class="space-y-1.5">
                    <label class="block text-[10px] font-bold text-slate-400">Indicaciones de Sobrecarga Progresiva</label>
                    <textarea id="carga-notas-input-${exId}" rows="2" placeholder="Ej: Si completas las 12 reps en todas las series, aumentar 2.5 kg en la siguiente semana..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-snug">${notasCarga}</textarea>
                </div>
            </div>`;
        }).join('');
    }

    return `
    <div class="space-y-4">
        <!-- HEADER DE LA ENTIDAD -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2 min-w-0">
                <i data-feather="disc" class="w-5 h-5 text-amber-400 shrink-0"></i>
                <div class="min-w-0">
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider truncate">Prescripción de Carga / Peso</h2>
                    <span class="text-[10px] text-slate-300 font-bold block truncate">
                        📍 Editando: <span class="text-sky-300">Semana ${prepWeek}</span> • <span class="text-amber-300">Día ${prepDay} (${diaNombre})</span>
                    </span>
                </div>
            </div>
            ${exercisesOfDay.length > 0 ? `
            <button onclick="window.saveCargaStudent()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0">
                <i data-feather="save" class="w-3.5 h-3.5"></i> Guardar Cargas
            </button>` : ''}
        </div>

        <!-- REGLA GLOBAL DE VISIBILIDAD DE CARGAS -->
        ${exercisesOfDay.length > 0 ? `
        <div class="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 shadow-xl flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i data-feather="eye" class="w-4 h-4 text-amber-400"></i>
                <span class="text-xs text-slate-200 font-bold">Visibilidad General de Cargas para el Alumno</span>
            </div>
            <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visCargaGlobal ? 'text-amber-400' : 'text-slate-500'}">
                <input type="checkbox" id="vis-carga-global" ${visCargaGlobal ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                <span>${visCargaGlobal ? '👁️ Visible' : '🔒 Oculto'}</span>
            </label>
        </div>` : ''}

        <!-- LISTA DE EJERCICIOS PARA CONFIGURAR SUS CARGAS -->
        <div class="space-y-3">
            ${exercisesHTML}
        </div>

        <!-- BOTÓN INFERIOR DE GUARDADO -->
        ${exercisesOfDay.length > 0 ? `
        <button onclick="window.saveCargaStudent()" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3 rounded-2xl shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <i data-feather="check-circle" class="w-4 h-4"></i> Guardar Todas las Cargas del Día
        </button>` : ''}
    </div>`;
}