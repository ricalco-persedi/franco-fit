export function renderLogin() {
  return `
    <div class="flex-1 flex flex-col justify-center p-6 bg-brand-black">
      <div class="text-center mb-8">
        <img src="/public/imagenes/franco-fit-MARCA.jpg" alt="Logo" class="w-24 h-24 mx-auto rounded-full border-2 border-brand-gold mb-4 shadow-xl object-cover" />
        <h2 class="text-2xl font-bold text-white uppercase tracking-wide">Acceso Entrenador</h2>
        <p class="text-xs text-gray-400 mt-1">Plataforma Móvil Franco Fit</p>
      </div>

      <form id="login-form" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Usuario / Email</label>
          <input type="text" id="username" required class="w-full bg-brand-gray border border-gray-700 rounded-lg p-3 text-white focus:border-brand-gold focus:outline-none text-sm" placeholder="ingreso@francofit.com" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Contraseña</label>
          <input type="password" id="password" required class="w-full bg-brand-gray border border-gray-700 rounded-lg p-3 text-white focus:border-brand-gold focus:outline-none text-sm" placeholder="••••••••" />
        </div>
        <button type="submit" class="w-full bg-brand-gold hover:bg-brand-goldHover text-black font-bold py-3.5 rounded-lg shadow-lg transition-transform active:scale-95 text-sm uppercase">
          Ingresar al Panel
        </button>
      </form>
    </div>
  `;
}