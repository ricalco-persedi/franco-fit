/**
 * Componente para renderizar la Ficha y Datos Relacionales del Alumno (Entidad 'ficha')
 */
export function renderFichaView(student = {}) {
    if (!student || !student.id) {
        return `
        <div class="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 text-center text-slate-400 space-y-2">
            <i data-feather="user-x" class="w-8 h-8 text-amber-400 mx-auto"></i>
            <p class="text-xs font-semibold">Selecciona un alumno para editar su ficha.</p>
        </div>`;
    }

    // Extracción de datos o valores por defecto
    const studentNumber = student.studentNumber || 1;
    const firstname = student.firstname || '';
    const lastname = student.lastname || '';
    const dni = student.dni || '';

    const antropo = student.datosAntropometricos || { peso: '', altura: '', grasa: '' };
    const lesiones = student.historialLesiones || '';
    const evaluacion = student.evaluacionInicial || '';
    const visibility = student.visibilitySettings || {};

    // Estado de los switches de visibilidad (true por defecto si no está definido)
    const visAntropo = visibility.antropometria !== false;
    const visLesiones = visibility.lesiones !== false;
    const visEvaluacion = visibility.evaluacion !== false;

    return `
    <div class="space-y-4">
        <!-- TITULAR DE LA ENTIDAD -->
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl flex justify-between items-center">
            <div class="flex items-center gap-2">
                <i data-feather="user" class="w-5 h-5 text-amber-400"></i>
                <div>
                    <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider">Ficha Técnica y Evaluación</h2>
                    <span class="text-[10px] text-slate-400">Datos personales, antropometría y visibilidad</span>
                </div>
            </div>
            <button onclick="window.saveFichaStudent()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer">
                <i data-feather="save" class="w-3.5 h-3.5"></i> Guardar Ficha
            </button>
        </div>

        <!-- SECCIÓN 1: DATOS PERSONALES -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <i data-feather="credit-card" class="w-4 h-4 text-sky-400"></i> Datos Personales
            </h3>
            
            <div class="grid grid-cols-4 gap-2">
                <div>
                    <label class="block text-[10px] font-bold text-amber-400 mb-1">Nº Alumno</label>
                    <input type="number" id="ficha-student-number" min="1" value="${studentNumber}" class="w-full bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 text-xs text-amber-400 font-black text-center focus:outline-none">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">Apellido</label>
                    <input type="text" id="ficha-lastname" value="${lastname}" placeholder="Apellido" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-500">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">Nombre</label>
                    <input type="text" id="ficha-firstname" value="${firstname}" placeholder="Nombre" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-500">
                </div>
                <div>
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">DNI</label>
                    <input type="text" id="ficha-dni" value="${dni}" placeholder="DNI" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-500">
                </div>
            </div>
        </section>

        <!-- SECCIÓN 2: DATOS ANTROPOMÉTRICOS + VISIBILIDAD -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="activity" class="w-4 h-4 text-emerald-400"></i> Datos Antropométricos
                </h3>
                
                <!-- CASILLA DE VISIBILIDAD PARA EL ALUMNO -->
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visAntropo ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-antropo" ${visAntropo ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visAntropo ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>

            <div class="grid grid-cols-3 gap-3">
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">Peso (kg)</label>
                    <input type="number" step="0.1" id="ficha-peso" value="${antropo.peso || ''}" placeholder="Ej: 75.5" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-emerald-400 font-bold text-center focus:outline-none">
                </div>
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">Altura (cm)</label>
                    <input type="number" id="ficha-altura" value="${antropo.altura || ''}" placeholder="Ej: 178" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-sky-400 font-bold text-center focus:outline-none">
                </div>
                <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <label class="block text-[10px] font-bold text-slate-400 mb-1">% Grasa Estimado</label>
                    <input type="number" step="0.1" id="ficha-grasa" value="${antropo.grasa || ''}" placeholder="Ej: 15.0" class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-amber-400 font-bold text-center focus:outline-none">
                </div>
            </div>
        </section>

        <!-- SECCIÓN 3: HISTORIAL DE LESIONES + VISIBILIDAD -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="alert-triangle" class="w-4 h-4 text-rose-400"></i> Historial de Lesiones y Molestias
                </h3>
                
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visLesiones ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-lesiones" ${visLesiones ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visLesiones ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>

            <div>
                <textarea id="ficha-lesiones" rows="3" placeholder="Molestias articulares, intervenciones previas, precauciones..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed">${lesiones}</textarea>
            </div>
        </section>

        <!-- SECCIÓN 4: EVALUACIÓN INICIAL + VISIBILIDAD -->
        <section class="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <i data-feather="clipboard" class="w-4 h-4 text-amber-400"></i> Evaluación Inicial & Diagnóstico
                </h3>
                
                <label class="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer select-none ${visEvaluacion ? 'text-amber-400' : 'text-slate-500'}">
                    <input type="checkbox" id="vis-evaluacion" ${visEvaluacion ? 'checked' : ''} class="w-3.5 h-3.5 accent-amber-500 rounded">
                    <span>${visEvaluacion ? '👁️ Visible al Alumno' : '🔒 Oculto'}</span>
                </label>
            </div>

            <div>
                <textarea id="ficha-evaluacion" rows="3" placeholder="Nivel de fuerza inicial, movilidad, acortamientos, observaciones del profesor..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed">${evaluacion}</textarea>
            </div>
        </section>

        <!-- BOTÓN INFERIOR DE GUARDADO -->
        <button onclick="window.saveFichaStudent()" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3 rounded-2xl shadow-2xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
            <i data-feather="check-circle" class="w-4 h-4"></i> Guardar Ficha y Visibilidad
        </button>
    </div>`;
}