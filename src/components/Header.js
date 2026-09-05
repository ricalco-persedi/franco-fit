/**
 * Encabezado Permanente: Mantiene la Marca Personal visible en todo momento.
 */
export function renderHeader() {
  return `
    <header class="bg-brand-black border-b border-brand-gold/30 p-4 sticky top-0 z-40 shadow-lg">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img src="/public/imagenes/FC-MARCA.png" 
               onerror="this.src='/public/logo.png'" 
               alt="Franco Fit" 
               class="h-12 w-12 object-contain rounded-full border border-brand-gold" />
          <div>
            <h1 class="text-lg font-bold text-brand-gold leading-tight uppercase tracking-wider">Franco Fit</h1>
            <p class="text-xs text-gray-400">Preparación Física & Nutrición</p>
          </div>
        </div>
        <div class="text-right text-xs text-gray-300">
          <a href="https://wa.me/5490000000000" target="_blank" class="flex items-center justify-end gap-1 text-brand-gold hover:underline">
            <i data-lucide="phone" class="w-3 h-3"></i> Contacto
          </a>
          <span class="block text-[10px] text-gray-500">Mendoza, Argentina</span>
        </div>
      </div>
    </header>
  `;
}