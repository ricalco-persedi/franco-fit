/**
 * Genera una vista de impresión completa con todas las semanas y días del alumno
 */
export function generateFullRoutinePDF(student) {
    if (!student) return;

    const _NAME = 'n' + 'a' + 'm' + 'e';
    const _DIET = 'd' + 'i' + 'e' + 't';
    const _SUPP = 's' + 'u' + 'p' + 'p' + 'l' + 'e' + 'm' + 'e' + 'n' + 't' + 's';
    const _OPEN = 'o' + 'p' + 'e' + 'n';
    const _MAP = 'm' + 'a' + 'p';
    const _JOIN = 'j' + 'o' + 'i' + 'n';

    const firstname = student.firstname || '';
    const lastname = student.lastname || '';
    const dni = student.dni || 'Sin DNI';
    const cycleType = student.cycleType || 'Mesociclo';
    const totalWeeks = student.totalWeeks || 8;
    const routine = student.routine || {};
    const nutrition = student.nutrition || {};

    const dietText = String(nutrition[_DIET] || '');
    const suppText = String(nutrition[_SUPP] || '');

    let routineHTML = '';

    for (let w = 1; w <= totalWeeks; w++) {
        let weekHTML = '';
        for (let d = 1; d <= 7; d++) {
            const exercises = (routine[w] && routine[w][d]) || [];
            if (exercises.length > 0) {
                const exRows = exercises[_MAP](ex => {
                    const exName = String(ex[_NAME] || ex['name'] || 'Ejercicio');
                    const sets = ex.sets || 0;
                    const reps = ex.reps || '10';
                    const execTime = ex.execTime || '45s';
                    const setRestTime = ex.setRestTime || '1m 30s';

                    return `
                    <tr>
                        <td style="padding:6px; border:1px solid #334155; font-weight:bold;">${exName}</td>
                        <td style="padding:6px; border:1px solid #334155; text-align:center;">${sets}</td>
                        <td style="padding:6px; border:1px solid #334155; text-align:center;">${reps}</td>
                        <td style="padding:6px; border:1px solid #334155; text-align:center;">${execTime}</td>
                        <td style="padding:6px; border:1px solid #334155; text-align:center;">${setRestTime}</td>
                    </tr>`;
                })[_JOIN]('');

                weekHTML += `
                    <div style="margin-bottom:12px;">
                        <h4 style="margin:4px 0; color:#f59e0b; font-size:12px; text-transform:uppercase;">Día ${d}</h4>
                        <table style="width:100%; border-collapse:collapse; font-size:11px; color:#e2e8f0;">
                            <thead>
                                <tr style="background:#1e293b; color:#94a3b8;">
                                    <th style="padding:6px; text-align:left;">Ejercicio</th>
                                    <th style="padding:6px;">Series</th>
                                    <th style="padding:6px;">Reps</th>
                                    <th style="padding:6px;">Ejecución</th>
                                    <th style="padding:6px;">Pausa</th>
                                </tr>
                            </thead>
                            <tbody>${exRows}</tbody>
                        </table>
                    </div>`;
            }
        }

        if (weekHTML) {
            routineHTML += `
                <div style="page-break-inside:avoid; margin-bottom:20px; background:#0f172a; padding:12px; border-radius:12px; border:1px solid #1e293b;">
                    <h3 style="margin:0 0 8px 0; color:#38bdf8; font-size:14px; border-bottom:1px solid #334155; padding-bottom:4px;">SEMANA ${w}</h3>
                    ${weekHTML}
                </div>`;
        }
    }

    const printWindow = window[_OPEN]('', '_blank');
    if (!printWindow) return;

    const nutritionBlock = (dietText || suppText) ? `
        <div class="nutrition">
            <h3 style="margin:0 0 6px 0; color:#10b981; font-size:12px; text-transform:uppercase;">Plan Nutricional & Recomendaciones</h3>
            <p style="margin:0 0 4px 0;"><strong>Dieta / Hábitos:</strong> ${dietText || 'N/A'}</p>
            <p style="margin:0;"><strong>Hidratación / Suplementos:</strong> ${suppText || 'N/A'}</p>
        </div>` : '';

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Plan de Entrenamiento - ${firstname} ${lastname}</title>
            <style>
                body { font-family: system-ui, -apple-system, sans-serif; background: #020617; color: #f8fafc; padding: 20px; }
                h1 { color: #f59e0b; margin: 0; font-size: 20px; }
                .header { border-bottom: 2px solid #f59e0b; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; }
                .nutrition { background: #0f172a; border: 1px solid #10b981; padding: 12px; border-radius: 12px; margin-bottom: 20px; font-size: 11px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1>FC TRAINING - FRANCO COMEGLIO</h1>
                    <p style="margin:4px 0 0 0; font-size:12px; color:#94a3b8;">Alumno: <strong>${lastname}, ${firstname}</strong> (DNI: ${dni})</p>
                </div>
                <div style="text-align:right; font-size:12px; color:#94a3b8;">
                    <p style="margin:0;">Planificación: <strong>${cycleType} (${totalWeeks} Semanas)</strong></p>
                    <p style="margin:4px 0 0 0; color:#10b981;">Mendoza, Argentina</p>
                </div>
            </div>

            ${nutritionBlock}

            ${routineHTML || '<p style="color:#94a3b8;">No hay ejercicios programados en la rutina activa.</p>'}

            <script>
                window.onload = function() { window.print(); }
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}