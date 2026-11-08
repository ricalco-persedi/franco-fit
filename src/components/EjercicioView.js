import { parseMediaInfo } from './ExerciseCard.js';

/**
 * Componente para renderizar la gestión de la Entidad Relacional Ejercicio
 * Organizado por Ejercicio 1, Ejercicio 2... cada uno con su Inicio, Desarrollo y Cierre
 */
export function renderEjercicioView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para diseñar sus ejercicios.</p>
        </div>`;
    }

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const diasAsignados = student.microciclo?.diasAsignados || ['Lunes', 'Miércoles', 'Viernes'];
    const diaNombre = diasAsignados[prepDay - 1] || `Día ${prepDay}`;

    const routine = student.routine || {};
    const exercisesOfDay = (routine[prepWeek] && routine[prepWeek][prepDay]) || [];

    // Agrupar los ítems por su número de Ejercicio (default 1)
    const exerciseGroups = {};
    exercisesOfDay.forEach(ex => {
        const num = ex.exerciseNumber || 1;
        if (!exerciseGroups[num]) exerciseGroups[num] = [];
        exerciseGroups[num].push(ex);
    });

    const groupNumbers = Object.keys(exerciseGroups).map(Number).sort((a, b) => a - b);
    if (groupNumbers.length === 0) groupNumbers.push(1); // Muestra al menos Ejercicio 1 si está vacío

    const nextExerciseNum = Math.max(...groupNumbers, 0) + 1;

    let exercisesGroupsHTML = groupNumbers.map(exNum => {
        const items = exerciseGroups[exNum] || [];
        const inicioList = items.filter(ex => (ex.bloque || 'Desarrollo') === 'Inicio');
        const desarrolloList = items.filter(ex => (ex.bloque || 'Desarrollo') === 'Desarrollo');
        const cierreList = items.filter(ex => (ex.bloque || 'Desarrollo') === 'Cierre');

        return `
        <!-- CONTENEDOR DEL EJERCICIO N -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/40 shadow-2xl space-y-4">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div class="flex items-center gap-2">
                    <span class="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow">
                        Ejercicio ${exNum}
                    </span>
                    <span class="text-[10px] text-slate-400 font-bold">Estructura Modular de la Unidad</span>
                </div>
                <button onclick="window.openAddExerciseModal('Desarrollo', ${exNum})" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-2.5 py-1 rounded-lg border border-slate-700 transition flex items-center gap-1 cursor-pointer">
                    <i data-feather="plus" class="w-3 h-3 text-amber-400"></i> Cargar Movimiento
                </button>
            </div>

            <!-- SUB-BLOQUES INTERNOS DEL EJERCICIO N -->
            <div class="space-y-3 pl-1 border-l-2 border-slate-800/80">
                ${renderSubBlockSection('Inicio', '🏁 Inicio (Entrada en Calor)', 'sky', inicioList, exNum)}
                ${renderSubBlockSection('Desarrollo', '🔥 Desarrollo (Trabajo Principal)', 'amber', desarrolloList, exNum)}
                ${renderSubBlockSection('Cierre', '🧘 Cierre (Vuelta a la Calma)', 'emerald', cierreList, exNum)}
            </div>
        </div>`;
    }).join('');

    return `
    <div class="space-y-4">
        <!-- HEADER DE LA ENTIDAD -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2 min-w-0">
                <i data-feather="film" class="w-5 h-5 text-amber-400 shrink-0"></i>
                <div class="min-w-0">
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider truncate">Diseño de Ejercicios por Unidades</h2>
                    <span class="text-[10px] text-slate-300 font-bold block truncate">
                        📍 Editando: <span class="text-sky-300">Semana ${prepWeek}</span> • <span class="text-amber-300">Día ${prepDay} (${diaNombre})</span>
                    </span>
                </div>
            </div>
            <button onclick="window.openAddExerciseModal('Desarrollo', ${nextExerciseNum})" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer">
                <i data-feather="plus-circle" class="w-4 h-4"></i> + Agregar Ejercicio ${nextExerciseNum}
            </button>
        </div>

        <!-- LISTA DE EJERCICIOS DEL DÍA -->
        <div class="space-y-4">
            ${exercisesGroupsHTML}
        </div>

        <!-- MODAL DE CREACIÓN / EDICIÓN -->
        ${renderExerciseModalHTML()}
    </div>`;
}

function renderSubBlockSection(bloqueKey, titulo, colorTheme, exerciseList = [], exNum = 1) {
    const isSky = colorTheme === 'sky';
    const isEmerald = colorTheme === 'emerald';
    const textColor = isSky ? 'text-sky-300' : (isEmerald ? 'text-emerald-300' : 'text-amber-300');

    let cardsHTML = '';
    if (exerciseList.length === 0) {
        cardsHTML = `
        <div class="p-2.5 bg-slate-950/60 border border-dashed border-slate-800/80 rounded-xl text-center text-slate-500 text-[10px] italic">
            Sin movimientos cargados en ${bloqueKey}.
        </div>`;
    } else {
        cardsHTML = exerciseList.map(ex => {
            const exId = String(ex.id || '');
            const exName = ex.name || 'Ejercicio';
            const exCategory = ex.category || 'General';
            const isVisible = ex.visible !== false;
            const media = parseMediaInfo(ex.mediaUrl);

            let mediaPreview = '';
            if (media.type === 'youtube') {
                mediaPreview = `<div class="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 my-1.5"><iframe src="${media.embedUrl}" class="w-full h-full border-0" allowfullscreen></iframe></div>`;
            } else if (media.type === 'image') {
                mediaPreview = `<div class="h-28 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 my-1.5"><img src="${media.originalUrl}" alt="${exName}" class="w-full h-full object-cover"></div>`;
            }

            return `
            <div class="bg-slate-950 border border-slate-800/90 rounded-xl p-3 space-y-2 shadow-md">
                <div class="flex items-center justify-between gap-2">
                    <div class="truncate min-w-0">
                        <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">${exCategory}</span>
                        <strong class="text-xs text-white font-black truncate block">${exName}</strong>
                    </div>
                    <button onclick="window.toggleExerciseVisibility('${exId}')" class="px-2 py-1 rounded-lg text-[9px] font-black transition cursor-pointer shrink-0 ${isVisible ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
                        ${isVisible ? '👁️ Visible' : '🔒 Oculto'}
                    </button>
                </div>
                ${mediaPreview}
                ${ex.notes ? `<p class="text-[10px] text-slate-300 italic bg-slate-900 p-2 rounded-lg border border-slate-800/60 leading-snug">${ex.notes}</p>` : ''}
                <div class="flex justify-end gap-1.5 pt-1 border-t border-slate-800/80">
                    <button onclick="window.editExerciseInModal('${exId}')" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-2 py-1 rounded-lg font-bold border border-slate-700 flex items-center gap-1 transition">
                        <i data-feather="edit-2" class="w-3 h-3"></i> Editar
                    </button>
                    <button onclick="window.deleteExerciseFromRoutine('${exId}')" class="text-[10px] bg-rose-950/80 hover:bg-rose-900 text-rose-300 px-2 py-1 rounded-lg font-bold border border-rose-800 flex items-center gap-1 transition">
                        <i data-feather="trash-2" class="w-3 h-3"></i> Eliminar
                    </button>
                </div>
            </div>`;
        }).join('');
    }

    return `
    <div class="space-y-2">
        <div class="flex items-center justify-between">
            <span class="text-[11px] font-black ${textColor} uppercase tracking-wider">${titulo}</span>
            <button onclick="window.openAddExerciseModal('${bloqueKey}', ${exNum})" class="text-[9px] bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded-md border border-slate-800 transition">
                + Agregar a ${bloqueKey}
            </button>
        </div>
        <div class="space-y-2">
            ${cardsHTML}
        </div>
    </div>`;
}

function renderExerciseModalHTML() {
    return `
    <div id="exercise-entity-modal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 id="ex-modal-title" class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <i data-feather="plus-circle" class="w-4 h-4"></i> Cargar Movimiento
                </h3>
                <button onclick="window.closeExerciseModal()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                    <i data-feather="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="event.preventDefault(); window.saveExerciseFromModal();" class="space-y-3">
                <input type="hidden" id="ex-modal-id">
                <input type="hidden" id="ex-modal-num" value="1">

                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 mb-1">Unidad de Ejercicio</label>
                        <input type="number" id="ex-modal-num-display" min="1" value="1" onchange="document.getElementById('ex-modal-num').value = this.value" class="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-xs text-amber-400 font-black text-center focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 mb-1">Bloque</label>
                        <select id="ex-modal-bloque" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-300 font-bold focus:outline-none">
                            <option value="Inicio">🏁 Inicio</option>
                            <option value="Desarrollo" selected>🔥 Desarrollo</option>
                            <option value="Cierre">🧘 Cierre</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">Nombre del Ejercicio / Movimiento</label>
                    <input type="text" id="ex-modal-name" required placeholder="Ej: Sentadilla Trasera con Barra" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-500">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">Categoría</label>
                    <select id="ex-modal-category" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none">
                        <option value="Peso Libre">Peso Libre</option>
                        <option value="Máquinas">Máquinas</option>
                        <option value="Calistenia / Peso Corporal">Calistenia / Peso Corporal</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Flexibilidad / Movilidad">Flexibilidad / Movilidad</option>
                    </select>
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">URL de Demostración (YouTube / Video / GIF / Imagen)</label>
                    <input type="url" id="ex-modal-media-url" placeholder="https://..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-500">
                </div>

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">Notas / Instrucciones Técnicas</label>
                    <textarea id="ex-modal-notes" rows="2" placeholder="Indicaciones de ejecución..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-snug"></textarea>
                </div>

                <div class="pt-2 flex gap-2">
                    <button type="button" onclick="window.closeExerciseModal()" class="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition">
                        Cancelar
                    </button>
                    <button type="submit" class="w-1/2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 rounded-xl shadow-lg transition active:scale-95 cursor-pointer">
                        Guardar Movimiento
                    </button>
                </div>
            </form>
        </div>
    </div>`;
}