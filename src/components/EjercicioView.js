/**
 * Componente: EjercicioView.js (Versión 'Todo en Uno' + Edición Directa en Tarjeta)
 */

export function renderEjercicioView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para diseñar su rutina.</p>
        </div>`;
    }

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const microByW = (student.microcicloByWeek && student.microcicloByWeek[prepWeek]) || {};
    const prepDay = microByW.diaEnPreparacion || student.microciclo?.diaEnPreparacion || 1;
    const diasAsignados = microByW.diasAsignados || student.microciclo?.diasAsignados || ['Lunes', 'Miércoles', 'Viernes'];
    const diaNombre = diasAsignados[prepDay - 1] || `Día ${prepDay}`;

    const routine = student.routine || {};
    const weekRoutine = routine[prepWeek] || {};
    const dayExercises = weekRoutine[prepDay] || [];

    const sortedExercises = [...dayExercises].sort((a, b) => {
        const numA = Number(a.exerciseNumber || 0);
        const numB = Number(b.exerciseNumber || 0);
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

            // Valores de variables con respaldo por defecto
            const seriesVal = ex.series || 4;
            const tipoSerieVal = ex.tipoSerie || 'Normal';
            const setRestVal = ex.setRest || '90s';
            const repsVal = ex.repeticiones || ex.repsRange || '8-12';
            const rpeVal = ex.rpe || '8';
            const tempoVal = ex.tempo || '3-0-1-0';
            const cargaVal = ex.cargaKg !== undefined ? ex.cargaKg : '0';
            const rmVal = ex.porcentajeRM || '75%';

            let mediaPreview = '';
            if (media.type === 'video') {
                mediaPreview = `<div class="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 my-2"><iframe src="${media.embedUrl}" class="w-full h-full border-0" allowfullscreen></iframe></div>`;
            } else if (media.type === 'image') {
                mediaPreview = `<div class="h-32 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 my-2"><img src="${media.originalUrl}" alt="${exName}" class="w-full h-full object-cover"></div>`;
            }

            return `
            <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/40 shadow-xl space-y-3">
                <!-- CABECERA DE TARJETA -->
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

                <!-- ⚡ PANEL DE EDICIÓN RÁPIDA IN-LINE DIRECTO EN TARJETA -->
                <div class="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2.5">
                    <div class="flex items-center justify-between border-b border-slate-800/60 pb-1">
                        <span class="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <i data-feather="sliders" class="w-3 h-3 text-amber-400"></i> Ajuste Rápido de Prescripción
                        </span>
                        <span class="text-[9px] text-slate-500 italic">Edición en tiempo real</span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <!-- Series & Tipo -->
                        <div class="bg-slate-900 p-2 rounded-lg border border-slate-800 space-y-1">
                            <label class="text-[9px] font-bold text-slate-400 block uppercase">Series / Estructura</label>
                            <div class="flex gap-1">
                                <input type="number" min="1" max="20" value="${seriesVal}" onchange="window.quickUpdateExerciseProp('${exId}', 'series', this.value)" class="w-12 bg-slate-950 border border-amber-500/40 rounded p-1 text-center font-black text-amber-300 focus:outline-none">
                                <select onchange="window.quickUpdateExerciseProp('${exId}', 'tipoSerie', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded p-1 text-[10px] text-slate-200 font-semibold focus:outline-none">
                                    <option value="Normal" ${tipoSerieVal === 'Normal' ? 'selected' : ''}>Normal</option>
                                    <option value="Superserie" ${tipoSerieVal === 'Superserie' ? 'selected' : ''}>Superserie</option>
                                    <option value="Biserie" ${tipoSerieVal === 'Biserie' ? 'selected' : ''}>Biserie</option>
                                    <option value="Triserie" ${tipoSerieVal === 'Triserie' ? 'selected' : ''}>Triserie</option>
                                    <option value="Dropset" ${tipoSerieVal === 'Dropset' ? 'selected' : ''}>Dropset</option>
                                    <option value="Piramidal" ${tipoSerieVal === 'Piramidal' ? 'selected' : ''}>Piramidal</option>
                                    <option value="RPT" ${tipoSerieVal === 'RPT' ? 'selected' : ''}>RPT</option>
                                    <option value="Rest-Pause" ${tipoSerieVal === 'Rest-Pause' ? 'selected' : ''}>Rest-Pause</option>
                                </select>
                            </div>
                        </div>

                        <!-- Repeticiones & RPE -->
                        <div class="bg-slate-900 p-2 rounded-lg border border-slate-800 space-y-1">
                            <label class="text-[9px] font-bold text-slate-400 block uppercase">Reps / Esfuerzo</label>
                            <div class="flex gap-1">
                                <input type="text" value="${repsVal}" placeholder="8-12" onchange="window.quickUpdateExerciseProp('${exId}', 'repeticiones', this.value)" class="w-full bg-slate-950 border border-amber-500/40 rounded p-1 text-center font-black text-emerald-400 focus:outline-none">
                                <input type="text" value="${rpeVal}" placeholder="RPE 8" onchange="window.quickUpdateExerciseProp('${exId}', 'rpe', this.value)" class="w-14 bg-slate-950 border border-slate-800 rounded p-1 text-center text-[10px] text-slate-300 font-bold focus:outline-none">
                            </div>
                        </div>

                        <!-- Carga (Kg) & %RM -->
                        <div class="bg-slate-900 p-2 rounded-lg border border-slate-800 space-y-1">
                            <label class="text-[9px] font-bold text-slate-400 block uppercase">Carga (Kg) / %RM</label>
                            <div class="flex gap-1">
                                <input type="text" value="${cargaVal}" placeholder="Kg" onchange="window.quickUpdateExerciseProp('${exId}', 'cargaKg', this.value)" class="w-full bg-slate-950 border border-amber-500/40 rounded p-1 text-center font-black text-sky-300 focus:outline-none">
                                <input type="text" value="${rmVal}" placeholder="75%" onchange="window.quickUpdateExerciseProp('${exId}', 'porcentajeRM', this.value)" class="w-14 bg-slate-950 border border-slate-800 rounded p-1 text-center text-[10px] text-slate-300 font-bold focus:outline-none">
                            </div>
                        </div>

                        <!-- Descanso & Tempo -->
                        <div class="bg-slate-900 p-2 rounded-lg border border-slate-800 space-y-1">
                            <label class="text-[9px] font-bold text-slate-400 block uppercase">Pausa / Tempo</label>
                            <div class="flex gap-1">
                                <input type="text" value="${setRestVal}" placeholder="90s" onchange="window.quickUpdateExerciseProp('${exId}', 'setRest', this.value)" class="w-1/2 bg-slate-950 border border-slate-800 rounded p-1 text-center text-[10px] text-slate-200 font-bold focus:outline-none">
                                <input type="text" value="${tempoVal}" placeholder="3-0-1-0" onchange="window.quickUpdateExerciseProp('${exId}', 'tempo', this.value)" class="w-1/2 bg-slate-950 border border-slate-800 rounded p-1 text-center text-[10px] text-slate-300 font-mono focus:outline-none">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- BOTONES DE ACCIÓN COMPLETA -->
                <div class="flex justify-end gap-2 pt-1 border-t border-slate-800/80">
                    <button onclick="window.editExerciseInModal('${exId}')" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-amber-300 px-3 py-1.5 rounded-xl font-bold border border-slate-700 flex items-center gap-1 transition cursor-pointer">
                        <i data-feather="edit-2" class="w-3 h-3"></i> Editar Modal Completo
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
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2 min-w-0">
                <i data-feather="film" class="w-5 h-5 text-amber-400 shrink-0"></i>
                <div class="min-w-0">
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider truncate">Diseño de Ejercicios y Prescripción</h2>
                    <span class="text-[10px] text-slate-300 font-bold block truncate">
                        📍 Editando: <span class="text-sky-300">Semana ${prepWeek}</span> • <span class="text-amber-300">Día ${prepDay} (${diaNombre})</span>
                    </span>
                </div>
            </div>
            <button onclick="window.openAddExerciseModal(${nextExerciseNum})" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1 shrink-0 cursor-pointer">
                <i data-feather="plus-circle" class="w-4 h-4"></i> + Agregar Ejercicio ${nextExerciseNum}
            </button>
        </div>

        <div class="space-y-3">
            ${exercisesListHTML}
        </div>

        ${renderExerciseModalHTML()}
    </div>`;
}

function parseMediaInfo(url) {
    if (!url || typeof url !== 'string') return { type: 'none', originalUrl: '' };
    const trimmed = url.trim();

    const ytDomain = "youtube" + ".com";
    if (trimmed.includes(ytDomain) || trimmed.includes("youtu.be")) {
        let videoId = '';
        if (trimmed.includes('youtu.be/')) {
            videoId = trimmed.split('youtu.be/')[1].split('?')[0];
        } else if (trimmed.includes('watch?v=')) {
            videoId = trimmed.split('watch?v=')[1].split('&')[0];
        } else if (trimmed.includes('/embed/')) {
            videoId = trimmed.split('/embed/')[1].split('?')[0];
        }

        if (videoId) {
            return {
                type: 'video',
                originalUrl: trimmed,
                embedUrl: 'https://www.' + ytDomain + '/embed/' + videoId + '?autoplay=0&rel=0'
            };
        }
    }

    if (trimmed.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i)) {
        return { type: 'image', originalUrl: trimmed };
    }

    return { type: 'link', originalUrl: trimmed };
}

function renderExerciseModalHTML() {
    return `
    <div id="exercise-entity-modal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 hidden">
        <div class="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">

            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 id="ex-modal-title" class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <i data-feather="plus-circle" class="w-4 h-4"></i> Cargar Ejercicio 'Todo en Uno'
                </h3>
                <button onclick="window.closeExerciseModal()" class="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer">
                    <i data-feather="x" class="w-5 h-5"></i>
                </button>
            </div>

            <form onsubmit="event.preventDefault(); window.saveExerciseFromModal();" class="space-y-4">
                <input type="hidden" id="ex-modal-id">
                <input type="hidden" id="ex-modal-num" value="1">

                <!-- BLOQUE 1: IDENTIFICACIÓN Y VIDEO -->
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                    <h4 class="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5">
                        <i data-feather="info" class="w-3.5 h-3.5 text-amber-400"></i> 1. Identificación y Demostración
                    </h4>

                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">N° Orden</label>
                            <input type="number" id="ex-modal-num-display" min="1" value="1" onchange="document.getElementById('ex-modal-num').value = this.value" class="w-full bg-slate-900 border border-amber-500/50 rounded-xl p-2 text-xs text-amber-400 font-black text-center focus:outline-none">
                        </div>
                        <div class="col-span-2">
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">Nombre del Movimiento *</label>
                            <input type="text" id="ex-modal-name" required placeholder="Ej: Sentadilla Trasera con Barra" oninput="window.autoSuggestVideoLink(this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white font-semibold focus:outline-none focus:border-amber-500">
                        </div>
                    </div>

                    <div>
                        <label class="block text-[9px] font-bold text-slate-400 mb-1">Categoría</label>
                        <div class="space-y-1.5">
                            <select id="ex-modal-category" onchange="window.handleExCategoryChange(this.value)" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white font-semibold focus:outline-none cursor-pointer">
                                <option value="Peso Libre">Peso Libre</option>
                                <option value="Máquinas">Máquinas</option>
                                <option value="Calistenia / Peso Corporal">Calistenia / Peso Corporal</option>
                                <option value="Cardio">Cardio</option>
                                <option value="Flexibilidad / Movilidad">Flexibilidad / Movilidad</option>
                                <option value="__custom__">➕ Agregar / Personalizar Categoría...</option>
                            </select>
                            <input type="text" id="ex-modal-category-custom" placeholder="Escribe la categoría personalizada..." class="hidden w-full bg-slate-900 border border-amber-500/60 rounded-xl p-2 text-xs text-amber-300 font-bold focus:outline-none">
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-[9px] font-bold text-slate-400">URL de Demostración (Video)</label>
                            <button type="button" onclick="window.searchVideoInYouTube()" class="text-[9px] bg-red-600 hover:bg-red-500 text-white font-black px-2 py-0.5 rounded-md flex items-center gap-1 transition shadow cursor-pointer">
                                🔍 Buscar en YouTube
                            </button>
                        </div>
                        <input type="url" id="ex-modal-media-url" placeholder="https://..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white font-semibold focus:outline-none focus:border-amber-500">
                        <p id="ex-modal-video-badge" class="text-[9px] text-emerald-400 font-bold hidden mt-1">✨ Video autocompletado desde tu Banco de Videos</p>
                    </div>

                    <div>
                        <label class="block text-[9px] font-bold text-slate-400 mb-1">Notas / Instrucciones Técnicas</label>
                        <textarea id="ex-modal-notes" rows="2" placeholder="Indicaciones de ejecución táctica..." class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-snug"></textarea>
                    </div>
                </div>

                <!-- BLOQUE 2: SERIES Y PAUSAS -->
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                    <h4 class="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5">
                        <i data-feather="layers" class="w-3.5 h-3.5 text-amber-400"></i> 2. Series y Tiempos de Descanso
                    </h4>

                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">Número de Series</label>
                            <input type="number" id="ex-modal-series" min="1" max="20" value="4" class="w-full bg-slate-900 border border-amber-500/50 rounded-xl p-2 text-xs text-amber-400 font-black text-center focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">Tipo de Serie</label>
                            <select id="ex-modal-tipo-serie" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white font-semibold focus:outline-none cursor-pointer">
                                <option value="Normal">Normal</option>
                                <option value="Superserie">Superserie</option>
                                <option value="Biserie">Biserie</option>
                                <option value="Triserie">Triserie</option>
                                <option value="Dropset">Dropset</option>
                                <option value="Piramidal">Piramidal</option>
                                <option value="RPT">RPT (Reverse Pyramid)</option>
                                <option value="Rest-Pause">Rest-Pause</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">Pausa entre Series</label>
                            <input type="text" id="ex-modal-set-rest" placeholder="Ej: 90s" value="90s" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-bold focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">Pausa Bloque / Post-Ex</label>
                            <input type="text" id="ex-modal-block-rest" placeholder="Ej: 120s" value="120s" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-bold focus:outline-none">
                        </div>
                    </div>
                </div>

                <!-- BLOQUE 3: REPETICIONES, RPE Y TEMPO -->
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                    <h4 class="text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5">
                        <i data-feather="repeat" class="w-3.5 h-3.5 text-emerald-400"></i> 3. Repeticiones, RPE y Tempo
                    </h4>

                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">Repeticiones</label>
                            <input type="text" id="ex-modal-reps" placeholder="8-12" value="8-12" class="w-full bg-slate-900 border border-emerald-500/50 rounded-xl p-2 text-xs text-emerald-400 font-black text-center focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">Carácter (RPE / RIR)</label>
                            <input type="text" id="ex-modal-rpe" placeholder="8" value="8" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-bold text-center focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">Tempo Execution</label>
                            <input type="text" id="ex-modal-tempo" placeholder="3-0-1-0" value="3-0-1-0" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-mono text-center focus:outline-none">
                        </div>
                    </div>
                </div>

                <!-- BLOQUE 4: CARGA E INTENSIDAD -->
                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-3">
                    <h4 class="text-[10px] font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5">
                        <i data-feather="activity" class="w-3.5 h-3.5 text-sky-400"></i> 4. Prescripción de Cargas e Intensidad
                    </h4>

                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">Carga (Kg)</label>
                            <input type="text" id="ex-modal-carga" placeholder="0" value="0" class="w-full bg-slate-900 border border-sky-500/50 rounded-xl p-2 text-xs text-sky-300 font-black text-center focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">% 1RM</label>
                            <input type="text" id="ex-modal-rm" placeholder="75%" value="75%" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 font-bold text-center focus:outline-none">
                        </div>
                        <div>
                            <label class="block text-[9px] font-bold text-slate-400 mb-1">Progresión</label>
                            <select id="ex-modal-progression" class="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-[10px] text-white font-semibold focus:outline-none cursor-pointer">
                                <option value="Lineal">Lineal</option>
                                <option value="Ondulante">Ondulante</option>
                                <option value="Escalonada">Escalonada</option>
                                <option value="Auto-regulada">Auto-regulada</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="pt-2 flex gap-2">
                    <button type="button" onclick="window.closeExerciseModal()" class="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer">
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