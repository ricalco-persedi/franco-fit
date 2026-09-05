/**
 * Encabezado Permanente: Mantiene la Marca Personal visible en todo momento.
 * Optimizado con clases estándar de Tailwind CSS e íconos de Lucide.
 */
export function renderHeader() {
  return `
    <header class="bg-slate-900 border-b border-amber-500/30 px-4 py-3 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      <div class="flex items-center justify-between max-w-md mx-auto">
        
        <!-- Identidad Visual y Marca Personal -->
        <div class="flex items-center space-x-3">
          <div class="relative">
            <img 
              src="/imagenes/FC-MARCA.png" 
              onerror="this.onerror=null; this.src='/logo.png';" 
              alt="Franco Fit Logo" 
              class="h-11 w-11 object-cover rounded-full border-2 border-amber-500 shadow-md bg-slate-950" 
            />
            <span class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <div>
            <h1 class="text-base font-extrabold text-amber-400 leading-tight uppercase tracking-wide">
              Franco Fit
            </h1>
            <p class="text-[11px] font-medium text-slate-400">
              Preparación Física & Nutrición
            </p>
          </div>
        </div>

        <!-- Contacto Directo y Ubicación -->
        <div class="text-right flex flex-col items-end justify-center">
          <a 
            href="https://wa.me/5492610000000?text=Hola%20Franco,%20tengo%20una%20consulta%20sobre%20mi%20rutina" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold transition-all active:scale-95"
            aria-label="Contactar por WhatsApp"
          >
            <i data-lucide="phone" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>Contacto</span>
          </a>
          <span class="block text-[10px] font-medium text-slate-500 mt-1">
            Mendoza, Argentina
          </span>
        </div>

      </div>
    </header>
  `;
}