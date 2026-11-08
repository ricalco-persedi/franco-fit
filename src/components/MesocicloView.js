/**
 * Componente para renderizar la gestión de la Entidad Relacional Mesociclo
 */
export function renderMesocicloView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para configurar su Mesociclo.</p>
        </div>`;
    }

    const meso = student.mesociclo || { numeroSemanas: 4, semanaEnPreparacion: 1, enfoque: '' };
    const totalWeeks = student.totalWeeks || meso.numeroSemanas || 4;
    const prepWeek = meso.semanaEnPreparacion || 1;
    const visibility = student.visibilitySettings || {};

    // Estados de visibilidad independientes
    const visMesociclo = visibility.mesociclo !== false;
    const visSemanaPrep = visibility.semanaEnPreparacion !== false;
    const visEnfoqueMeso = visibility.enfoqueMesociclo !== false;

    // Números de semanas habituales (1, 2, 3, 4, 6, 8, 12)
    const semanasSugeridas = [1, 2, 3, 4, 6, 8, 12];

    return `
    <div class="space-y-4">
        <!-- HEADER DE LA ENTIDAD -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2">
                <i data-feather="calendar" class="w-5 h-5 text-amber-400"></i>
                <div>
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider">Planificación del Mesociclo</h2>
                    <span class="text-[10px] text-slate-400">Duración total, semana en preparación y visibilidad</span>
                </div>
            </div>
            <button onclick="window.saveMesocicloStudent()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer">
                <i data-feather="save" class="w-3.5 h-3.5"></i> Guardar
            </button>
        </div>

        <!-- SECCIÓN 1: DURACIÓN TOTAL EN SEMANAS + VISIBILIDAD -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="clock" class="w-4 h-4 text-sky-400"></i> 1. Duración Total del Mesociclo
                </h3>
                
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visMesociclo ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-mesociclo" ${visMesociclo ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visMesociclo ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>

            <div class="space-y-3">
                <label class="block text-[10px] font-bold text-slate-400">Cantidad Total de Semanas que abarcará</label>
                
                <div class="flex flex-wrap gap-2">
                    ${semanasSugeridas.map(sw => `
                        <button type="button" onclick="window.setMesoWeeksPreset(${sw})" 
                            class="meso-week-btn text-xs font-black px-3 py-2 rounded-xl border transition cursor-pointer ${totalWeeks === sw ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg' : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'}">
                            ${sw} ${sw === 1 ? 'Semana' : 'Semanas'}
                        </button>
                    `).join('')}
                </div>

                <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                    <span class="text-[11px] font-bold text-slate-300">Duración personalizada:</span>
                    <div class="flex items-center gap-2">
                        <input type="number" id="meso-weeks-input" min="1" max="52" value="${totalWeeks}" onchange="window.updatePrepWeeksDropdown()"
                            class="w-20 bg-slate-900 border border-amber-500/50 rounded-xl p-2 text-xs text-amber-400 font-black text-center focus:outline-none">
                        <span class="text-xs text-slate-400 font-semibold">semanas</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- SECCIÓN 2: SEMANA EN PREPARACIÓN + VISIBILIDAD -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/40 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="edit-3" class="w-4 h-4 text-amber-400"></i> 2. Semana en Preparación
                </h3>
                
                <!-- CASILLA DE VISIBILIDAD PARA LA SEMANA EN PREPARACIÓN -->
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visSemanaPrep ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-semana-prep" ${visSemanaPrep ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visSemanaPrep ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>

            <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-300">Seleccionar la Semana que estás diseñando actualmente:</label>
                <select id="meso-prep-week-select" class="w-full bg-slate-950 border border-amber-500/60 rounded-xl p-3 text-xs text-amber-300 font-black focus:outline-none focus:border-amber-400 cursor-pointer">
                    ${Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => `
                        <option value="${w}" ${prepWeek === w ? 'selected' : ''}>Semana ${w} ${w === prepWeek ? '(En Edición)' : ''}</option>
                    `).join('')}
                </select>
                <p class="text-[10px] text-slate-400 italic">Los ejercicios, cargas y series asignados se vincularán a esta semana específica.</p>
            </div>
        </section>

        <!-- SECCIÓN 3: ENFOQUE ESPECÍFICO DEL MESOCICLO + VISIBILIDAD -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="file-text" class="w-4 h-4 text-emerald-400"></i> Enfoque & Metas del Mesociclo
                </h3>

                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visEnfoqueMeso ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-enfoque-meso" ${visEnfoqueMeso ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visEnfoqueMeso ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>

            <div>
                <textarea id="meso-enfoque-input" rows="4" placeholder="Describa las metas específicas de este mesociclo (ej: Bloque de Acumulación de volumen, Intensificación de cargas, Semana de descarga/Deload...)" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed">${meso.enfoque || ''}</textarea>
            </div>
        </section>

        <!-- BOTÓN FINAL DE GUARDADO -->
        <button onclick="window.saveMesocicloStudent()" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3 rounded-2xl shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <i data-feather="check-circle" class="w-4 h-4"></i> Guardar Mesociclo y Semana Activa
        </button>
    </div>`;
}