export function renderAnalyticsView() {
    return `
    <div class="space-y-4">
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <i data-feather="trending-up" class="w-4 h-4"></i> Evolución de Rendimiento
            </h3>
            <div class="relative w-full h-56 bg-slate-950 rounded-xl p-2 border border-slate-800 flex items-center justify-center">
                <canvas id="analytics-chart" class="w-full h-full"></canvas>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
            <div class="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Racha de Entrenos</span>
                <strong class="text-xl font-black text-emerald-400">12 Días</strong>
            </div>
            <div class="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-center space-y-1">
                <span class="text-[10px] font-bold text-slate-400 uppercase block">Asistencia Global</span>
                <strong class="text-xl font-black text-amber-400">94%</strong>
            </div>
        </div>
    </div>`;
}