export function renderAnalyticsView() {
  return `
    <div class="p-4 space-y-4 text-center">
      <h3 class="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center justify-center gap-2">
        <i data-lucide="bar-chart-3" class="w-4 h-4"></i> Métricas & Progreso
      </h3>
      <div class="bg-brand-gray p-6 rounded-xl border border-gray-800 space-y-3">
        <p class="text-xs text-gray-300">Módulo de analíticas listo para vinculación con Supabase Analytics.</p>
        <div class="text-3xl font-bold text-brand-gold">100%</div>
        <p class="text-[10px] text-gray-400">Rendimiento de app a costo $0</p>
      </div>
    </div>
  `;
}