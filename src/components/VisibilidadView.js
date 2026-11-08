/**
 * Componente que renderiza la Planilla General de Gestión, Visibilidad y Vista Previa del Alumno
 */
export function renderVisibilidadView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para gestionar su visibilidad.</p>
        </div>`;
    }

    const totalWeeks = student.totalWeeks || student.mesociclo?.numeroSemanas || 4;
    const routine = student.routine || {};
    const visibility = student.visibilitySettings || {};
    const diasAsignados = student.microciclo?.diasAsignados || ['Lunes', 'Miércoles', 'Viernes'];

    // ==========================================
    // 🔍 1. CÁLCULO DE LA VISTA PREVIA DEL ALUMNO
    // ==========================================
    const visAntropo = visibility.antropometria !== false;
    const visLesiones = visibility.lesiones !== false;
    const visEvaluacion = visibility.evaluacion !== false;
    const visMacro = visibility.macrociclo !== false;
    const visObjetivos = visibility.objetivos !== false;
    const visMeso = visibility.mesociclo !== false;
    const visEnfoqueMeso = visibility.enfoqueMesociclo !== false;
    const visMicro = visibility.microciclo !== false;
    const visDiasSemana = visibility.diasSemana !== false;

    // Conteo de semanas, días y ejercicios visibles en tiempo real
    let visibleWeeksCount = 0;
    let visibleDaysCount = 0;
    let visibleExercisesCount = 0;
    const visibleWeeksDetails = [];

    for (let w = 1; w <= totalWeeks; w++) {
        const isWeekVisible = visibility[`semana_${w}`] !== false;
        if (isWeekVisible) {
            visibleWeeksCount++;
            const daysVisibleInWeek = [];

            diasAsignados.forEach((diaNombre, idx) => {
                const d = idx + 1;
                const isDayVisible = visibility[`semana_${w}_dia_${d}`] !== false;
                if (isDayVisible) {
                    visibleDaysCount++;
                    const exercises = (routine[w] && routine[w][d]) || [];
                    const visibleExInDay = exercises.filter(ex => ex.visible !== false);
                    visibleExercisesCount += visibleExInDay.length;
                    daysVisibleInWeek.push(`${diaNombre} (${visibleExInDay.length} ej.)`);
                }
            });

            visibleWeeksDetails.push({
                week: w,
                daysText: daysVisibleInWeek.length > 0 ? daysVisibleInWeek.join(', ') : 'Sin días visibles'
            });
        }
    }

    // ==========================================
    // 📊 2. RENDERIZADO DE LA MATRIZ DE PUBLICACIÓN
    // ==========================================
    let matrixHTML = '';
    for (let w = 1; w <= totalWeeks; w++) {
        let daysHTML = '';
        const isWeekVisible = visibility[`semana_${w}`] !== false;

        diasAsignados.forEach((diaNombre, idx) => {
            const d = idx + 1;
            const exercises = (routine[w] && routine[w][d]) || [];
            const hasEx = exercises.length > 0;
            const isDayVisible = visibility[`semana_${w}_dia_${d}`] !== false;
            const visExCount = exercises.filter(ex => ex.visible !== false).length;

            daysHTML += `
            <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0 ${isDayVisible ? (hasEx ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400') : 'bg-slate-700'}"></span>
                    <div class="truncate">
                        <strong class="text-xs text-white block truncate">Día ${d} (${diaNombre})</strong>
                        <span class="text-[9px] ${hasEx ? 'text-amber-400 font-bold' : 'text-slate-500'}">
                            ${hasEx ? `${exercises.length} ej. (${visExCount} visibles)` : 'Sin ejercicios'}
                        </span>
                    </div>
                </div>

                <button onclick="window.toggleDayVisibilityDirect(${w}, ${d})" 
                    class="px-2.5 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 shrink-0 ${isDayVisible ? 'bg-amber-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
                    ${isDayVisible ? '👁️ Publicado' : '🔒 Oculto'}
                </button>
            </div>`;
        });

        matrixHTML += `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 shadow-lg">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <div class="flex items-center gap-2">
                    <i data-feather="calendar" class="w-4 h-4 text-sky-400"></i>
                    <strong class="text-xs text-sky-300 font-black uppercase">Semana ${w}</strong>
                </div>

                <button onclick="window.toggleWeekVisibilityDirect(${w})" 
                    class="px-2.5 py-1 rounded-lg text-[10px] font-black transition flex items-center gap-1 ${isWeekVisible ? 'bg-sky-500 text-slate-950 shadow' : 'bg-slate-800 text-slate-400 border border-slate-700'}">
                    ${isWeekVisible ? '👁️ Toda la Semana Visible' : '🔒 Semana Oculta'}
                </button>
            </div>

            <div class="grid grid-cols-1 gap-2">
                ${daysHTML}
            </div>
        </div>`;
    }

    return `
    <div class="space-y-4">
        <!-- HEADER DE LA ENTIDAD -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2">
                <i data-feather="eye" class="w-5 h-5 text-amber-400"></i>
                <div>
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider">Planilla de Gestión & Visibilidad</h2>
                    <span class="text-[10px] text-slate-400">Control de publicación, vista previa y exportación</span>
                </div>
            </div>
        </div>

        <!-- 👁️ VISTA PREVIA INTERACTIVA: ¿QUÉ VERÁ EL ALUMNO EN SU PWA? -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/40 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="smartphone" class="w-4 h-4 text-emerald-400"></i> Vista Previa: ¿Qué verá el Alumno?
                </h3>
                <span class="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                    Resumen en Tiempo Real
                </span>
            </div>

            <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-[9px] font-bold text-slate-400 uppercase block">Semanas Visibles</span>
                    <strong class="text-sm font-black text-sky-400">${visibleWeeksCount} / ${totalWeeks}</strong>
                </div>
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-[9px] font-bold text-slate-400 uppercase block">Días Visibles</span>
                    <strong class="text-sm font-black text-amber-400">${visibleDaysCount} días</strong>
                </div>
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span class="text-[9px] font-bold text-slate-400 uppercase block">Ejercicios Visibles</span>
                    <strong class="text-sm font-black text-emerald-400">${visibleExercisesCount} ej.</strong>
                </div>
            </div>

            <!-- DETALLE DE SECCIONES ACCESIBLES EN LA FICHA -->
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                <strong class="text-slate-300 font-bold block border-b border-slate-800/80 pb-1">
                    📋 Secciones de la Ficha visibles:
                </strong>
                <div class="flex flex-wrap gap-1.5">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${visAntropo ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-500 line-through'}">
                        ${visAntropo ? '👁️ Antropometría' : '🔒 Antropometría'}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${visLesiones ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-500 line-through'}">
                        ${visLesiones ? '👁️ Historial Lesiones' : '🔒 Historial Lesiones'}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${visEvaluacion ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-900 text-slate-500 line-through'}">
                        ${visEvaluacion ? '👁️ Evaluación Inicial' : '🔒 Evaluación Inicial'}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${visMacro ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-500 line-through'}">
                        ${visMacro ? '👁️ Fase Macrociclo' : '🔒 Fase Macrociclo'}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${visObjetivos ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-900 text-slate-500 line-through'}">
                        ${visObjetivos ? '👁️ Objetivos Generales' : '🔒 Objetivos Generales'}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${visMeso ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-900 text-slate-500 line-through'}">
                        ${visMeso ? '👁️ Duración Mesociclo' : '🔒 Duración Mesociclo'}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${visEnfoqueMeso ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-900 text-slate-500 line-through'}">
                        ${visEnfoqueMeso ? '👁️ Enfoque Mesociclo' : '🔒 Enfoque Mesociclo'}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${visMicro ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-900 text-slate-500 line-through'}">
                        ${visMicro ? '👁️ Carácter Microciclo' : '🔒 Carácter Microciclo'}
                    </span>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${visDiasSemana ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-900 text-slate-500 line-through'}">
                        ${visDiasSemana ? '👁️ Días Asignados' : '🔒 Días Asignados'}
                    </span>
                </div>
            </div>

            <!-- DESGLOSE DE SEMANAS Y DÍAS PUBLICADOS -->
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                <strong class="text-slate-300 font-bold block border-b border-slate-800/80 pb-1">
                    📅 Cronograma de Rutinas Habilitadas para el Alumno:
                </strong>
                ${visibleWeeksDetails.length > 0 ? visibleWeeksDetails.map(w => `
                    <div class="flex items-start gap-2 py-0.5">
                        <strong class="text-sky-300 shrink-0 font-bold">Semana ${w.week}:</strong>
                        <span class="text-slate-300 leading-snug">${w.daysText}</span>
                    </div>
                `).join('') : `<p class="text-slate-500 italic">No hay semanas publicadas actualmente. El alumno verá la pantalla vacía.</p>`}
            </div>
        </section>

        <!-- 📲 BOTONES DE ACCESO Y EXPORTACIÓN AL ALUMNO (TOKEN & PDF) -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-sky-500/40 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-black text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="send" class="w-4 h-4 text-sky-400"></i> Acceso y Exportación del Alumno
                </h3>
                <span class="text-[9px] bg-sky-500/20 text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/30 uppercase">
                    Acceso Seguro
                </span>
            </div>

            <p class="text-[11px] text-slate-300 leading-relaxed">
                Copia el Enlace Mágico individual para enviárselo al alumno por mensaje o descarga la planificación unificada en formato PDF.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button onclick="window.sendStudentAccess('copy')" class="bg-sky-600 hover:bg-sky-500 text-white text-xs font-black py-2.5 px-3 rounded-xl border border-sky-400 shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer">
                    <i data-feather="copy" class="w-4 h-4"></i> Copiar Token / Enlace
                </button>

                <button onclick="window.exportFullPDF()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 px-3 rounded-xl border border-amber-300 shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer">
                    <i data-feather="file-text" class="w-4 h-4"></i> PDF Completo
                </button>
            </div>
        </section>

        <!-- MATRIZ DE CONTROL DE PUBLICACIÓN POR SEMANAS Y DÍAS -->
        <div class="space-y-3">
            <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                <i data-feather="sliders" class="w-4 h-4"></i> Interruptores de Publicación (Semanas y Días)
            </h3>
            ${matrixHTML}
        </div>
    </div>`;
}