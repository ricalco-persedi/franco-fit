import { parseMediaInfo } from './ExerciseCard.js';

/**
 * Componente para renderizar la gestión de la Entidad Relacional Ejercicio
 * Muestra una lista secuencial de ejercicios numerados (Ejercicio 1, Ejercicio 2...)
 * sin división de bloques (Inicio, Desarrollo, Cierre).
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

    // Ordenar los ejercicios por su número asignado correlativo
    const sortedExercises = [...exercisesOfDay].sort((a, b) => {
        const numA = a.exerciseNumber || 0;
        const numB = b.exerciseNumber || 0;
        return numA - numB;
    });

    const nextExerciseNum = sortedExercises.length > 0 
        ? Math.max(...sortedExercises.map(e => e.exerciseNumber || 0)) + 1 
        : 1;

    let exercisesListHTML = '';

    if (sortedExercises.length === 0) {
        exercisesListHTML = `
        <div class="bg-slate-900/90 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3 shadow-xl">
            <i data-feather="film" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold text-slate-300">
                No hay ejercicios asignados aún para la <strong class="text-sky-300">Semana ${prepWeek}</strong> - <strong class="text-amber-300">Día ${prepDay} (${diaNombre})</strong>.
            </p>
            <button onclick="window.openAddExerciseModal(${nextExerciseNum})" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer">
                <i data-feather="plus-circle" class="w-4 h-4"></i> + Cargar Ejercicio 1
            </button>
        </div>`;
    } else {
        exercisesListHTML = sortedExercises.map((ex, idx) => {
            const exNum = ex.exerciseNumber || (idx + 1);
            const exId = String(ex.id || '');
            const exName = ex.name || `Ejercicio ${exNum}`;
            const exCategory = ex.category || 'General';
            const isVisible = ex.visible !== false;
            const media = parseMediaInfo(ex.mediaUrl);

            let mediaPreview = '';
            if (media.type === 'youtube') {
                mediaPreview = `<div class="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 my-2"><iframe src="${media.embedUrl}" class="w-full h-full border-0" allowfullscreen></iframe></div>`;
            } else if (media.type === 'image') {
                mediaPreview = `<div class="h-32 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 my-2"><img src="${media.originalUrl}" alt="${exName}" class="w-full h-full object-cover"></div>`;
            }

            return `
            <!-- TARJETA INDIVIDUAL DE EJERCICIO NUMERADO -->
            <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/40 shadow-xl space-y-3">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
                    <div class="flex items-center gap-2 truncate pr-2">
                        <span class="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl shadow shrink-0">
                            Ejercicio ${exNum}
                        </span>
                        <div class="truncate">
                            <span class="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">${exCategory}</span>
                            <strong class="text-xs text-white font-black truncate block">${exName}</strong>
                        </div>
                    </div>

                    <button onclick="window.toggleExerciseVisibility('${exId}')" class="px-2.5 py-1 rounded-xl text-[10px] font-black transition cursor-pointer shrink-0 ${isVisible ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
                        ${isVisible ? '👁️ Visible' : '🔒 Oculto'}
                    </button>
                </div>

                ${mediaPreview}

                ${ex.notes ? `
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-300 leading-snug">
                    <span class="text-[9px] font-bold text-amber-400 uppercase block mb-0.5">Notas Técnicas:</span>
                    ${ex.notes}
                </div>` : ''}

                <div class="flex justify-end gap-2 pt-1 border-t border-slate-800/80">
                    <button onclick="window.editExerciseInModal('${exId}')" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-xl font-bold border border-slate-700 flex items-center gap-1 transition cursor-pointer">
                        <i data-feather="edit-2" class="w-3 h-3"></i> Editar
                    </button>
                    <button onclick="window.deleteExerciseFromRoutine('${exId}')" class="text-[10px] bg-rose-950/80 hover:bg-rose-900 text-rose-300 px-3 py-1.5 rounded-xl font-bold border border-rose-800 flex items-center gap-1 transition cursor-pointer">
                        <i data-feather="trash-2" class="w-3 h-3"></i> Eliminar
                    </button>
                </div>
            </div>`;
        }).join('');
    }

    return `
    <div class="space-y-4">
        <!-- HEADER DE LA ENTIDAD -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2 min-w-0">
                <i data-feather="film" class="w-5 h-5 text-amber-400 shrink-0"></i>
                <div class="min-w-0">
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider truncate">Diseño Secuencial de Ejercicios</h2>
                    <span class="text-[10px] text-slate-300 font-bold block truncate">
                        📍 Editando: <span class="text-sky-300">Semana ${prepWeek}</span> • <span class="text-amber-300">Día ${prepDay} (${diaNombre})</span>
                    </span>
                </div>
            </div>
            <button onclick="window.openAddExerciseModal(${nextExerciseNum})" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer">
                <i data-feather="plus-circle" class="w-4 h-4"></i> + Agregar Ejercicio ${nextExerciseNum}
            </button>
        </div>

        <!-- LISTA SECUENCIAL DE EJERCICIOS DEL DÍA -->
        <div class="space-y-3">
            ${exercisesListHTML}
        </div>

        <!-- MODAL DE CREACIÓN / EDICIÓN -->
        ${renderExerciseModalHTML()}
    </div>`;
}

function renderExerciseModalHTML() {
    return `
    <div id="exercise-entity-modal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 id="ex-modal-title" class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <i data-feather="plus-circle" class="w-4 h-4"></i> Cargar Ejercicio
                </h3>
                <button onclick="window.closeExerciseModal()" class="text-slate-400 hover:text-white p-1 rounded-lg">
                    <i data-feather="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="event.preventDefault(); window.saveExerciseFromModal();" class="space-y-3">
                <input type="hidden" id="ex-modal-id">
                <input type="hidden" id="ex-modal-num" value="1">

                <div>
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">Número de Orden de Ejercicio</label>
                    <input type="number" id="ex-modal-num-display" min="1" value="1" onchange="document.getElementById('ex-modal-num').value = this.value" class="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-xs text-amber-400 font-black text-center focus:outline-none">
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
                        Guardar Ejercicio
                    </button>
                </div>
            </form>
        </div>
    </div>`;
}