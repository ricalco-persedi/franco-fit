/**
 * Componente para el Módulo: RESUMEN DE DATOS CARGADOS (Checklist del Profesor)
 * Revisa entidad por entidad el estado de carga del alumno seleccionado.
 */
export function renderResumenView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para revisar su resumen de datos.</p>
        </div>`;
    }

    // 1. Evaluación de Ficha Técnica
    const antropo = student.datosAntropometricos || {};
    const hasAntropo = !!(antropo.peso || antropo.altura || antropo.grasa);
    const hasLesiones = !!(student.historialLesiones && student.historialLesiones.trim());
    const hasEvaluacion = !!(student.evaluacionInicial && student.evaluacionInicial.trim());
    const hasPersonalData = !!(student.lastname || student.firstname || student.dni);

    // 2. Evaluación de Macrociclo
    const macro = student.macrociclo || {};
    const hasMacroFase = !!(macro.fase && macro.fase !== 'Adaptación');
    const hasMacroObj = !!(macro.objetivo && macro.objetivo.trim());

    // 3. Evaluación de Mesociclo
    const meso = student.mesociclo || {};
    const hasMesoDuration = !!(student.totalWeeks || meso.numeroSemanas);
    const hasMesoEnfoque = !!(meso.enfoque && meso.enfoque.trim());

    // 4. Evaluación de Microciclo
    const micro = student.microciclo || {};
    const hasMicroDays = Array.isArray(micro.diasAsignados) && micro.diasAsignados.length > 0;
    const hasMicroTipo = !!(micro.tipoMicrociclo && micro.tipoMicrociclo !== 'Carga');
    const hasMicroObs = !!(micro.observaciones && micro.observaciones.trim());

    // 5. Evaluación de Rutina y Ejercicios
    const routine = student.routine || {};
    let totalExercisesCount = 0;
    let weeksWithExercisesCount = 0;

    Object.keys(routine).forEach(week => {
        let weekHasEx = false;
        Object.keys(routine[week]).forEach(day => {
            const list = routine[week][day];
            if (Array.isArray(list) && list.length > 0) {
                totalExercisesCount += list.length;
                weekHasEx = true;
            }
        });
        if (weekHasEx) weeksWithExercisesCount++;
    });

    const hasExercises = totalExercisesCount > 0;

    // 6. Evaluación de Métricas de Ejercicio (Series, Reps, Carga)
    const allExercises = Object.values(routine).flatMap(w => Object.values(w).flat());
    const hasSeriesConfig = allExercises.some(ex => ex.series || ex.tipoSerie || ex.setRest);
    const hasRepsConfig = allExercises.some(ex => ex.repeticiones || ex.repsRange || (ex.rpe && ex.rpe !== '-'));
    const hasCargaConfig = allExercises.some(ex => ex.cargaKg || ex.porcentajeRM);

    // 7. Evaluación de Nutrición
    const nutrition = student.nutrition || {};
    const hasDiet = !!(nutrition.diet && nutrition.diet.trim());
    const hasSupplements = !!(nutrition.supplements && nutrition.supplements.trim());

    // Función auxiliar para renderizar los ítems del Checklist
    function renderCheckItem(label, isCompleted, detailsText = '') {
        return `
        <div class="flex items-start justify-between gap-2 p-2 rounded-xl border ${isCompleted ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-950/60 border-slate-800/80'}">
            <div class="flex items-start gap-2 min-w-0">
                <span class="text-xs font-black shrink-0 mt-0.5 ${isCompleted ? 'text-emerald-400' : 'text-slate-600'}">
                    ${isCompleted ? '☑️' : '⏹️'}
                </span>
                <div class="min-w-0 leading-tight">
                    <span class="text-xs font-bold ${isCompleted ? 'text-slate-200' : 'text-slate-400'} block truncate">${label}</span>
                    ${detailsText ? `<span class="text-[10px] ${isCompleted ? 'text-emerald-300 font-semibold' : 'text-slate-500'} italic block leading-snug">${detailsText}</span>` : ''}
                </div>
            </div>
            <span class="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase shrink-0 ${isCompleted ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-slate-800/80 text-slate-500 border-slate-700'}">
                ${isCompleted ? 'Cargado' : 'Pendiente'}
            </span>
        </div>`;
    }

    return `
    <div class="space-y-4">
        <!-- HEADER DEL MÓDULO -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2 min-w-0">
                <i data-feather="check-square" class="w-5 h-5 text-amber-400 shrink-0"></i>
                <div class="min-w-0">
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider truncate">Resumen de Datos Cargados</h2>
                    <span class="text-[10px] text-slate-300 font-bold block truncate">
                        Estado de la planificación de <strong class="text-sky-300">${student.firstname || ''} ${student.lastname || ''}</strong>
                    </span>
                </div>
            </div>
            <span class="text-[10px] bg-sky-500/20 text-sky-300 font-black px-2.5 py-1 rounded-full border border-sky-500/30 uppercase shrink-0">
                Auditoría Interna
            </span>
        </div>

        <!-- 1. FICHA TÉCNICA Y EVALUACIÓN -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="user" class="w-4 h-4 text-amber-400"></i> Módulo: Ficha Técnica
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Datos Personales (Nombre, DNI, Nº Alumno)', hasPersonalData, hasPersonalData ? `${student.lastname}, ${student.firstname} (DNI: ${student.dni || 'Sin DNI'})` : 'Sin datos personales')}
                ${renderCheckItem('Datos Antropométricos (Peso, Altura, % Grasa)', hasAntropo, hasAntropo ? `Peso: ${antropo.peso || '-'} kg | Altura: ${antropo.altura || '-'} cm | Grasa: ${antropo.grasa || '-'}%` : 'Sin registros antropométricos')}
                ${renderCheckItem('Historial de Lesiones y Observaciones', hasLesiones, hasLesiones ? student.historialLesiones : 'Sin observaciones registradas')}
                ${renderCheckItem('Evaluación Inicial y Diagnóstico', hasEvaluacion, hasEvaluacion ? student.evaluacionInicial : 'Sin evaluación inicial')}
            </div>
        </section>

        <!-- 2. MACROCICLO -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-sky-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="target" class="w-4 h-4 text-sky-400"></i> Módulo: Macrociclo
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Fase Principal del Macrociclo', hasMacroFase, `Fase: ${macro.fase || 'Adaptación'}`)}
                ${renderCheckItem('Objetivos Generales Redactados', hasMacroObj, hasMacroObj ? macro.objetivo : 'Sin objetivos generales redactados')}
            </div>
        </section>

        <!-- 3. MESOCICLO -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="calendar" class="w-4 h-4 text-emerald-400"></i> Módulo: Mesociclo
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Duración Total en Semanas', hasMesoDuration, `Duración: ${student.totalWeeks || meso.numeroSemanas || 4} Semanas`)}
                ${renderCheckItem('Enfoque & Metas del Mesociclo', hasMesoEnfoque, hasMesoEnfoque ? meso.enfoque : 'Sin enfoque redactado')}
            </div>
        </section>

        <!-- 4. MICROCICLO -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="grid" class="w-4 h-4 text-amber-400"></i> Módulo: Microciclo
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Días de Entrenamiento Asignados', hasMicroDays, hasMicroDays ? micro.diasAsignados.join(', ') : 'Sin días asignados')}
                ${renderCheckItem('Carácter / Tipo de Microciclo', hasMicroTipo, `Tipo: ${micro.tipoMicrociclo || 'Carga'}`)}
                ${renderCheckItem('Observaciones Tácticas del Microciclo', hasMicroObs, hasMicroObs ? micro.observaciones : 'Sin observaciones tácticas')}
            </div>
        </section>

        <!-- 5. EJERCICIOS Y RUTINA -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-purple-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="film" class="w-4 h-4 text-purple-400"></i> Módulo: Ejercicios y Rutina
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Movimientos y Ejercicios Diseñados', hasExercises, hasExercises ? `${totalExercisesCount} ejercicios cargados en ${weeksWithExercisesCount} semanas` : 'Sin ejercicios diseñados aún')}
                ${renderCheckItem('Configuración de Series y Pausas', hasSeriesConfig, hasSeriesConfig ? 'Series, tipos de series y tiempos de descanso asignados' : 'Sin series configuradas')}
                ${renderCheckItem('Prescripción de Repeticiones, Cadencia y RPE', hasRepsConfig, hasRepsConfig ? 'Rangos de repeticiones, tempo y esfuerzo cargados' : 'Sin repeticiones configuradas')}
                ${renderCheckItem('Prescripción de Carga y Sobrecarga Progresiva', hasCargaConfig, hasCargaConfig ? 'Cargas en Kg, %RM y estrategias de sobrecarga cargadas' : 'Sin cargas configuradas')}
            </div>
        </section>

        <!-- 6. NUTRICIÓN Y RECOMENDACIONES -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-teal-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="heart" class="w-4 h-4 text-teal-400"></i> Módulo: Nutrición y Suplementación
            </h3>
            <div class="space-y-2">
                ${renderCheckItem('Pautas Nutricionales & Dieta', hasDiet, hasDiet ? nutrition.diet : 'Sin pautas nutricionales cargadas')}
                ${renderCheckItem('Hidratación & Suplementación', hasSupplements, hasSupplements ? nutrition.supplements : 'Sin suplementación especificada')}
            </div>
        </section>
    </div>`;
}