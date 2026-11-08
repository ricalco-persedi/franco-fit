/**
 * Genera la Ficha General Unificada en PDF respetando únicamente lo marcado como visible
 */
export function generateFullRoutinePDF(student) {
    if (!student) return;

    const firstname = student.firstname || '';
    const lastname = student.lastname || '';
    const dni = student.dni || 'Sin DNI';
    const visibility = student.visibilitySettings || {};

    // 1. Bloques de Ficha Personal Visibles
    const antropo = student.datosAntropometricos || {};
    const antropoBlock = (visibility.antropometria !== false && (antropo.peso || antropo.altura || antropo.grasa)) ? `
        <div style="background:#0f172a; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #1e293b;">
            <h4 style="margin:0 0 5px 0; color:#38bdf8; font-size:11px; text-transform:uppercase;">Datos Antropométricos</h4>
            <p style="margin:0; font-size:11px; color:#cbd5e1;">
                ${antropo.peso ? `<strong>Peso:</strong> ${antropo.peso} kg &nbsp;&nbsp;` : ''}
                ${antropo.altura ? `<strong>Altura:</strong> ${antropo.altura} cm &nbsp;&nbsp;` : ''}
                ${antropo.grasa ? `<strong>Grasa:</strong> ${antropo.grasa}%` : ''}
            </p>
        </div>` : '';

    const lesionesBlock = (visibility.lesiones !== false && student.historialLesiones) ? `
        <div style="background:#0f172a; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #1e293b;">
            <h4 style="margin:0 0 5px 0; color:#f43f5e; font-size:11px; text-transform:uppercase;">Historial / Observaciones</h4>
            <p style="margin:0; font-size:11px; color:#cbd5e1;">${student.historialLesiones}</p>
        </div>` : '';

    const evaluacionBlock = (visibility.evaluacion !== false && student.evaluacionInicial) ? `
        <div style="background:#0f172a; padding:10px; border-radius:8px; margin-bottom:10px; border:1px solid #1e293b;">
            <h4 style="margin:0 0 5px 0; color:#f59e0b; font-size:11px; text-transform:uppercase;">Evaluación Inicial</h4>
            <p style="margin:0; font-size:11px; color:#cbd5e1;">${student.evaluacionInicial}</p>
        </div>` : '';

    // 2. Planificación General (Macrociclo y Mesociclo Visibles)
    const macroFase = (visibility.macrociclo !== false && student.macrociclo?.fase) ? student.macrociclo.fase : null;
    const mesoEnfoque = (visibility.enfoqueMesociclo !== false && student.mesociclo?.enfoque) ? student.mesociclo.enfoque : null;

    const planHeaderBlock = (macroFase || mesoEnfoque) ? `
        <div style="background:#0f172a; padding:10px; border-radius:8px; margin-bottom:12px; border:1px solid #1e293b;">
            ${macroFase ? `<p style="margin:0 0 4px 0; font-size:11px; color:#f59e0b;"><strong>Macrociclo:</strong> ${macroFase}</p>` : ''}
            ${mesoEnfoque ? `<p style="margin:0; font-size:11px; color:#38bdf8;"><strong>Enfoque Mesociclo:</strong> ${mesoEnfoque}</p>` : ''}
        </div>` : '';

    // 3. Tablas de Rutina Visibles
    const totalWeeks = student.totalWeeks || student.mesociclo?.numeroSemanas || 4;
    const routine = student.routine || {};
    let routineHTML = '';

    for (let w = 1; w <= totalWeeks; w++) {
        if (visibility[`semana_${w}`] === false) continue;

        let weekHTML = '';
        for (let d = 1; d <= 7; d++) {
            if (visibility[`semana_${w}_dia_${d}`] === false) continue;

            const exercises = (routine[w] && routine[w][d]) || [];
            const visibleExercises = exercises.filter(ex => ex.visible !== false);

            if (visibleExercises.length > 0) {
                const exRows = visibleExercises.map(ex => {
                    const exName = ex.name || 'Ejercicio';
                    const series = (visibility.seriesGlobal !== false && ex.visibleSeries !== false) ? (ex.series || 3) : '-';
                    const reps = (visibility.repetitionGlobal !== false && ex.visibleReps !== false) ? (ex.repeticiones || '8-12') : '-';
                    const carga = (visibility.cargaGlobal !== false && ex.visibleCarga !== false) ? (ex.cargaKg || ex.porcentajeRM || '-') : '-';
                    const rest = ex.setRest || '60s';

                    return `
                    <tr>
                        <td style="padding:6px; border:1px solid #334155; font-weight:bold;">${exName}</td>
                        <td style="padding:6px; border:1px solid #334155; text-align:center;">${series}</td>
                        <td style="padding:6px; border:1px solid #334155; text-align:center;">${reps}</td>
                        <td style="padding:6px; border:1px solid #334155; text-align:center;">${carga}</td>
                        <td style="padding:6px; border:1px solid #334155; text-align:center;">${rest}</td>
                    </tr>`;
                }).join('');

                weekHTML += `
                <div style="margin-bottom:10px;">
                    <h4 style="margin:4px 0; color:#f59e0b; font-size:11px; text-transform:uppercase;">Día ${d}</h4>
                    <table style="width:100%; border-collapse:collapse; font-size:10px; color:#e2e8f0;">
                        <thead>
                            <tr style="background:#1e293b; color:#94a3b8;">
                                <th style="padding:5px; border:1px solid #334155; text-align:left;">Ejercicio</th>
                                <th style="padding:5px; border:1px solid #334155;">Series</th>
                                <th style="padding:5px; border:1px solid #334155;">Reps</th>
                                <th style="padding:5px; border:1px solid #334155;">Carga</th>
                                <th style="padding:5px; border:1px solid #334155;">Pausa</th>
                            </tr>
                        </thead>
                        <tbody>${exRows}</tbody>
                    </table>
                </div>`;
            }
        }

        if (weekHTML) {
            routineHTML += `
            <div style="page-break-inside:avoid; margin-bottom:16px; background:#0f172a; padding:10px; border-radius:10px; border:1px solid #1e293b;">
                <h3 style="margin:0 0 6px 0; color:#38bdf8; font-size:12px; border-bottom:1px solid #334155; padding-bottom:4px;">SEMANA ${w}</h3>
                ${weekHTML}
            </div>`;
        }
    }

    // 4. Apertura del documento para guardar/imprimir en PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Ficha General - ${firstname} ${lastname}</title>
            <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #060b14; color: #f8fafc; padding: 20px; }
                h1 { font-size: 18px; color: #f59e0b; margin: 0 0 4px 0; text-transform: uppercase; }
                p { font-size: 11px; color: #94a3b8; margin: 0; }
            </style>
        </head>
        <body>
            <div style="display:flex; justify-between; align-items:center; border-bottom:2px solid #f59e0b; padding-bottom:10px; margin-bottom:15px;">
                <div>
                    <h1>Franco Fit - Planificación Individual</h1>
                    <p><strong>Alumno:</strong> ${lastname}, ${firstname} (DNI: ${dni})</p>
                </div>
            </div>
            ${antropoBlock}
            ${lesionesBlock}
            ${evaluacionBlock}
            ${planHeaderBlock}
            ${routineHTML || '<p style="color:#94a3b8; text-align:center; padding:20px;">No hay rutinas publicadas actualmente para este alumno.</p>'}
            <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
    `);
    printWindow.document.close();
}