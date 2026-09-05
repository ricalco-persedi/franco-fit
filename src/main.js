import { createIcons, Dumbbell, History, BarChart3, Trash2, Plus, FileDown, Save } from 'lucide';
import { renderHeader } from './components/Header.js';
import { renderLogin } from './components/Login.js';
import { renderRoutineView } from './components/RoutineView.js';
import { renderHistoryView } from './components/HistoryView.js';
import { renderAnalyticsView } from './components/AnalyticsView.js';
import { localDB } from './services/supabase.js';
import { exportToPDF } from './utils/pdfGenerator.js';

/**
 * Estado Global de la Aplicación PWA
 */
let state = {
  isLoggedIn: true, // Cambiar a false para forzar inicio de sesión
  currentTab: 'routine',
  routine: localDB.getRoutine() || {
    studentName: 'Carlos Gómez',
    routineName: 'Fase 1 - Fuerza Max',
    startDate: new Date().toISOString().split('T')[0],
    durationWeeks: 4,
    nutritionNotes: 'Consumir 2g de proteína por kg. Tomar 3L de agua diarios.',
    exercises: [
      {
        name: 'Press de Banca',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-runs-on-a-treadmill-41240-large.mp4',
        sets: '4',
        reps: '10',
        days: 'Lun-Jue'
      }
    ]
  },
  history: localDB.getHistory() || []
};

/**
 * Sistema de Notificaciones Toast Personalizado (Sin alert nativo)
 */
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed top-5 right-5 z-50 transition-all duration-300 transform opacity-0 translate-y-[-20px] pointer-events-none';
    document.body.appendChild(toast);
  }

  const bgColor = type === 'success' ? 'bg-amber-500 text-slate-950' : 'bg-red-600 text-white';
  
  toast.innerHTML = `
    <div class="${bgColor} font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-white/10 text-sm">
      <span>${message}</span>
    </div>
  `;

  // Animación de entrada
  requestAnimationFrame(() => {
    toast.classList.remove('opacity-0', 'translate-y-[-20px]');
    toast.classList.add('opacity-100', 'translate-y-0');
  });

  // Animación de salida
  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', 'translate-y-[-20px]');
  }, 3000);
}

/**
 * Recolecta dinámicamente los datos de los inputs del formulario activo
 */
function syncFormToState() {
  if (state.currentTab !== 'routine') return;

  const studentNameInput = document.getElementById('studentName');
  const routineNameInput = document.getElementById('routineName');
  const startDateInput = document.getElementById('startDate');
  const durationWeeksInput = document.getElementById('durationWeeks');
  const nutritionNotesInput = document.getElementById('nutritionNotes');

  if (studentNameInput) state.routine.studentName = studentNameInput.value;
  if (routineNameInput) state.routine.routineName = routineNameInput.value;
  if (startDateInput) state.routine.startDate = startDateInput.value;
  if (durationWeeksInput) state.routine.durationWeeks = durationWeeksInput.value;
  if (nutritionNotesInput) state.routine.nutritionNotes = nutritionNotesInput.value;

  // Sincronizar dinámicamente el listado de ejercicios
  const exerciseRows = document.querySelectorAll('.exercise-item-row');
  exerciseRows.forEach((row, index) => {
    if (state.routine.exercises[index]) {
      const name = row.querySelector('.ex-name')?.value;
      const sets = row.querySelector('.ex-sets')?.value;
      const reps = row.querySelector('.ex-reps')?.value;
      const days = row.querySelector('.ex-days')?.value;
      const videoUrl = row.querySelector('.ex-video')?.value;

      if (name !== undefined) state.routine.exercises[index].name = name;
      if (sets !== undefined) state.routine.exercises[index].sets = sets;
      if (reps !== undefined) state.routine.exercises[index].reps = reps;
      if (days !== undefined) state.routine.exercises[index].days = days;
      if (videoUrl !== undefined) state.routine.exercises[index].videoUrl = videoUrl;
    }
  });
}

/**
 * Renderizado Principal de la Aplicación
 */
