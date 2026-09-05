/**
 * Módulo de Login / Autenticación para Entrenadores
 * Totalmente adaptado para Tailwind CLI y alineado con el estado global en main.js
 */
export function renderLogin() {
  return `
    <div class="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-slate-950 text-slate-100">
      
      <!-- Contenedor Principal de Login -->
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
        
        <!-- Identidad de Marca y Encabezado -->
        <div class="text-center space-y-3">
          <div class="relative inline-block">
            <img 
              src="/imagenes/franco-fit-MARCA.jpg" 
              onerror="this.onerror=null; this.src='/logo.png';" 
              alt="Franco Fit Logo" 
              class="w-24 h-24 mx-auto rounded-full border-2 border-amber-500 shadow-xl object-cover bg-slate-950" 
            />
            <span class="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          
          <div>
            <h2 class="text-xl font-extrabold text-amber-400 uppercase tracking-wider">
              Acceso Entrenador
            </h2>
            <p class="text-xs text-slate-400 mt-1">
              Plataforma Móvil Franco Fit
            </p>
          </div>
        </div>

        <!-- Formulario de Autenticación -->
        <form id="login-form" class="space-y-4">
          <div>
            <label for="username" class="block text-xs font-semibold text-slate-300 mb-1.5">
              Usuario / Email
            </label>
            <input 
              type="email" 
              id="username" 
              required 
              autocomplete="username"
              inputmode="email"
              class="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none text-xs transition-colors" 
              placeholder="ingreso@francofit.com" 
            />
          </div>

          <div>
            <label for="password" class="block text-xs font-semibold text-slate-300 mb-1.5">
              Contraseña
            </label>
            <input 
              type="password" 
              id="password" 
              required 
              autocomplete="current-password"
              class="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none text-xs transition-colors" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            type="submit" 
            class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
          >
            <span>Ingresar al Panel</span>
            <i data-lucide="log-in" class="w-4 h-4"></i>
          </button>
        </form>

        <!-- Pie Informativo -->
        <div class="text-center pt-2 border-t border-slate-800/60">
          <p class="text-[10px] text-slate-500 font-medium">
            Control de Acceso, Analytics & Gestión • Costo $0
          </p>
        </div>

      </div>

    </div>
  `;
}