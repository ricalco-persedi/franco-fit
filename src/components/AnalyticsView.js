import Chart from 'chart.js/auto';

/**
 * Módulo de Analíticas: Gráficos interactivos de rendimiento y métricas clave
 * Utiliza Chart.js modularizado vía NPM
 */
export function renderAnalyticsView() {
  // Ejecutamos la inicialización del gráfico en el siguiente ciclo del Event Loop
  setTimeout(() => {
    initAnalyticsChart();
  }, 50);

  return `
    <div class="space-y-5 pb-6">
      
      <!-- Título de Sección -->
      <div class="flex items-center justify-between px-1">
        <h3 class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="bar-chart-3" class="w-4 h-4"></i> Métricas & Progreso del Alumno
        </h3>
        <span class="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          En línea
        </span>
      </div>

      <!-- Tarjetas de KPIs Rápidos -->
      <div class="grid grid-cols-3 gap-2.5">
        <div class="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center space-y-1 shadow-md">
          <span class="text-[10px] text-slate-400 font-medium block">Asistencia</span>
          <p class="text-lg font-extrabold text-amber-400">92%</p>
          <span class="text-[9px] text-emerald-400 font-semibold">+4% este mes</span>
        </div>

        <div class="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center space-y-1 shadow-md">
          <span class="text-[10px] text-slate-400 font-medium block">Volumen</span>
          <p class="text-lg font-extrabold text-slate-100">14.2k</p>
          <span class="text-[9px] text-slate-400">kg levantados</span>
        </div>

        <div class="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-center space-y-1 shadow-md">
          <span class="text-[10px] text-slate-400 font-medium block">Racha</span>
          <p class="text-lg font-extrabold text-amber-400">5 días</p>
          <span class="text-[9px] text-slate-400">consecutivos</span>
        </div>
      </div>

      <!-- Contenedor del Gráfico de Evolución -->
      <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-xs font-bold text-slate-100">Evolución de Cargas (Fuerza)</h4>
            <p class="text-[10px] text-slate-400">Progreso semanal de peso máximo estimado (1RM)</p>
          </div>
          <span class="text-[10px] bg-slate-950 text-amber-400 font-bold px-2 py-1 rounded-md border border-slate-800">
            Últimas 6 Semanas
          </span>
        </div>

        <!-- Canvas para Chart.js -->
        <div class="relative w-full h-52 pt-2">
          <canvas id="progressChart"></canvas>
        </div>
      </div>

      <!-- Resumen de Objetivos Nutricionales y Hábitos -->
      <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl space-y-3">
        <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="check-circle-2" class="w-4 h-4"></i> Adherencia a Metas Semanales
        </h4>
        
        <div class="space-y-2.5">
          <div>
            <div class="flex justify-between text-[11px] font-medium mb-1">
              <span class="text-slate-300">Entrenamientos Completados</span>
              <span class="text-amber-400 font-bold">4 / 4 días</span>
            </div>
            <div class="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
              <div class="bg-amber-500 h-full rounded-full" style="width: 100%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-[11px] font-medium mb-1">
              <span class="text-slate-300">Cumplimiento Nutricional</span>
              <span class="text-amber-400 font-bold">85%</span>
            </div>
            <div class="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden">
              <div class="bg-amber-500 h-full rounded-full" style="width: 85%"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Inicialización del Gráfico de Chart.js
 */
function initAnalyticsChart() {
  const ctx = document.getElementById('progressChart')?.getContext('2d');
  if (!ctx) return;

  // Destruir instancia previa si existe en el canvas
  const existingChart = Chart.getChart('progressChart');
  if (existingChart) {
    existingChart.destroy();
  }

  // Gradiente dorado para la línea de rendimiento
  const gradient = ctx.createLinearGradient(0, 0, 0, 200);
  gradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
  gradient.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
      datasets: [{
        label: 'Carga Media (kg)',
        data: [60, 65, 67.5, 72, 75, 80],
        borderColor: '#f59e0b',
        borderWidth: 3,
        pointBackgroundColor: '#fbbf24',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: true,
        backgroundColor: gradient,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f59e0b',
          bodyColor: '#f8fafc',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: (context) => ` Progresión: ${context.parsed.y} kg`
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 10
            }
          }
        },
        y: {
          grid: {
            color: 'rgba(51, 65, 85, 0.4)'
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 10
            },
            callback: (value) => `${value}kg`
          }
        }
      }
    }
  });
}