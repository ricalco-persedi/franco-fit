import { createExerciseCardHTML } from './ExerciseCard.js';

/**
 * PWA Exclusiva en modo lectura para el Alumno
 */
export function renderStudentPwaView(student = {}, activeWeekParam = 1, activeDayParam = 1) {
    if (!student || !student.id) {
        return `
        <div class="p-6 text-center text-slate-400 text-xs font-semibold">
            No se encontró información para este token de acceso.
        </div>`;
    }

    const visibility = student.visibilitySettings || {};
    const routine = student.routine || {};
    const totalWeeks = student.totalWeeks || student.mesociclo?.numeroSemanas || 4;
    const diasAsignados = student.microciclo?.diasAsignados || ['Lunes', 'Miércoles', 'Viernes'];

    // 1. FICHA PERSONAL FILTRADA POR VISIBILIDAD
    const antropo = student.datosAntropometricos || {};
    const hasAntropo = visibility.antropometria !== false && (antropo.peso || antropo.altura || antropo.grasa);
    const hasLesiones = visibility.lesiones !== false && student.historialLesiones;
    const hasEvaluacion = visibility.evaluacion !== false && student.evaluacionInicial;

    const fichaSectionHTML = (hasAntropo || hasLesiones || hasEvaluacion) ? `
    <section class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl space-y-3">
        <h3 class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <i data-feather="user" class="w-4 h-4 text-amber-400"></i> Mi Ficha Personal
        </h3>

        ${hasAntropo ? `
        <div class="grid grid-cols-3 gap-2 text-center text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <div><span class="text-[9px] text-slate-400 block uppercase">Peso</span><strong class="text-emerald-400 font-bold">${antropo.peso || '-'} kg</strong></div>
            <div><span class="text-[9px] text-slate-400 block uppercase">Altura</span><strong class="text-sky-400 font-bold">${antropo.altura || '-'} cm</strong></div>
            <div><span class="text-[9px] text-slate-400 block uppercase">Grasa</span><strong class="text-amber-400 font-bold">${antropo.grasa || '-'} %</strong></div>
        </div>` : ''}

        ${hasLesiones ? `
        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
            <span class="text-[10px] font-bold text-rose-400 uppercase block mb-1">Observaciones / Lesiones</span>
            <p class="text-slate-300 leading-snug">${student.historialLesiones}</p>
        </div>` : ''}

        ${hasEvaluacion ? `
        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
            <span class="text-[10px] font-bold text-amber-400 uppercase block mb-1">Evaluación Inicial</span>
            <p class="text-slate-300 leading-snug">${student.evaluacionInicial}</p>
        </div>` : ''}
    </section>` : '';

    // 2. DETERMINAR SEMANAS Y DÍAS PUBLICADOS
    const availableWeeks = [];
    for (let w = 1; w <= totalWeeks; w++) {
        if (visibility[`semana_${w}`] !== false) {
            availableWeeks.push(w);
        }
    }

    let currentWeek = activeWeekParam;
    if (availableWeeks.length > 0 && !availableWeeks.includes(currentWeek)) {
        currentWeek = availableWeeks;
    }

    let currentDay = activeDayParam;

    // Ejercicios filtrados estrictamente por visibilidad
    const rawExercises = (routine[currentWeek] && routine[currentWeek][currentDay]) || [];
    const visibleExercises = rawExercises.filter(ex => ex.visible !== false);

    let exercisesHTML = '';
    if (visibleExercises.length === 0) {
        exercisesHTML = `
        <div class="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-400 space-y-1">
            <i data-feather="calendar" class="w-8 h-8 text-amber-400 mx-auto mb-2"></i>
            <p class="text-xs font-semibold">Sin ejercicios programados o visibles para este día.</p>
        </div>`;
    } else {
        exercisesHTML = visibleExercises.map(ex => createExerciseCardHTML(ex, false)).join('');
    }

    return `
    <div class="space-y-4">
        <!-- HEADER PWA ALUMNO -->
        <header class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/40 shadow-2xl flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl overflow-hidden shadow border border-amber-400 bg-slate-950 flex items-center justify-center">
                    <img src="/imagenes/FC-MARCA.png" alt="FC" class="h-full w-full object-cover" onerror="this.onerror=null; this.src='/logo.png';">
                </div>
                <div>
                    <h1 class="text-xs font-black text-amber-400 uppercase tracking-wider">FC Training</h1>
                    <span class="text-sm font-bold text-white block">${student.firstname || ''} ${student.lastname || ''}</span>
                </div>
            </div>
            <span class="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/40 uppercase">
                🟢 Plan Activo
            </span>
        </header>

        <!-- SECCIÓN DE FICHA PERSONAL VISIBLE -->
        ${fichaSectionHTML}

        <!-- CRONOGRAMA DE RUTINA VISIBLE -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <i data-feather="activity" class="w-4 h-4 text-sky-400"></i> Mi Rutina de Entrenamiento
            </h3>

            <!-- SELECTOR DE SEMANAS PUBLICADAS -->
            <div class="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                ${availableWeeks.map(w => `
                    <button onclick="window.selectStudentPwaWeek(${w})" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition ${w === currentWeek ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-400 border border-slate-800'}">
                        Semana ${w}
                    </button>
                `).join('')}
            </div>

            <!-- SELECTOR DE DÍAS PUBLICADOS -->
            <div class="flex gap-1 overflow-x-auto pb-1 no-scrollbar pt-1">
                ${diasAsignados.map((diaNombre, idx) => {
                    const d = idx + 1;
                    const isDayVis = visibility[`semana_${currentWeek}_dia_${d}`] !== false;
                    if (!isDayVis) return '';
                    return `
                    <button onclick="window.selectStudentPwaDay(${d})" class="px-3 py-1 rounded-xl text-[11px] font-black transition ${d === currentDay ? 'bg-sky-500 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-400 border border-slate-800'}">
                        ${diaNombre}
                    </button>`;
                }).join('')}
            </div>
        </section>

        <!-- LISTADO DE EJERCICIOS VISIBLES -->
        <div id="student-pwa-exercise-list" class="space-y-3">
            ${exercisesHTML}
        </div>
    </div>`;
}