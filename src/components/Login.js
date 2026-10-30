export function renderLoginView() {
    return `
    <div id="login-container" class="max-w-md mx-auto min-h-[80vh] flex flex-col justify-center px-4 py-6 space-y-5">
        <div class="text-center space-y-3">
            <div class="relative inline-block">
                <img src="/imagenes/FC-MARCA.png" 
                     onerror="this.onerror=null; this.src='/logo.png';" 
                     alt="FC Training Logo" 
                     class="w-20 h-20 mx-auto rounded-2xl border-2 border-amber-500 shadow-2xl shadow-amber-500/30 object-cover bg-slate-950" />
            </div>
            <div>
                <h2 class="text-xl font-black text-white tracking-tight uppercase">FC TRAINING</h2>
                <p class="text-xs text-amber-400 font-bold">Prof. Franco Comeglio • Preparación Física</p>
                <p class="text-[11px] text-slate-400 mt-1">Ingresa a tu panel de entrenamiento</p>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button id="tab-student-login" type="button" class="py-2.5 text-xs font-black rounded-lg bg-sky-500 text-slate-950 shadow transition">
                Soy Alumno
            </button>
            <button id="tab-prof-login" type="button" class="py-2.5 text-xs font-black rounded-lg text-slate-400 hover:text-white transition">
                Soy Profesor
            </button>
        </div>

        <!-- FORMULARIO ALUMNO -->
        <form id="form-student-login" class="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 class="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <i data-feather="user-check" class="w-4 h-4"></i> Acceso de Alumno
            </h3>
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Nombre, Apellido o DNI *</label>
                <input type="text" id="input-student-firstname" required placeholder="Ej. Juan o 32123456" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-amber-400">
            </div>
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">PIN de Acceso o DNI *</label>
                <input type="password" id="input-student-pin" required placeholder="Ej. 1123 o tu DNI" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-amber-400 font-black tracking-widest focus:outline-none focus:border-amber-400">
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 text-xs font-black py-3 rounded-xl shadow-lg border border-sky-300 transition active:scale-95">
                Ingresar a mi Rutina →
            </button>
        </form>

        <!-- FORMULARIO PROFESOR -->
        <form id="form-prof-login" class="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 space-y-4 shadow-2xl hidden">
            <h3 class="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <i data-feather="shield" class="w-4 h-4"></i> Acceso Control Global (Profesor)
            </h3>
            <div>
                <label class="block text-xs font-bold text-slate-300 mb-1">Contraseña del Profesor *</label>
                <input type="password" id="input-prof-pass" required placeholder="••••••••" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-semibold focus:outline-none focus:border-amber-400">
            </div>
            <button type="submit" class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black py-3 rounded-xl shadow-lg border border-amber-300 transition active:scale-95">
                Acceder al Control Global →
            </button>
        </form>
    </div>`;
}