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

    const loadedWeeksList = [];
    for (let w = 1; w <= totalWeeksCount; w++) {
        const weekData = routine[w] || {};
        const hasExercisesInWeek = Object.values(weekData).some(dayList => Array.isArray(dayList) && dayList.length > 0);
        const microByW = (student.microcicloByWeek && student.microcicloByWeek[w]);
        if (hasExercisesInWeek || microByW) {
            loadedWeeksList.push(`Semana ${w}`);
        }
    }
    const hasWeeksLoaded = loadedWeeksList.length > 0;

    const microByWeekObj = student.microcicloByWeek || {};
    const microWeekDetails = [];

    for (let w = 1; w <= totalWeeksCount; w++) {
        const wMicro = microByWeekObj[w] || (w === 1 ? student.microciclo : null);
        if (wMicro && Array.isArray(wMicro.diasAsignados) && wMicro.diasAsignados.length > 0) {
            microWeekDetails.push(`• <strong>Semana ${w}:</strong> ${wMicro.diasAsignados.join(', ')} (${wMicro.tipoMicrociclo || 'Carga'})`);
        }
    }
    const hasMicroDetails = microWeekDetails.length > 0;

    const exerciseDetailsByDay = [];
    let grandTotalExercises = 0;

    Object.keys(routine).sort((a,b) => Number(a) - Number(b)).forEach(wNum => {
        const weekObj = routine[wNum] || {};
        const wMicro = microByWeekObj[wNum] || student.microciclo || {};
        const diasNombres = wMicro.diasAsignados || ['Día 1', 'Día 2', 'Día 3'];

        Object.keys(weekObj).sort((a,b) => Number(a) - Number(b)).forEach(dNum => {
            const exList = weekObj[dNum];
            if (Array.isArray(exList) && exList.length > 0) {
                grandTotalExercises += exList.length;
                const diaNombre = diasNombres[Number(dNum) - 1] || `Día ${dNum}`;
                const namesPreview = exList.map(e => e.name || 'Ejercicio').join(', ');
                exerciseDetailsByDay.push(`• <strong>Semana ${wNum} - Día ${dNum} (${diaNombre}):</strong> ${exList.length} ejercicios (${namesPreview})`);
            }
        });
    });

    const hasExercisesLoaded = grandTotalExercises > 0;

    const allExercisesList = Object.values(routine).flatMap(w => Object.values(w).flat());
    const hasSeriesConfig = allExercisesList.some(ex => ex.series || ex.tipoSerie || ex.setRest);
    const hasRepsConfig = allExercisesList.some(ex => ex.repeticiones || ex.repsRange || (ex.rpe && ex.rpe !== '-'));
    const hasCargaConfig = allExercisesList.some(ex => ex.cargaKg || ex.porcentajeRM);

    const nutrition = student.nutrition || {};
    const hasDiet = !!(nutrition.diet && nutrition.diet.trim());
    const hasSupplements = !!(nutrition.supplements && nutrition.supplements.trim());

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
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2 min-w-0">
                <i data-feather="check-square" class="w-5 h-5 text-amber-400 shrink-0"></i>
                <div class="min-w-0">
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider truncate">Resumen de Datos Cargados</h2>
                    <span class="text-[10px] text-slate-300 font-bold block truncate">
                        Auditoría de planificación de <strong class="text-sky-300">${student.firstname || ''} ${student.lastname || ''}</strong>
                    </span>
                </div>
            </div>
            <span class="text-[10px] bg-sky-500/20 text-sky-300 font-black px-2.5 py-1 rounded-full border border-sky-500/30 uppercase shrink-0">
                Checklist
            </span>
        </div>

        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="user" class="w-4 h-4 text-amber-400"></i> Módulo: Ficha Técnica
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Datos Personales', hasPersonalData, hasPersonalData ? `${student.lastname}, ${student.firstname} (DNI: ${student.dni || 'Sin DNI'})` : 'Sin datos personales')}
                ${renderCheckItem('Datos Antropométricos', hasAntropo, hasAntropo ? `Peso: ${antropo.peso || '-'} kg | Altura: ${antropo.altura || '-'} cm | Grasa: ${antropo.grasa || '-'}%` : 'Sin registros antropométricos')}
                ${renderCheckItem('Historial de Lesiones', hasLesiones, hasLesiones ? student.historialLesiones : 'Sin observaciones')}
                ${renderCheckItem('Evaluación Inicial', hasEvaluacion, hasEvaluacion ? student.evaluacionInicial : 'Sin evaluación inicial')}
            </div>
        </section>

        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-sky-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="target" class="w-4 h-4 text-sky-400"></i> Módulo: Macrociclo
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Fase Principal', hasMacroFase, `Fase actual: ${macro.fase || 'Adaptación'}`)}
                ${renderCheckItem('Objetivos Generales', hasMacroObj, hasMacroObj ? macro.objetivo : 'Sin objetivos redactados')}
            </div>
        </section>

        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="calendar" class="w-4 h-4 text-emerald-400"></i> Módulo: Mesociclo
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Semanas Planificadas Específicas', hasWeeksLoaded, hasWeeksLoaded ? `Semanas cargadas una por una: <strong>${loadedWeeksList.join(', ')}</strong> (de ${totalWeeksCount} semanas totales)` : 'Sin semanas configuradas aún')}
                ${renderCheckItem('Enfoque & Metas', hasMesoEnfoque, hasMesoEnfoque ? meso.enfoque : 'Sin enfoque redactado')}
            </div>
        </section>

        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="grid" class="w-4 h-4 text-amber-400"></i> Módulo: Microciclo (Días por Semana)
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Días de Entrenamiento por Semana', hasMicroDetails, hasMicroDetails ? microWeekDetails.join('<br>') : 'Sin días asignados por semana')}
            </div>
        </section>

        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-purple-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="film" class="w-4 h-4 text-purple-400"></i> Módulo: Ejercicios (Desglose por Día y Semana)
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Desglose Específico de Movimientos', hasExercisesLoaded, hasExercisesLoaded ? exerciseDetailsByDay.join('<br>') : 'Sin ejercicios asignados')}
                ${renderCheckItem('Series y Pausas', hasSeriesConfig, hasSeriesConfig ? 'Series y tiempos de descanso configurados' : 'Sin series configuradas')}
                ${renderCheckItem('Repeticiones, Tempo y RPE', hasRepsConfig, hasRepsConfig ? 'Rangos de reps, tempo y esfuerzo configurados' : 'Sin repeticiones configuradas')}
                ${renderCheckItem('Prescripción de Carga', hasCargaConfig, hasCargaConfig ? 'Cargas en Kg / %RM asignadas' : 'Sin cargas configuradas')}
            </div>
        </section>

        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="heart" class="w-4 h-4 text-teal-400"></i> Módulo: Nutrición
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Pautas Nutricionales', hasDiet, hasDiet ? nutrition.diet : 'Sin pautas cargadas')}
                ${renderCheckItem('Suplementación', hasSupplements, hasSupplements ? nutrition.supplements : 'Sin suplementación cargada')}
            </div>
        </section>
    </div>`;
}