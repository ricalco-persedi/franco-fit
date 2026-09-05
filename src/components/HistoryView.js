export function renderHistoryView(history) {
  return `
    <div class="p-4 space-y-4">
      <h3 class="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center gap-2">
        <i data-lucide="history" class="w-4 h-4"></i> Historial de Rutinas
      </h3>

      ${history.length === 0 ? `
        <div class="text-center py-12 text-gray-500 text-xs">
          No hay rutinas guardadas aún.
        </div>
      ` : `
        <div class="space-y-3">
          ${history.map((item, i) => `
            <div class="bg-brand-gray p-4 rounded-xl border border-gray-800 flex items-center justify-between">
              <div>
                <h4 class="font-bold text-sm text-white">${item.studentName || 'Sin Nombre'}</h4>
                <p class="text-xs text-brand-gold">${item.routineName || 'Rutina General'}</p>
                <span class="text-[10px] text-gray-400">${item.startDate || 'Sin fecha'}</span>
              </div>
              <button class="load-routine-btn bg-brand-gold/20 text-brand-gold border border-brand-gold px-3 py-1.5 rounded-lg text-xs font-bold" data-index="${i}">
                Cargar
              </button>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}