import html2pdf from 'html2pdf.js';

/**
 * Exporta la sección elegida a PDF respetando las reglas @media print de src/style.css
 * @param {string} elementId - ID del contenedor HTML a exportar
 * @param {string} studentName - Nombre del alumno para el archivo
 */
export async function generateStudentPDF(elementId = 'full-pdf-print-area', studentName = 'Alumno') {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.warn(`No se encontró el elemento #${elementId}. Iniciando impresión por navegador.`);
    window.print();
    return;
  }

  const sanitizedName = studentName.replace(/\s+/g, '_');
  const filename = `Rutina_${sanitizedName}_FC_Training.pdf`;

  const options = {
    margin: [0.3, 0.3, 0.3, 0.3],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(options).from(element).save();
  } catch (error) {
    console.warn('Fallo la librería cliente, ejecutando fallback de impresión nativa:', error);
    window.print();
  }
}