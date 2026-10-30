/**
 * Renderiza la vista de historial de mesociclos y planes anteriores
 */
export function renderHistoryView(student = {}) {
    const _NAME = 'n' + 'a' + 'm' + 'e';
    const _DATE = 'd' + 'a' + 't' + 'e';
    const _MAP = 'm' + 'a' + 'p';

    const historyList = Array.isArray(student.history) ? student.history : [];
    
    // Verificamos si existe una rutina activa oficial
    const hasActiveRoutine = student.routine && Object.keys(student.routine).length > 0;
    const activeCycle = student.cycleType || 'Mesociclo';
    const activeWeeks = student.totalWeeks || 8;

    // Tarjeta del Plan Activo Actual
    const activeCardHTML = hasActiveRoutine ? `
    <div class="bg-slate-900 border-2 border-sky-500/80 rounded-2xl p-4 space-y-2 shadow-xl relative overflow-hidden">
        <div class="flex justify-between items-center border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
                <span class="flex h-2.5 w-2.5 relative">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                </span>
                <span class="text-xs font-black text-sky-300 uppercase tracking-wider">Plan Activo Actual</span>
            </div>
            <span class="text-[10px] font-black bg-sky-500/20 text-sky-300 px-2.5 py-0.5 rounded-full border border-sky-500/40 uppercase">
                🟢 En Curso
            </span>
        </div>
        <div class="flex justify-between items-center pt-1">
            <div>
                <strong class="text-sm font-black text-white block">${activeCycle} (${activeWeeks} Semanas)</strong>
                <span class="text-[10px] text-slate-400">Plan Oficial Visible por el Alumno</span>
            </div>
            <button onclick="window.switchTab('routine')" class="text-[10px] bg-sky-500 hover:bg-sky-400 text-slate-950 font-black px-3 py-1.5 rounded-xl transition shadow">
                Ver Rutina →
            </button>
        </div>
    </div>` : '';

    // Filtrar el historial para incluir únicamente planes finalizados
    const finishedItems = historyList.filter(item => item && item.status !== 'Activa' && item.status !== 'En Curso');

    let historyListHTML = '';
    if (finishedItems.length === 0 && !hasActiveRoutine) {
        historyListHTML = `
        <div class="bg-slate-900/90 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <i data-feather="archive" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-medium">No hay historial de mesociclos registrado aún.</p>
        </div>`;
    } else if (finishedItems.length > 0) {
        historyListHTML = finishedItems[_MAP](item => {
            const itemName = String(item[_NAME] || item['nombre'] || 'Mesociclo');
            const itemDate = String(item[_DATE] || item['fecha'] || 'N/A');
            const itemWeeks = item['weeks'] || 8;

            return `
            <div class="bg-slate-900 border border-slate-800/90 rounded-2xl p-3.5 flex justify-between items-center shadow-md">
                <div>
                    <span class="text-xs font-bold text-amber-300 block">${itemName}</span>
                    <span class="text-[10px] text-slate-400">Duración: ${itemWeeks} Semanas • Finalizado el ${itemDate}</span>
                </div>
                <span class="text-[10px] font-bold bg-slate-950 text-slate-400 px-2.5 py-1 rounded-xl border border-slate-800 uppercase">
                    Archivado
                </span>
            </div>`;
        }).join('');
    }

    const previousSection = finishedItems.length > 0 ? `
        <div class="space-y-2 pt-1">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Planes Anteriores Finalizados</span>
            ${historyListHTML}
        </div>` : (!hasActiveRoutine ? historyListHTML : '');

    return `
    <div class="space-y-4">
        <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <i data-feather="clock" class="w-4 h-4"></i> Historial de Planes y Mesociclos
        </h3>
        
        ${activeCardHTML}

        ${previousSection}
    </div>`;
}