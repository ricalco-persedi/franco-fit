/**
 * Exportador PDF profesional a costo $0.
 * Utiliza html2pdf.js en el cliente sin requerir servidores de pago.
 */
export function exportToPDF(elementId, filename = 'Rutina_FrancoFit.pdf') {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error('Elemento no encontrado para PDF');
    return;
  }

  const opt = {
    margin:       [0.3, 0.3, 0.3, 0.3],
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Ocultar botones interactivos durante la captura
  const actionButtons = document.querySelectorAll('.no-print');
  actionButtons.forEach(btn => btn.style.display = 'none');

  window.html2pdf().set(opt).from(element).save().then(() => {
    // Restaurar botones tras generar PDF
    actionButtons.forEach(btn => btn.style.display = '');
  });
}