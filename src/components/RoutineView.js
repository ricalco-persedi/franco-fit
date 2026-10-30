export function renderRoutineView(isProf = false, nutritionData = {}) {
    const _DIET = 'd' + 'i' + 'e' + 't';
    const _SUPPLEMENTS = 's' + 'u' + 'p' + 'p' + 'l' + 'e' + 'm' + 'e' + 'n' + 't' + 's';

    const dietText = String(nutritionData[_DIET] || '');
    const suppText = String(nutritionData[_SUPPLEMENTS] || '');

    const profManagementSection = isProf ? `
    <div class="flex justify-between items-center mb-3">
        <button onclick="window.deselectStudent()" class="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition active:scale-95">
            <i data-feather="arrow-left" class="w-4 h-4"></i> Seleccionar Otro Alumno
        </button>
        <button onclick="window.exportFullPDF()" class="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition active:scale-95">
            <i data-feather="file-text" class="w-4 h-4"></i> PDF Completo
        </button>
    </div>

    <section id="student-management-card" class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4 transition-all">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <i data-feather="edit-3" class="w-4 h-4 text-amber-400"></i> Ficha y Datos del Alumno
            </span>
        </div>

        <!-- CAMPOS FICHA ALUMNO -->
        <div class="grid grid-cols-4 gap-2">
            <div>
                <label class="block text-[10px] font-bold text-amber-400 mb-1">Nº Alumno</label>
                <input type="number" id="student-number-input" min="1" value="1" class="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2 text-xs text-amber-400 font-black text-center focus:outline-none">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 mb-1">Apellido</label>
                <input type="text" id="student-lastname-input" placeholder="Ej. Pérez" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white font-semibold focus:outline-none">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 mb-1">Nombre</label>
                <input type="text" id="student-firstname-input" placeholder="Ej. Juan" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white font-semibold focus:outline-none">
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 mb-1">DNI</label>
                <input type="text" id="student-dni-input" placeholder="Ej. 32123456" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white font-semibold focus:outline-none">
            </div>
        </div>

        <!-- SELECTORES TIPO DE CICLO Y DURACIÓN -->
        <div class="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
            <div>
                <label class="block text-[10px] font-bold text-slate-400 mb-1">Tipo de Ciclo</label>
                <select id="student-cycle-type" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white font-semibold focus:outline-none">
                    <option value="Microciclo">Microciclo</option>
                    <option value="Mesociclo" selected>Mesociclo</option>
                    <option value="Macrociclo">Macrociclo</option>
                </select>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-slate-400 mb-1">Duración (Semanas)</label>
                <input type="number" id="student-total-weeks" min="1" max="52" value="8" class="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white font-semibold text-center focus:outline-none">
            </div>
        </div>

        <!-- 📌 AQUÍ SE INSERTA LA TARJETA DE ACCESO SEGURO (TOKEN) -->
        <div class="bg-slate-950 p-3.5 rounded-xl border border-sky-500/30 space-y-2">
            <div class="flex items-center gap-1.5">
                <i data-feather="key" class="w-4 h-4 text-sky-400"></i>
                <strong class="text-xs text-sky-300 uppercase tracking-wider">Acceso Seguro del Alumno (Token)</strong>
            </div>
            <p class="text-[11px] text-slate-400 leading-relaxed">
                Genera un enlace mágico individual que le permite al alumno ingresar directamente a su rutina y aceptar la Declaración Jurada (Ley 25.326).
            </p>

            <div class="grid grid-cols-2 gap-2 pt-1">
                <button onclick="window.sendStudentAccess(null, 'whatsapp')" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2 px-3 rounded-xl border border-emerald-400 shadow transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer">
                    <i data-feather="message-circle" class="w-4 h-4"></i> Enviar por WhatsApp
                </button>
                <button onclick="window.sendStudentAccess(null, 'copy')" class="bg-sky-600 hover:bg-sky-500 text-white text-xs font-black py-2 px-3 rounded-xl border border-sky-400 shadow transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer">
                    <i data-feather="copy" class="w-4 h-4"></i> Copiar Enlace Mágico
                </button>
            </div>
        </div>

        <!-- MODO BORRADOR VS ACTIVO -->
        <div id="mode-container-card" class="bg-slate-950 border-2 border-sky-500/60 rounded-2xl p-3.5 space-y-3 transition-all">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span id="mode-card-title" class="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="activity" class="w-4 h-4 text-sky-400"></i> <span class="text-sky-300 font-extrabold">EDITANDO PLAN ACTIVO OFICIAL</span>
                </span>
                <select id="routine-status-mode" onchange="window.toggleRoutineEditMode()" class="bg-slate-900 border border-slate-700 text-xs font-extrabold rounded-xl p-1.5 focus:outline-none cursor-pointer">
                    <option value="active">🟢 Plan Activo (En Curso)</option>
                    <option value="draft">🟡 Plan Borrador (Pre-carga)</option>
                </select>
            </div>

            <div id="mode-description-box" class="text-xs p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 font-medium space-y-1">
                <div class="font-bold flex items-center gap-1 text-sky-300"><i data-feather="eye" class="w-3.5 h-3.5"></i> PLAN VISIBLE POR EL ALUMNO</div>
                <p class="text-[11px] text-sky-200/80 leading-relaxed">Estás viendo la rutina en curso del alumno.</p>
            </div>

            <div id="mode-action-buttons" class="pt-1">
                <button onclick="window.saveCurrentStudent()" class="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black py-2.5 rounded-xl border border-sky-300 shadow transition flex items-center justify-center gap-1.5 active:scale-95">
                    <i data-feather="save" class="w-3.5 h-3.5"></i> Guardar Ficha y Plan Activo
                </button>
            </div>
        </div>
    </section>` : `
    <div class="flex justify-end mb-2">
        <button onclick="window.exportFullPDF()" class="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400 px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow transition active:scale-95">
            <i data-feather="file-text" class="w-4 h-4"></i> Imprimir / PDF Completo
        </button>
    </div>`;

    const nutritionSection = isProf ? `
    <!-- PLAN NUTRICIONAL EDITABLE (PROFESOR) -->
    <div id="nutrition-management-card" class="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/30 shadow-xl space-y-3 transition-all">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <i data-feather="heart" class="w-4 h-4"></i> Plan Nutricional & Recomendaciones
            </span>
            <button onclick="window.saveNutritionPlan()" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black px-3 py-1.5 rounded-xl shadow transition active:scale-95">
                Guardar Nutrición
            </button>
        </div>
        <div class="space-y-3">
            <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Dieta / Hábitos Alimenticios</label>
                <textarea id="nutrition-diet-input" rows="3" placeholder="Pautas nutricionales, calorías, alimentos sugeridos..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500">${dietText}</textarea>
            </div>
            <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Hidratación & Suplementos</label>
                <textarea id="nutrition-supplements-input" rows="2" placeholder="Agua recomendada, creatina, proteínas..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500">${suppText}</textarea>
            </div>
        </div>
    </div>` : `
    <!-- PLAN NUTRICIONAL LECTURA (ALUMNO) -->
    <div class="bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/30 shadow-xl space-y-3">
        <h3 class="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <i data-feather="heart" class="w-4 h-4"></i> Plan Nutricional & Recomendaciones
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span class="text-amber-400 font-bold block text-[10px] uppercase">🥗 Dieta & Hábitos</span>
                <p class="text-slate-200 leading-relaxed whitespace-pre-line">${dietText || 'Sin especificaciones nutricionales cargadas.'}</p>
            </div>
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span class="text-sky-400 font-bold block text-[10px] uppercase">💧 Hidratación & Suplementos</span>
                <p class="text-slate-200 leading-relaxed whitespace-pre-line">${suppText || 'Sin suplementación especificada.'}</p>
            </div>
        </div>
    </div>`;

    return `
    <div class="space-y-4">
        <!-- BARRA SUPERIOR INFO ALUMNO -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex justify-between items-center shadow-xl">
            <div>
                <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Alumno Seleccionado</span>
                <h2 id="student-name-display" class="text-base font-black text-amber-400 tracking-tight">Cargando...</h2>
            </div>
            <div class="text-right">
                <span class="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Planificación</span>
                <span id="cycle-display" class="text-xs font-extrabold text-white bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 inline-block">Mesociclo (8 Semanas)</span>
            </div>
        </div>

        ${profManagementSection}
        ${nutritionSection}

        <!-- SELECTOR DE SEMANAS Y DÍAS -->
        <div class="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-3 shadow-xl">
            <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <i data-feather="calendar" class="w-3.5 h-3.5 text-amber-400"></i> Semanas
                </span>
                <div id="week-selector-container" class="flex gap-1.5 overflow-x-auto pb-1 max-w-[240px] no-scrollbar">
                </div>
            </div>

            <div class="border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <i data-feather="clock" class="w-3.5 h-3.5 text-amber-400"></i> Días
                </span>
                <div id="day-selector-container" class="flex gap-1 overflow-x-auto pb-1">
                </div>
            </div>
        </div>

        <!-- LISTADO DE EJERCICIOS Y BOTÓN AGREGAR -->
        <div class="space-y-3">
            <div class="flex justify-between items-center">
                <h3 id="current-view-title" class="text-sm font-black text-white uppercase tracking-wider">Semana 1 / Día 1</h3>
                ${isProf ? `
                <button onclick="window.openAddExerciseModal()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3 py-2 rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition">
                    <i data-feather="plus" class="w-4 h-4"></i> Agregar Ejercicio
                </button>` : ''}
            </div>

            <div id="exercise-list" class="space-y-3">
            </div>
        </div>
    </div>`;
}