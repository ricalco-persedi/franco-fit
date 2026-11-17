/**
 * Componente: MesocicloView.js
 * Selección de semanas y semana en preparación con auto-guardado inmediato.
 */
export function renderMesocicloView(student = {}) {
  if (!student || !student.id) {
    return `
    <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
        <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
        <p class="text-xs font-semibold">Selecciona un alumno para configurar su Mesociclo.</p>
    </div>`;
  }

  const meso = student.mesociclo || {};
  const totalWeeks = parseInt(student.totalWeeks || meso.numeroSemanas) || 4;
  const prepWeek = parseInt(meso.semanaEnPreparacion) || 1;
  const visibility = student.visibilitySettings || {};

  const visMesociclo = visibility.mesociclo !== false;
  const visSemanaPrep = visibility.semanaEnPreparacion !== false;
  const visEnfoqueMeso = visibility.enfoqueMesociclo !== false;
  const semanasSugeridas = [1, 2, 3, 4, 6, 8, 12];
  const microByWeek = student.microcicloByWeek || {};

  return `
  <div class="space-y-4">
      <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
          <div class="flex items-center gap-2">
              <i data-feather="calendar" class="w-5 h-5 text-amber-400"></i>
              <div>
                  <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider">Planificación del Mesociclo</h2>
                  <span class="text-[10px] text-emerald-400 font-bold">⚡ Cambios guardados automáticamente en Supabase</span>
              </div>
          </div>
      </div>

      <!-- SECCIÓN 1: DURACIÓN TOTAL EN SEMANAS -->
      <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <i data-feather="clock" class="w-4 h-4 text-sky-400"></i> 1. Duración Total del Mesociclo
              </h3>
              <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visMesociclo ? 'text-amber-400' : 'text-slate-500'}">
                  <input type="checkbox" id="vis-mesociclo" ${visMesociclo ? 'checked' : ''} onchange="window.saveMesocicloStudentAuto()" class="w-3.5 h-3.5 accent-amber-500 rounded">
                  <span>${visMesociclo ? '👁️ Visible' : '🔒 Oculto'}</span>
              </label>
          </div>
          <div class="space-y-3">
              <label class="block text-[10px] font-bold text-slate-400">Cantidad Total de Semanas que abarcará:</label>
              <div class="flex flex-wrap gap-2">
                  ${semanasSugeridas.map(sw => `
                  <button type="button" onclick="window.setMesoWeeksPresetAuto(${sw})" class="meso-week-btn text-xs font-black px-3 py-2 rounded-xl border transition cursor-pointer ${totalWeeks === sw ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg' : 'bg-slate-950 text-slate-300 border-slate-800 hover:text-white'}">
                      ${sw} ${sw === 1 ? 'Semana' : 'Semanas'}
                  </button>
                  `).join('')}
              </div>
              <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                  <span class="text-[11px] font-bold text-slate-300">Duración personalizada:</span>
                  <div class="flex items-center gap-2">
                      <input type="number" id="meso-weeks-input" min="1" max="52" value="${totalWeeks}" onchange="window.saveMesocicloStudentAuto()" class="w-20 bg-slate-900 border border-amber-500/50 rounded-xl p-2 text-xs text-amber-400 font-black text-center focus:outline-none">
                      <span class="text-xs text-slate-400 font-semibold">semanas</span>
                  </div>
              </div>
          </div>
      </section>

      <!-- SECCIÓN 2: SEMANA EN PREPARACIÓN -->
      <section class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/40 shadow-xl space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i data-feather="edit-3" class="w-4 h-4 text-amber-400"></i> 2. Semana en Preparación
              </h3>
              <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visSemanaPrep ? 'text-amber-400' : 'text-slate-500'}">
                  <input type="checkbox" id="vis-semana-prep" ${visSemanaPrep ? 'checked' : ''} onchange="window.saveMesocicloStudentAuto()" class="w-3.5 h-3.5 accent-amber-500 rounded">
                  <span>${visSemanaPrep ? '👁️ Visible' : '🔒 Oculto'}</span>
              </label>
          </div>
          <div class="space-y-2">
              <label class="block text-[10px] font-bold text-slate-300">Seleccionar la Semana que estás diseñando actualmente:</label>
              <select id="meso-prep-week-select" onchange="window.handleWeekChange(this.value)" class="w-full bg-slate-950 border border-amber-500/60 rounded-xl p-3 text-xs text-amber-300 font-black focus:outline-none focus:border-amber-400 cursor-pointer">
                  ${Array.from({ length: totalWeeks }, (_, i) => i + 1).map(w => {
                      const isLoaded = !!microByWeek[w] && Array.isArray(microByWeek[w].diasAsignados) && microByWeek[w].diasAsignados.length > 0;
                      const labelState = isLoaded ? `(Cargada: ${microByWeek[w].diasAsignados.join(', ')})` : '(Sin configurar)';
                      return `<option value="${w}" ${prepWeek === w ? 'selected' : ''}>Semana ${w} ${w === prepWeek ? '➔ [EN EDICIÓN]' : labelState}</option>`;
                  }).join('')}
              </select>
              <p class="text-[10px] text-slate-400 italic">Al cambiar de semana, los ejercicios y microciclos se actualizarán automáticamente a la semana seleccionada.</p>
          </div>
      </section>

      <!-- SECCIÓN 3: ENFOQUE & METAS -->
      <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <i data-feather="file-text" class="w-4 h-4 text-emerald-400"></i> Enfoque & Metas del Mesociclo
              </h3>
              <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visEnfoqueMeso ? 'text-amber-400' : 'text-slate-500'}">
                  <input type="checkbox" id="vis-enfoque-meso" ${visEnfoqueMeso ? 'checked' : ''} onchange="window.saveMesocicloStudentAuto()" class="w-3.5 h-3.5 accent-amber-500 rounded">
                  <span>${visEnfoqueMeso ? '👁️ Visible' : '🔒 Oculto'}</span>
              </label>
          </div>
          <div>
              <textarea id="meso-enfoque-input" rows="4" onchange="window.saveMesocicloStudentAuto()" placeholder="Describa las metas específicas de este mesociclo..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed">${meso.enfoque || ''}</textarea>
          </div>
      </section>
  </div>`;
}