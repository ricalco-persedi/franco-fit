import html2pdf from 'html2pdf.js';

/**
 * Generador de Reportes PDF Profesionales a Costo $0
 * Convierte el nodo DOM indicado en un documento optimizado para impresión.
 *
 * @param {string} elementId - ID del contenedor HTML a exportar.
 * @param {string} filename - Nombre por defecto del archivo descargado.
 */
export async function exportToPDF(elementId, filename = 'Rutina_FrancoFit.pdf') {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`[pdfGenerator] Elemento con ID "${elementId}" no encontrado.`);
    return;
  }

  // Ocultar botones y elementos interactivos marcados como .no-print
  const noPrintElements = document.querySelectorAll('.no-print');
  noPrintElements.forEach(el => el.classList.add('hidden'));

  // Aplicar temporalmente tema claro para ahorro de tinta y alta resolución
  element.classList.add('pdf-mode-active');

  const options = {
    margin: [0.4, 0.4, 0.4, 0.4], // Margen superior, izquierdo, inferior, derecho en pulgadas
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,               // Alta resolución de renderizado
      useCORS: true,         // Permite cargar imágenes/logos alojados externamente
      logging: false,
      backgroundColor: '#ffffff' // Fondo blanco garantizado
    },
    jsPDF: {
      unit: 'in',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  try {
    // Generar y descargar el PDF de forma asíncrona
    await html2pdf().set(options).from(element).save();
  } catch (error) {
    console.error('[pdfGenerator] Error al exportar el documento PDF:', error);
  } finally {
    // Restaurar los elementos ocultos y remover estilos de impresión
    noPrintElements.forEach(el => el.classList.remove('hidden'));
    element.classList.remove('pdf-mode-active');
  }
}