import { renderHeader } from './components/Header.js';
import { renderLogin } from './components/Login.js';
import { renderRoutineView } from './components/RoutineView.js';
import { renderHistoryView } from './components/HistoryView.js';
import { renderAnalyticsView } from './components/AnalyticsView.js';
import { localDB } from './services/supabase.js';
import { exportToPDF } from './utils/pdfGenerator.js';

// Estado global de la app
let state = {
  isLoggedIn: true, // Cambiar a false si se requiere Auth estricta
  currentTab: 'routine',
  routine: localDB.getRoutine() || {
    studentName: 'Carlos Gómez',
    routineName: 'Fase 1 - Fuerza',
    startDate: new Date().toISOString().split('T')[0],
    durationWeeks: 4,
    nutritionNotes: 'Consumir 2g de proteína por kg. Tomar 3L de agua diarios.',
    exercises: [
      { name: 'Press de Banca', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-runs-on-a-treadmill-41240-large.mp4', sets: '4', reps: '10', days: 'Lun-Jue' }
    ]
  },
  history: localDB.getHistory()
};

function showToast(message) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-message');
  if (toast && msgEl) {
    msgEl.innerText = message;
    toast.classList.remove('opacity-0');
    setTimeout(() => toast.classList.add('opacity-0'), 2500);
  }
}

function renderApp() {
  const app = document.getElementById('app');

  if (!state.isLoggedIn) {
    app.innerHTML = renderLogin();
    bindLoginEvents();
    return;
  }

  app.innerHTML = `
    ${renderHeader()}
    <main class="flex-1">
      ${state.currentTab === 'routine' ? renderRoutineView(state.routine) : ''}
      ${state.currentTab === 'history' ? renderHistoryView(state.history) : ''}
      ${state.currentTab === 'analytics' ? renderAnalyticsView() : ''}
    </main>

    <!-- Barra de Navegación Inferior (Touch / Mobile First) -->
    <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-brand-black border-t border-gray-800 flex justify-around py-3 z-40">
      <button data-tab="routine" class="nav-btn flex flex-col items-center gap-1 ${state.currentTab === 'routine' ? 'text-brand-gold' : 'text-gray-500'}">
        <i data-lucide="dumbbell" class="w-5 h-5"></i>
        <span class="text-[10px]">Rutina</span>
      </button>
      <button data-tab="history" class="nav-btn flex flex-col items-center gap-1 ${state.currentTab === 'history' ? 'text-brand-gold' : 'text-gray-500'}">
        <i data-lucide="history" class="w-5 h-5"></i>
        <span class="text-[10px]">Historial</span>
      </button>
      <button data-tab="analytics" class="nav-btn flex flex-col items-center gap-1 ${state.currentTab === 'analytics' ? 'text-brand-gold' : 'text-gray-500'}">
        <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
        <span class="text-[10px]">Avances</span>
      </button>
    </nav>
  `;

  // Inicializar iconos de Lucide
  if (window.lucide) window.lucide.createIcons();

  bindGlobalEvents();
}

function bindLoginEvents() {
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      state.isLoggedIn = true;
      renderApp();
    });
  }
}

function bindGlobalEvents() {
  // Navegación por Pestañas
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentTab = btn.dataset.tab;
      renderApp();
    });
  });

  // Eventos de Rutina
  if (state.currentTab === 'routine') {
    document.getElementById('add-exercise-btn')?.addEventListener('click', () => {
      state.routine.exercises.push({ name: '', videoUrl: '', sets: '4', reps: '10', days: 'Lun' });
      renderApp();
    });

    document.getElementById('save-routine-btn')?.addEventListener('click', () => {
      // Recolectar datos
      state.routine.studentName = document.getElementById('studentName').value;
      state.routine.routineName = document.getElementById('routineName').value;
      state.routine.startDate = document.getElementById('startDate').value;
      state.routine.durationWeeks = document.getElementById('durationWeeks').value;
      state.routine.nutritionNotes = document.getElementById('nutritionNotes').value;

      localDB.saveRoutine(state.routine);
      
      // Guardar en Historial
      state.history.push({ ...state.routine });
      localDB.saveHistory(state.history);

      showToast('¡Rutina guardada con éxito!');
    });

    document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
      exportToPDF('pdf-content', `Rutina_${state.routine.studentName || 'FrancoFit'}.pdf`);
    });

    document.querySelectorAll('.remove-ex-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.currentTarget.dataset.index;
        state.routine.exercises.splice(idx, 1);
        renderApp();
      });
    });
  }

  // Eventos de Historial
  if (state.currentTab === 'history') {
    document.querySelectorAll('.load-routine-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = e.currentTarget.dataset.index;
        state.routine = { ...state.history[idx] };
        state.currentTab = 'routine';
        renderApp();
        showToast('Rutina cargada');
      });
    });
  }
}

// Inicialización
renderApp();