function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;

  if (!state.isLoggedIn) {
    app.innerHTML = renderLogin();
    bindLoginEvents();
    return;
  }

  app.innerHTML = `
    <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-24">
      ${renderHeader()}
      
      <main class="flex-1 max-w-md w-full mx-auto px-4 pt-4">
        ${state.currentTab === 'routine' ? renderRoutineView(state.routine) : ''}
        ${state.currentTab === 'history' ? renderHistoryView(state.history) : ''}
        ${state.currentTab === 'analytics' ? renderAnalyticsView() : ''}
      </main>

      <!-- Barra de Navegación Inferior Móvil (Touch First) -->
      <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-around py-2.5 z-40 shadow-lg">
        <button data-tab="routine" class="nav-btn flex flex-col items-center gap-1 transition-colors ${state.currentTab === 'routine' ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-200'}">
          <i data-lucide="dumbbell" class="w-5 h-5"></i>
          <span class="text-[11px]">Rutina</span>
        </button>
        <button data-tab="history" class="nav-btn flex flex-col items-center gap-1 transition-colors ${state.currentTab === 'history' ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-200'}">
          <i data-lucide="history" class="w-5 h-5"></i>
          <span class="text-[11px]">Historial</span>
        </button>
        <button data-tab="analytics" class="nav-btn flex flex-col items-center gap-1 transition-colors ${state.currentTab === 'analytics' ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-200'}">
          <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
          <span class="text-[11px]">Avances</span>
        </button>
      </nav>
    </div>
  `;

  // Inicialización de Iconos de Lucide
  createIcons({
    icons: { Dumbbell, History, BarChart3, Trash2, Plus, FileDown, Save }
  });

  bindGlobalEvents();
}

/**
 * Eventos de la vista de Login
 */
function bindLoginEvents() {
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      state.isLoggedIn = true;
      renderApp();
      showToast('Sesión iniciada correctamente');
    });
  }
}

/**
 * Eventos Globales y Gestores de Interacción
 */
function bindGlobalEvents() {
  // Navegación entre Pestañas
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      syncFormToState();
      state.currentTab = btn.dataset.tab;
      renderApp();
    });
  });

  // Eventos específicos de la pestaña Rutina
  if (state.currentTab === 'routine') {
    
    // Agregar un nuevo ejercicio
    document.getElementById('add-exercise-btn')?.addEventListener('click', () => {
      syncFormToState();
      state.routine.exercises.push({
        name: '',
        videoUrl: '',
        sets: '3',
        reps: '12',
        days: 'Lun-Mié-Vie'
      });
      renderApp();
    });

    // Guardar Rutina en LocalStorage / Supabase
    document.getElementById('save-routine-btn')?.addEventListener('click', async () => {
      syncFormToState();

      if (!state.routine.studentName.trim()) {
        showToast('Ingresa el nombre del alumno', 'error');
        return;
      }

      // Persistir Rutina Actual
      await localDB.saveRoutine(state.routine);

      // Agregar al Historial si no está repetido
      state.history.unshift({ ...state.routine, savedAt: new Date().toISOString() });
      await localDB.saveHistory(state.history);

      showToast('¡Rutina e historial guardados con éxito!');
    });

    // Exportar Informe PDF
    document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
      syncFormToState();
      const fileName = `Rutina_${state.routine.studentName.replace(/\s+/g, '_') || 'Alumno'}.pdf`;
      exportToPDF('pdf-content', fileName);
    });

    // Eliminar un ejercicio específico
    document.querySelectorAll('.remove-ex-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        syncFormToState();
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        state.routine.exercises.splice(idx, 1);
        renderApp();
        showToast('Ejercicio eliminado');
      });
    });
  }

  // Eventos de la pestaña Historial
  if (state.currentTab === 'history') {
    document.querySelectorAll('.load-routine-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index, 10);
        state.routine = JSON.parse(JSON.stringify(state.history[idx]));
        state.currentTab = 'routine';
        renderApp();
        showToast('Rutina cargada desde el historial');
      });
    });
  }
}

// Inicialización de la aplicación
renderApp();