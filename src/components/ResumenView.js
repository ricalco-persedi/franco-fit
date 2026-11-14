/**
 * Componente para el Módulo: RESUMEN DE DATOS CARGADOS (Auditoría Detallada)
 * Muestra explícitamente el desglose SEMANA POR SEMANA y DÍA POR DÍA.
 */
export function renderResumenView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para revisar su resumen de datos.</p>
        </div>`;
    }

    const antropo = student.datosAntropometricos || {};
    const hasAntropo = !!(antropo.peso || antropo.altura || antropo.grasa);
    const hasLesiones = !!(student.historialLesiones && student.historialLesiones.trim());
    const hasEvaluacion = !!(student.evaluacionInicial && student.evaluacionInicial.trim());
    const hasPersonalData = !!(student.lastname || student.firstname || student.dni);

    const macro = student.macrociclo || {};
    const hasMacroFase = !!(macro.fase && macro.fase !== 'Adaptación');
    const hasMacroObj = !!(macro.objetivo && macro.objetivo.trim());

    const meso = student.mesociclo || {};
    const totalWeeksCount = parseInt(student.totalWeeks || meso.numeroSemanas) || 4;
    const hasMesoEnfoque = !!(meso.enfoque && meso.enfoque.trim());
    const routine = student.routine || {};
    const microByWeekObj = student.microcicloByWeek || {};

    // 🟢 CONSTRUCCIÓN ESTRUCTURADA SEMANA POR SEMANA
    const weeksAuditHTML = [];

    for (let w = 1; w <= totalWeeksCount; w++) {
        const wMicro = microByWeekObj[w] || null;
        const weekRoutine = routine[w] || {};

        const isMicroConfigured = !!(wMicro && Array.isArray(wMicro.diasAsignados) && wMicro.diasAsignados.length > 0);
        const diasAsignadosNombres = isMicroConfigured ? wMicro.diasAsignados : [];

        // Evaluar días y ejercicios cargados para esta semana
        const daysAuditHTML = [];
        let totalExercisesInWeek = 0;

        if (isMicroConfigured) {
            diasAsignadosNombres.forEach((diaNombre, idx) => {
                const dayNum = idx + 1;
                const exList = weekRoutine[dayNum] || [];
                const exCount = exList.length;
                totalExercisesInWeek += exCount;

                if (exCount > 0) {
                    const exNamesPreview = exList.map(e => e.name || 'Ejercicio').join(', ');
                    daysAuditHTML.push(`
                    <div class="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30 flex justify-between items-start gap-2">
                        <div class="min-w-0">
                            <strong class="text-xs text-sky-300 font-bold block">Día ${dayNum} - ${diaNombre}</strong>
                            <span class="text-[10px] text-slate-300 leading-tight block">${exCount} ejercicios: <em class="text-slate-400 font-normal">${exNamesPreview}</em></span>
                        </div>
                        <span class="text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-500/40 shrink-0 uppercase">
                            ${exCount} Ej.
                        </span>
                    </div>`);
                } else {
                    daysAuditHTML.push(`
                    <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center gap-2">
                        <div>
                            <strong class="text-xs text-slate-400 font-bold block">Día ${dayNum} - ${diaNombre}</strong>
                            <span class="text-[10px] text-slate-500 italic block">Sin ejercicios asignados</span>
                        </div>
                        <span class="text-[9px] bg-slate-800 text-slate-500 font-bold px-2 py-0.5 rounded-full border border-slate-700 shrink-0 uppercase">
                            Pendiente
                        </span>
                    </div>`);
                }
            });
        }

        // Estado general de la semana
        let weekBadge = '';
        if (isMicroConfigured && totalExercisesInWeek > 0) {
            weekBadge = `<span class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">🟢 Cargada (${totalExercisesInWeek} Ej.)</span>`;
        } else if (isMicroConfigured) {
            weekBadge = `<span class="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase">🟡 Días Asignados (Sin Ejercicios)</span>`;
        } else {
            weekBadge = `<span class="bg-slate-800 text-slate-500 border border-slate-700 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">⚪ Sin Configurar</span>`;
        }

        weeksAuditHTML.push(`
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <div class="flex items-center gap-2">
                    <i data-feather="calendar" class="w-4 h-4 text-amber-400"></i>
                    <strong class="text-xs font-black text-amber-400 uppercase">Semana ${w}</strong>
                </div>
                ${weekBadge}
            </div>

            ${isMicroConfigured ? `
            <div class="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                <span class="text-slate-400 font-bold">Microciclo:</span>
                <strong class="text-amber-300 font-bold">${wMicro.tipoMicrociclo || 'Carga'}</strong>
                • Días: <strong class="text-sky-300 font-bold">${diasAsignadosNombres.join(', ')}</strong>
            </div>
            <div class="space-y-1.5 pt-1">
                ${daysAuditHTML.join('')}
            </div>` : `
            <p class="text-[11px] text-slate-500 italic p-2 bg-slate-950/40 rounded-xl border border-slate-800/50">
                Esta semana no ha sido configurada en el módulo Microciclo.
            </p>`}
        </div>`);
    }

    function renderCheckItem(label, isCompleted, detailsHTML = '') {
        return `
        <div class="flex items-start justify-between gap-2 p-2.5 rounded-xl border ${isCompleted ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-950/60 border-slate-800/80'}">
            <div class="flex items-start gap-2 min-w-0">
                <span class="text-xs font-black shrink-0 mt-0.5 ${isCompleted ? 'text-emerald-400' : 'text-slate-600'}">
                    ${isCompleted ? '☑️' : '⏹️'}
                </span>
                <div class="min-w-0 leading-tight space-y-1">
                    <span class="text-xs font-bold ${isCompleted ? 'text-slate-200' : 'text-slate-400'} block truncate">${label}</span>
                    ${detailsHTML ? `<div class="text-[10px] ${isCompleted ? 'text-emerald-300/90' : 'text-slate-500'} font-medium space-y-0.5 leading-snug">${detailsHTML}</div>` : ''}
                </div>
            </div>
            <span class="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase shrink-0 ${isCompleted ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800/80 text-slate-500 border-slate-700'}">
                ${isCompleted ? 'Cargado' : 'Pendiente'}
            </span>
        </div>`;
    }

    return `
    <div class="space-y-4">
        <!-- HEADER -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2 min-w-0">
                <i data-feather="check-square" class="w-5 h-5 text-amber-400 shrink-0"></i>
                <div class="min-w-0">
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider truncate">Resumen & Auditoría de Carga</h2>
                    <span class="text-[10px] text-slate-300 font-bold block truncate">
                        Estado de <strong class="text-sky-300">${student.firstname || ''} ${student.lastname || ''}</strong>
                    </span>
                </div>
            </div>
            <span class="text-[10px] bg-sky-500/20 text-sky-300 font-black px-2.5 py-1 rounded-full border border-sky-500/30 uppercase shrink-0">
                Checklist
            </span>
        </div>

        <!-- 1. GENERAL -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="user" class="w-4 h-4 text-amber-400"></i> Ficha & Planificación General
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Ficha Técnica', hasPersonalData, hasPersonalData ? `${student.lastname}, ${student.firstname} (DNI: ${student.dni || 'Sin DNI'})` : 'Sin datos')}
                ${renderCheckItem('Macrociclo', hasMacroFase, `Fase: ${macro.fase || 'Adaptación'} | Objetivo: ${macro.objetivo || 'Sin redactar'}`)}
                ${renderCheckItem('Mesociclo', totalWeeksCount > 0, `Duración total: ${totalWeeksCount} Semanas | Enfoque: ${meso.enfoque || 'Sin redactar'}`)}
            </div>
        </section>

        <!-- 2. AUDITORÍA DETALLADA SEMANA POR SEMANA -->
        <section class="space-y-3">
            <h3 class="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <i data-feather="layers" class="w-4 h-4 text-emerald-400"></i> Desglose Detallado por Semanas y Días
            </h3>
            ${weeksAuditHTML.join('')}
        </section>
    </div>`;
}