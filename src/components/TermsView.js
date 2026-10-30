/**
 * Renderiza la pantalla de Declaración Jurada y Protección de Datos (Ley 25.326)
 */
export function renderTermsView(student = {}) {
    const firstname = student.firstname || '';
    const lastname = student.lastname || '';
    const dni = student.dni || 'Sin especificar';

    return `
    <div class="pt-8 pb-12 max-w-md mx-auto px-4 space-y-4">
        <div class="bg-slate-900/95 rounded-2xl p-5 border-2 border-amber-500/80 shadow-2xl space-y-4">
            
            <div class="text-center space-y-1 border-b border-slate-800 pb-3">
                <span class="text-[10px] font-black text-amber-400 uppercase tracking-widest block">Verificación de Identidad & Acceso Privado</span>
                <h2 class="text-lg font-black text-white">FRANCO FIT</h2>
            </div>

            <!-- FICHA DE IDENTIFICACIÓN -->
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span class="text-[10px] text-slate-400 uppercase font-bold block">Titular Declarado:</span>
                <p class="text-sm font-black text-amber-300 uppercase">${lastname}, ${firstname}</p>
                <p class="text-xs text-slate-300 font-semibold">DNI: <span class="text-white font-bold">${dni}</span></p>
            </div>

            <!-- TEXTO LEGAL LEY 25.326 -->
            <div class="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2 max-h-48 overflow-y-auto leading-relaxed">
                <p class="font-bold text-amber-400 uppercase text-[11px] flex items-center gap-1">
                    ⚠️ AVISO DE CONFIDENCIALIDAD Y USO EXCLUSIVO
                </p>
                <p class="text-[11px] text-slate-300">
                    El plan de entrenamiento, prescripción nutricional, ejercicios y métricas de salud a los que estás por acceder son de carácter <strong>estrictamente confidencial, personal y para tu uso exclusivo</strong>.
                </p>
                <p class="text-[11px] text-slate-300">
                    🚫 <strong>PROHIBICIÓN EXPLÍCITA:</strong> Queda totalmente prohibido compartir, ceder, divulgar, transmitir o reproducir tus credenciales de acceso, enlaces o contenidos con terceros o competidores del titular o de la plataforma.
                </p>
                <p class="text-[10px] text-slate-400 italic border-t border-slate-800 pt-1.5">
                    ⚖️ <strong>Marco Legal República Argentina:</strong> La presente plataforma y sus registros se rigen por las leyes y normas de protección de datos personales de la República Argentina vigentes al momento del ingreso, en especial la <strong>Ley Nº 25.326</strong>, sus modificatorias, complementarias, anexas o supletorias.
                </p>
            </div>

            <!-- CHECKBOX DE DECLARACIÓN JURADA -->
            <label class="flex items-start gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer transition hover:border-amber-500/50">
                <input type="checkbox" id="chk-accept-terms" onchange="window.toggleAcceptButton(this.checked)" class="mt-1 w-4 h-4 accent-amber-500 rounded cursor-pointer">
                <span class="text-[11px] text-slate-200 font-medium leading-snug">
                    Declaro bajo juramento ser el titular del DNI informado, asumir la responsabilidad del uso de este acceso y aceptar los Términos, Condiciones y Políticas de Privacidad.
                </span>
            </label>

            <!-- BOTÓN DE INGRESO -->
            <button id="btn-confirm-terms" disabled onclick="window.confirmTermsAndEnter()" class="w-full bg-slate-800 text-slate-500 cursor-not-allowed text-xs font-black py-3 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 shadow">
                <span>Ingresar a mi Rutina Oficial</span>
            </button>

        </div>
    </div>`;
}