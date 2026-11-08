/**
 * Componente para renderizar la gestión de la Entidad Relacional Macrociclo
 */
export function renderMacrocicloView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para configurar su Macrociclo.</p>
        </div>`;
    }

    const macro = student.macrociclo || { fase: 'Adaptación', objetivo: '' };
    const visibility = student.visibilitySettings || {};

    // Estados de visibilidad independientes
    const visMacrociclo = visibility.macrociclo !== false;
    const visObjetivos = visibility.objetivos !== false;

    // Fases predeterminadas más la fase actual si fue personalizada previamente
    const fasesBase = ['Adaptación', 'Desarrollo', 'Progresión', 'Evaluación'];
    const currentFase = macro.fase || 'Adaptación';
    if (currentFase && !fasesBase.includes(currentFase)) {
        fasesBase.push(currentFase);
    }

    return `
    <div class="space-y-4">
        <!-- HEADER DE LA ENTIDAD -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2">
                <i data-feather="target" class="w-5 h-5 text-amber-400"></i>
                <div>
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider">Planificación del Macrociclo</h2>
                    <span class="text-[10px] text-slate-400">Fases personalizables y objetivos generales</span>
                </div>
            </div>
            <button onclick="window.saveMacrocicloStudent()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer">
                <i data-feather="save" class="w-3.5 h-3.5"></i> Guardar
            </button>
        </div>

        <!-- SECCIÓN 1: FASE DEL MACROCICLO + VISIBILIDAD -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="layers" class="w-4 h-4 text-sky-400"></i> Fase de Entrenamiento
                </h3>
                
                <!-- CASILLA DE VISIBILIDAD DE FASE -->
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visMacrociclo ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-macrociclo" ${visMacrociclo ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visMacrociclo ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>

            <div class="space-y-2">
                <label class="block text-[10px] font-bold text-slate-400">Seleccionar o Personalizar Fase</label>
                <div class="space-y-2">
                    <select id="macro-fase-select" onchange="window.handleMacroFaseChange(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500 cursor-pointer">
                        ${fasesBase.map(fase => `
                            <option value="${fase}" ${currentFase === fase ? 'selected' : ''}>${fase}</option>
                        `).join('')}
                        <option value="__custom__">➕ Agregar / Personalizar Fase...</option>
                    </select>

                    <input type="text" id="macro-fase-custom" placeholder="Escribe el nombre de la nueva fase..." value="${fasesBase.includes(currentFase) ? '' : currentFase}" class="${fasesBase.includes(currentFase) ? 'hidden' : ''} w-full bg-slate-950 border border-amber-500/60 rounded-xl p-3 text-xs text-amber-300 font-bold focus:outline-none">
                </div>
            </div>
        </section>

        <!-- SECCIÓN 2: OBJETIVOS GENERALES + VISIBILIDAD INDEPENDIENTE -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="check-square" class="w-4 h-4 text-emerald-400"></i> Objetivos Generales
                </h3>

                <!-- CASILLA DE VISIBILIDAD INDEPENDIENTE PARA OBJETIVOS -->
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visObjetivos ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-objetivos" ${visObjetivos ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visObjetivos ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>

            <div>
                <textarea id="macro-objetivo" rows="4" placeholder="Describa los objetivos generales del macrociclo (ej: Hipertrofia miofibrilar, reacondicionamiento articular, mejora de resistencia de base...)" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed">${macro.objetivo || ''}</textarea>
            </div>
        </section>

        <!-- BOTÓN FINAL DE GUARDADO -->
        <button onclick="window.saveMacrocicloStudent()" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3 rounded-2xl shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <i data-feather="check-circle" class="w-4 h-4"></i> Guardar Macrociclo
        </button>
    </div>`;
}