/**
 * Componente para renderizar la gestión de la Entidad Relacional Microciclo
 */
export function renderMicrocicloView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para configurar su Microciclo.</p>
        </div>`;
    }

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    
    // Lectura aislada por semana en preparación
    const microByWeek = student.microcicloByWeek || {};
    const weekMicro = microByWeek[prepWeek] || (prepWeek === 1 ? student.microciclo : null) || {};

    const diasAsignados = weekMicro.diasAsignados || student.microciclo?.diasAsignados || ['Lunes', 'Miércoles', 'Viernes'];
    const prepDay = weekMicro.diaEnPreparacion || student.microciclo?.diaEnPreparacion || 1;
    const currentTipo = weekMicro.tipoMicrociclo || student.microciclo?.tipoMicrociclo || 'Carga';
    const observaciones = weekMicro.observaciones !== undefined ? weekMicro.observaciones : '';

    const visibility = student.visibilitySettings || {};
    const visMicrociclo = visibility.microciclo !== false;
    const visDiasSemana = visibility.diasSemana !== false;
    const visDiaPrep = visibility.diaEnPreparacion !== false;

    const diasSemanaBase = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const tiposMicroBase = ['Ajuste', 'Carga', 'Impacto', 'Regenerativo / Descarga', 'Restablecimiento', 'Competencia'];
    
    if (currentTipo && !tiposMicroBase.includes(currentTipo)) {
        tiposMicroBase.push(currentTipo);
    }
    const diasSeleccionados = Array.isArray(diasAsignados) ? diasAsignados : ['Lunes', 'Miércoles', 'Viernes'];

    return `
    <div class="space-y-4">
        <!-- HEADER DE LA ENTIDAD -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2">
                <i data-feather="grid" class="w-5 h-5 text-amber-400"></i>
                <div>
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider">Estructura del Microciclo (Semana ${prepWeek})</h2>
                    <span class="text-[10px] text-slate-400">Días asignados y carácter del microciclo</span>
                </div>
            </div>
            <button onclick="window.saveMicrocicloStudent()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer">
                <i data-feather="save" class="w-3.5 h-3.5"></i> Guardar
            </button>
        </div>

        <!-- SECCIÓN 1: DÍAS ESPECÍFICOS DE LA SEMANA -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="calendar" class="w-4 h-4 text-sky-400"></i> 1. Días de Entrenamiento Asignados
                </h3>
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visDiasSemana ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-dias-semana" ${visDiasSemana ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visDiasSemana ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>
            <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400">Toca para seleccionar los días específicos de la semana:</label>
                <div class="flex flex-wrap gap-1.5" id="micro-days-selector-container">
                    ${diasSemanaBase.map(dia => {
                        const isSelected = diasSeleccionados.includes(dia);
                        return `
                        <button type="button" onclick="window.toggleMicroDaySelection(this, '${dia}')" data-day="${dia}" class="micro-day-chip text-[11px] font-bold px-3.5 py-2 rounded-xl border transition cursor-pointer ${isSelected ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-md font-black' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}">
                            ${dia}
                        </button>`;
                    }).join('')}
                </div>
            </div>
        </section>

        <!-- SECCIÓN 2: DÍA EN PREPARACIÓN -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/40 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="edit-3" class="w-4 h-4 text-amber-400"></i> 2. Día en Preparación
                </h3>
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visDiaPrep ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-dia-prep" ${visDiaPrep ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visDiaPrep ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>
            <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-300">Selecciona el día de la semana que estás diseñando actualmente:</label>
                <select id="micro-prep-day-select" onchange="window.handleDayChange(this.value)" class="w-full bg-slate-950 border border-amber-500/60 rounded-xl p-3 text-xs text-amber-300 font-black focus:outline-none focus:border-amber-400 cursor-pointer">
                    ${diasSeleccionados.map((dia, idx) => {
                        const dayNum = idx + 1;
                        return `<option value="${dayNum}" ${prepDay === dayNum ? 'selected' : ''}>Día ${dayNum} - ${dia} ${prepDay === dayNum ? '(En Edición)' : ''}</option>`;
                    }).join('')}
                </select>
                <p class="text-[10px] text-slate-400 italic">Los ejercicios, series y cargas que configures a continuación se vincularán a este día específico.</p>
            </div>
        </section>

        <!-- SECCIÓN 3: TIPO DE MICROCICLO + VISIBILIDAD -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="activity" class="w-4 h-4 text-emerald-400"></i> 3. Carácter del Microciclo
                </h3>
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visMicrociclo ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-microciclo" ${visMicrociclo ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visMicrociclo ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>
            <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400">Seleccionar o Personalizar Carácter del Bloque</label>
                <div class="space-y-2">
                    <select id="micro-tipo-select" onchange="window.handleMicroTipoChange(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500 cursor-pointer">
                        ${tiposMicroBase.map(tipo => `
                        <option value="${tipo}" ${currentTipo === tipo ? 'selected' : ''}>${tipo}</option>
                        `).join('')}
                        <option value="__custom__">➕ Agregar / Personalizar Tipo...</option>
                    </select>
                    <input type="text" id="micro-tipo-custom" placeholder="Escribe el carácter personalizado..." value="${tiposMicroBase.includes(currentTipo) ? '' : currentTipo}" class="${tiposMicroBase.includes(currentTipo) ? 'hidden' : ''} w-full bg-slate-950 border border-amber-500/60 rounded-xl p-3 text-xs text-amber-300 font-bold focus:outline-none">
                </div>
            </div>
        </section>

        <!-- SECCIÓN 4: OBSERVACIONES Y NOTAS TÉCNICAS -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="clipboard" class="w-4 h-4 text-amber-400"></i> Observaciones del Microciclo (Semana ${prepWeek})
            </h3>
            <div>
                <textarea id="micro-obs-input" rows="3" placeholder="Instrucciones tácticas para esta semana..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed">${observaciones}</textarea>
            </div>
        </section>

        <!-- BOTÓN FINAL DE GUARDADO -->
        <button onclick="window.saveMicrocicloStudent()" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3 rounded-2xl shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <i data-feather="check-circle" class="w-4 h-4"></i> Guardar Microciclo de la Semana ${prepWeek}
        </button>
    </div>`;
}