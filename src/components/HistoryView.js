/**
 * Módulo de Historial: Visualización y recarga de rutinas guardadas previamente
 * Totalmente optimizado con Tailwind CLI y acoplado con src/main.js
 */
export function renderHistoryView(history = []) {
  return `
    <div class="space-y-4 pb-6">
      
      <!-- Título de Sección -->
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="history" class="w-4 h-4"></i> Historial de Rutinas Guardadas
        </h3>
        <span class="text-[10px] font-semibold bg-slate-900 text-slate-400 px-2.5 py-1 rounded-full border border-slate-800">
          Total: ${history.length}
        </span>
      </div>

      ${history.length === 0 ? `
        <!-- Estado Vacío -->
        <div class="text-center py-12 px-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 space-y-3">
          <div class="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-between justify-center text-slate-500">
            <i data-lucide="history" class="w-6 h-6 mx-auto"></i>
          </div>
          <div>
            <p class="text-slate-300 font-semibold text-xs">No hay rutinas guardadas en el historial</p>
            <p class="text-slate-500 text-[11px] mt-1">Crea una nueva rutina desde la pestaña "Rutina" y presiona "Guardar Rutina".</p>
          </div>
        </div>
      ` : `
        <!-- Listado de Rutinas Guardadas -->
        <div class="space-y-3">
          ${history.map((item, index) => renderHistoryCard(item, index)).join('')}
        </div>
      `}

    </div>
  `;
}

/**
 * Tarjeta individual para cada registro del historial
 */
function renderHistoryCard(item, index) {
  const exerciseCount = Array.isArray(item.exercises) ? item.exercises.length : 0;
  const formattedDate = item.startDate || 'Sin fecha definida';

  return `
    <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-md hover:border-slate-700 transition-all">
      
      <!-- Informacion Principal -->
      <div class="space-y-1 min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h4 class="font-extrabold text-sm text-slate-100 truncate">
            ${item.studentName || 'Alumno sin nombre'}
          </h4>
          <span class="text-[9px] font-bold uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 whitespace-nowrap">
            ${item.durationWeeks || 4} sem
          </span>
        </div>
        
        <p class="text-xs font-medium text-amber-400/90 truncate">
          ${item.routineName || 'Rutina General'}
        </p>
        
        <div class="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
          <span class="flex items-center gap-1">
            <i data-lucide="calendar" class="w-3 h-3 text-slate-500"></i>
            ${formattedDate}
          </span>
          <span>•</span>
          <span class="flex items-center gap-1">
            <i data-lucide="dumbbell" class="w-3 h-3 text-slate-500"></i>
            ${exerciseCount} ${exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
          </span>
        </div>
      </div>

      <!-- Botón de Carga -->
      <button 
        type="button"
        class="load-routine-btn no-print bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all whitespace-nowrap" 
        data-index="${index}"
      >
        <span>Cargar</span>
        <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
      </button>

    </div>
  `;
}