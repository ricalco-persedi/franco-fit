/**
 * Componente: MicrocicloView.js
 * Estructura del Microciclo aislada por semana con Selección Múltiple de Días
 */
export function renderMicrocicloView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para configurar su Microciclo.</p>
        </div>`;
    }

    const prepWeek = parseInt(student.mesociclo?.semanaEnPreparacion) || 1;
    const microByWeek = student.microcicloByWeek || {};

    // Lectura aislada de la semana actual en preparación
    const weekMicro = microByWeek[prepWeek] || null;

    const diasAsignados = weekMicro ? (weekMicro.diasAsignados || []) : [];
    const prepDay = weekMicro ? (weekMicro.diaEnPreparacion || 1) : 1;
    const currentTipo = weekMicro ? (weekMicro.tipoMicrociclo || 'Carga') : 'Carga';
    const observaciones = weekMicro ? (weekMicro.observaciones || '') : '';
    const isWeekConfigured = !!weekMicro && diasAsignados.length > 0;

    const visibility = student.visibilitySettings || {};
    const visMicrociclo = visibility.microciclo !== false;
    const visDiasSemana = visibility.diasSemana !== false;
    const visDiaPrep = visibility.diaEnPreparacion !== false;

    const diasSemanaBase = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const tiposMicroBase = ['Ajuste', 'Carga', 'Impacto', 'Regenerativo / Descarga', 'Restablecimiento', 'Competencia'];

    if (currentTipo && !tiposMicroBase.includes(currentTipo)) {
        tiposMicroBase.push(currentTipo);
    }

    return `
    <div class="space-y-4">
        <!-- HEADER DEL MÓDULO -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2 min-w-0">
                <i data-feather="grid" class="w-5 h-5 text-amber-400 shrink-0"></i>
                <div class="min-w-0">
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider truncate">Microciclo - Semana ${prepWeek}</h2>
                    <span class="text-[10px] ${isWeekConfigured ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'} block truncate">
                        ${isWeekConfigured ? '✓ Días configurados para esta semana' : '⚠️ Semana sin configurar aún'}
                    </span>
                </div>
            </div>
        </div>

        <!-- SECCIÓN 1: DÍAS ESPECÍFICOS DE LA SEMANA (SELECCIÓN MÚLTIPLE) -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="calendar" class="w-4 h-4 text-sky-400"></i> 1. Días de Entrenamiento (Semana ${prepWeek})
                </h3>
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visDiasSemana ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-dias-semana" ${visDiasSemana ? 'checked' : ''} onchange="window.saveMicrocicloStudentAuto()" class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visDiasSemana ? '👁️ Visible' : '🔒 Oculto'}</span>
                </label>
            </div>
            <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400">Toca los días que entrenará el alumno en la Semana ${prepWeek} (puedes marcar múltiples):</label>
                <div class="flex flex-wrap gap-1.5" id="micro-days-selector-container">
                    ${diasSemanaBase.map(dia => {
                        const isSelected = diasAsignados.includes(dia);
                        return `
                        <button type="button" onclick="window.toggleMicroDaySelectionAuto('${dia}')" data-day="${dia}" class="micro-day-chip text-[11px] font-bold px-3.5 py-2 rounded-xl border transition cursor-pointer ${isSelected ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-black' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}">
                            ${dia}
                        </button>`;
                    }).join('')}
                </div>
            </div>
        </section>

        <!-- SECCIÓN 2: DÍA EN PREPARACIÓN (DESPLEGABLE CON TODOS LOS DÍAS SELECCIONADOS EN ITEM 1) -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/40 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="edit-3" class="w-4 h-4 text-amber-400"></i> 2. Día en Preparación
                </h3>
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visDiaPrep ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-dia-prep" ${visDiaPrep ? 'checked' : ''} onchange="window.saveMicrocicloStudentAuto()" class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visDiaPrep ? '👁️ Visible' : '🔒 Oculto'}</span>
                </label>
            </div>
            <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-300">Selecciona cuál de los días marcados vas a diseñar en el módulo Ejercicio:</label>
                <select id="micro-prep-day-select" onchange="window.handleDayChange(this.value)" class="w-full bg-slate-950 border border-amber-500/60 rounded-xl p-3 text-xs text-amber-300 font-black focus:outline-none focus:border-amber-400 cursor-pointer">
                    ${diasAsignados.length > 0 ? diasAsignados.map((dia, idx) => {
                        const dayNum = idx + 1;
                        return `<option value="${dayNum}" ${prepDay === dayNum ? 'selected' : ''}>Día ${dayNum} - ${dia} ${prepDay === dayNum ? '(En Edición)' : ''}</option>`;
                    }).join('') : `<option value="1">Día 1 (Selecciona primero los días en el Item 1)</option>`}
                </select>
                <p class="text-[10px] text-slate-400 italic">Los ejercicios que agregues en el módulo "Ejercicio" se asignarán al día activo de la Semana ${prepWeek}.</p>
            </div>
        </section>

        <!-- SECCIÓN 3: TIPO DE MICROCICLO -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="activity" class="w-4 h-4 text-emerald-400"></i> 3. Carácter del Microciclo (Semana ${prepWeek})
                </h3>
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visMicrociclo ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-microciclo" ${visMicrociclo ? 'checked' : ''} onchange="window.saveMicrocicloStudentAuto()" class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visMicrociclo ? '👁️ Visible' : '🔒 Oculto'}</span>
                </label>
            </div>
            <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400">Seleccionar o Personalizar Carácter del Bloque</label>
                <div class="space-y-2">
                    <select id="micro-tipo-select" onchange="window.handleMicroTipoChangeAuto(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500 cursor-pointer">
                        ${tiposMicroBase.map(tipo => `
                        <option value="${tipo}" ${currentTipo === tipo ? 'selected' : ''}>${tipo}</option>
                        `).join('')}
                        <option value="__custom__">➕ Agregar / Personalizar Tipo...</option>
                    </select>
                    <input type="text" id="micro-tipo-custom" onchange="window.saveMicrocicloStudentAuto()" placeholder="Escribe el carácter personalizado..." value="${tiposMicroBase.includes(currentTipo) ? '' : currentTipo}" class="${tiposMicroBase.includes(currentTipo) ? 'hidden' : ''} w-full bg-slate-950 border border-amber-500/60 rounded-xl p-3 text-xs text-amber-300 font-bold focus:outline-none">
                </div>
            </div>
        </section>

        <!-- SECCIÓN 4: OBSERVACIONES -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="clipboard" class="w-4 h-4 text-amber-400"></i> Observaciones del Microciclo (Semana ${prepWeek})
            </h3>
            <div>
                <textarea id="micro-obs-input" rows="3" onchange="window.saveMicrocicloStudentAuto()" placeholder="Instrucciones tácticas para esta semana..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed">${observaciones}</textarea>
            </div>
        </section>
    </div>`;
}