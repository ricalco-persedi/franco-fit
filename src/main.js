import {
    supabase,
    logoutSupabase,
    fetchStudentsFromSupabase,
    saveStudentDifferential,
    generateUUID,
    fetchStudentByToken,
    generateStudentAccessToken,
    loginProfesorWithSupabase,
    syncVideoBankToSupabase,
    fetchVideoBankFromSupabase
} from './services/supabase.js';

import { renderFichaView } from './components/FichaView.js';
import { renderHeader } from './components/Header.js';
import { renderRoutineView } from './components/RoutineView.js';
import { createExerciseCardHTML } from './components/ExerciseCard.js';
import { renderHistoryView } from './components/HistoryView.js';
import { generateFullRoutinePDF } from './utils/pdfGenerator.js';
import { renderMacrocicloView } from './components/MacrocicloView.js';
import { renderMesocicloView } from './components/MesocicloView.js';
import { renderMicrocicloView } from './components/MicrocicloView.js';
import { renderVisibilidadView } from './components/VisibilidadView.js';
import { renderEjercicioView } from './components/EjercicioView.js';
import { renderSeriesView } from './components/SeriesView.js';
import { renderRepeticionesView } from './components/RepeticionesView.js';
import { renderCargaView } from './components/CargaView.js';
import { renderStudentPwaView } from './components/StudentPwaView.js';
import { renderResumenView } from './components/ResumenView.js';

// Constantes internas de compatibilidad
const _ID = 'id';
const _NAME = 'name';
const _PIN = 'pin';
const _MAP = 'map';
const _JOIN = 'join';
const _FIND = 'find';
const _DIET = 'diet';
const _SUPPLEMENTS = 'supplements';

// ==========================================
// 📌 ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
let studentsDatabase = [];
let currentRole = 'prof'; // Rol principal asignado al Profesor
let currentStudentId = null;
let isProfLoggedIn = false;
let selectedWeek = 1;
let selectedDay = 1;
let activeRelationalTab = 'ficha'; // 'ficha' | 'macrociclo' | 'mesociclo' | 'microciclo' | 'ejercicio' | 'visibilidad' | 'resumen'
let deferredPwaPrompt = null;

// Evento PWA para instalación móvil
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadExternalLibraries();
    initTimeDropdowns();
    await loadInitialData();
    await restoreSession();
    renderApp();
});

async function loadExternalLibraries() {
    const featherCDN = 'https://unpkg.com/feather-icons';
    const chartCDN = 'https://cdn.jsdelivr.net/npm/chart.js';
    const loadScript = (src) => new Promise((resolve) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = resolve;
        document.head.appendChild(script);
    });
    await Promise.all([loadScript(featherCDN), loadScript(chartCDN)]);
}

async function loadInitialData() {
    studentsDatabase = await fetchStudentsFromSupabase();
}

async function restoreSession() {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');

    // 1. Acceso de Alumno vía Token
    if (tokenParam) {
        currentRole = 'student';
        const studentFromToken = await fetchStudentByToken(tokenParam);
        if (studentFromToken) {
            currentStudentId = studentFromToken.id;
        } else {
            currentStudentId = null;
        }
        return;
    }

    // 2. Acceso de Profesor
    currentRole = 'prof';
    const storedProfLogin = localStorage.getItem('fit_prof_logged_in');
    let hasSupabaseSession = false;

    if (supabase) {
        try {
            const { data } = await supabase.auth.getSession();
            if (data && data.session) {
                hasSupabaseSession = true;
            }
        } catch (e) {
            console.warn('Error al verificar sesión de Supabase:', e);
        }
    }

    if (storedProfLogin === 'true' || hasSupabaseSession) {
        isProfLoggedIn = true;
        try {
            const savedStudentId = localStorage.getItem('fit_active_student_id');
            if (savedStudentId) {
                currentStudentId = savedStudentId;
            }
        } catch (e) {
            console.warn('Error restaurando alumno activo:', e);
        }
        loadAndSyncVideoBank();
    } else {
        isProfLoggedIn = false;
    }
}

// ==========================================
// 🔑 VISTA DE LOGIN Y HANDLERS DE AUTENTICACIÓN
// ==========================================
function renderLoginView() {
    return `
    <div class="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <div class="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-2xl">
            <div class="text-center space-y-2">
                <div class="h-16 w-16 mx-auto rounded-2xl overflow-hidden shadow-lg border border-amber-400 bg-slate-950 flex items-center justify-center">
                    <img src="/imagenes/FC-MARCA.png" alt="FC" class="h-full w-full object-cover" onerror="this.onerror=null; this.src='/logo.png';">
                </div>
                <h1 class="text-sm font-black text-amber-400 uppercase tracking-wider">FC Training</h1>
                <p class="text-xs text-slate-400 font-semibold">Acceso Exclusivo de Administración</p>
            </div>
            <form onsubmit="event.preventDefault(); window.handleProfLogin();" class="space-y-4">
                <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">Correo Electrónico</label>
                    <input type="email" id="login-email" required placeholder="profesor@fctraining.ar" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold focus:outline-none focus:border-amber-500">
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">Contraseña</label>
                    <input type="password" id="login-password" required placeholder="••••••••" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold focus:outline-none focus:border-amber-500">
                </div>
                <button type="submit" class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3 rounded-xl shadow-lg transition active:scale-95 cursor-pointer">
                    Iniciar Sesión
                </button>
            </form>
        </div>
    </div>`;
}

window.handleProfLogin = async function() {
    const email = document.getElementById('login-email')?.value || '';
    const password = document.getElementById('login-password')?.value || '';
    showToast("Verificando credenciales...");
    const { data, error } = await loginProfesorWithSupabase(email, password);
    if (error) {
        showToast("Error: " + (error.message || "Credenciales inválidas"));
        return;
    }
    isProfLoggedIn = true;
    localStorage.setItem('fit_prof_logged_in', 'true');
    showToast("¡Bienvenido Profesor!");
    renderApp();
};

// ==========================================
// 🎨 RENDERIZADO PRINCIPAL (renderApp)
// ==========================================
export function renderApp() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    // 🟢 Lectura directa desde el estado en memoria RAM filtrado de Supabase
    const currentStudent = studentsDatabase.find(s => String(s.id) === String(currentStudentId));

    // 👁️ VISTA EXCLUSIVA PWA ALUMNO (SI INGRESA VÍA TOKEN)
    if (currentRole === 'student') {
        if (!currentStudent) {
            appEl.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs font-semibold">No se encontró información para este token de acceso.</div>`;
            return;
        }
        appEl.innerHTML = renderStudentPwaView(currentStudent, selectedWeek, selectedDay);
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    // 🔒 VISTA DE LOGIN SI EL PROFESOR NO HA INICIADO SESIÓN
    if (!isProfLoggedIn) {
        appEl.innerHTML = renderLoginView();
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    // 👨‍🏫 PANEL DE ADMINISTRACIÓN DEL PROFESOR
    let mainContentHTML = '';
    if (!currentStudentId || !currentStudent) {
        mainContentHTML = renderProfStudentSelectionScreen();
    } else {
        const pwaBanner = renderPwaInstallBannerHTML();
        let contentHTML = '';
        if (activeRelationalTab === 'ficha') {
            contentHTML = renderFichaView(currentStudent);
        } else if (activeRelationalTab === 'macrociclo') {
            contentHTML = renderMacrocicloView(currentStudent);
        } else if (activeRelationalTab === 'mesociclo') {
            contentHTML = renderMesocicloView(currentStudent);
        } else if (activeRelationalTab === 'microciclo') {
            contentHTML = renderMicrocicloView(currentStudent);
        } else if (activeRelationalTab === 'ejercicio') {
            contentHTML = renderEjercicioView(currentStudent);
        } else if (activeRelationalTab === 'visibilidad') {
            contentHTML = renderVisibilidadView(currentStudent);
        } else if (activeRelationalTab === 'resumen') {
            contentHTML = renderResumenView(currentStudent);
        } else {
            contentHTML = renderEjercicioView(currentStudent); // Pestaña por defecto
        }
        mainContentHTML = `
        <div class="pt-4 pb-20 max-w-md mx-auto px-4 space-y-4">
            ${pwaBanner}
            <div id="relational-entity-content">
                ${contentHTML}
            </div>
        </div>`;
    }

    appEl.innerHTML = `${renderHeader(currentStudent, activeRelationalTab)}
    ${mainContentHTML}`;
    bindEvents();
    if (typeof feather !== 'undefined') feather.replace();
}

function renderPwaInstallBannerHTML() {
    if (!deferredPwaPrompt) return '';
    return `
    <div id="pwa-install-banner" class="bg-amber-500/10 border border-amber-500/40 rounded-2xl p-3 flex justify-between items-center shadow-lg transition">
        <div class="flex items-center gap-2">
            <i data-feather="smartphone" class="w-5 h-5 text-amber-400"></i>
            <div>
                <strong class="text-xs text-amber-300 font-bold block">Instala Franco Fit en tu celular</strong>
                <span class="text-[10px] text-slate-400">Acceso rápido desde tu pantalla de inicio</span>
            </div>
        </div>
        <button onclick="window.installPWA()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-xl transition shadow active:scale-95">
            Instalar
        </button>
    </div>`;
}

function renderProfStudentSelectionScreen() {
    return `
    <div class="pt-6 pb-20 max-w-md mx-auto px-4 space-y-4">
        <div class="bg-slate-900/90 rounded-2xl p-4 border border-amber-500/30 shadow-xl space-y-4">
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
                <h2 class="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <i data-feather="users" class="w-4 h-4"></i> Gestión de Alumnos
                </h2>
                <button onclick="window.registerNewStudentPrompt()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl shadow transition active:scale-95 flex items-center gap-1">
                    <i data-feather="user-plus" class="w-3.5 h-3.5"></i> Registrar Nuevo Alumno
                </button>
            </div>
            <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Buscar Alumno (Nombre o DNI)</label>
                <input type="text" id="prof-search-input" oninput="window.filterProfStudentList(this.value)" placeholder="Escribe para buscar..." class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-semibold focus:outline-none focus:border-amber-500">
            </div>
            <div id="prof-student-list-container" class="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                ${renderProfStudentListHTML(studentsDatabase)}
            </div>
        </div>
    </div>`;
}

function renderProfStudentListHTML(list = []) {
    if (!list || list.length === 0) {
        return `<div class="p-4 text-xs text-slate-500 text-center italic bg-slate-950 rounded-xl border border-slate-800">No se encontraron alumnos registrados.</div>`;
    }
    return list.map(st => {
        const stId = String(st.id || '');
        const num = st.studentNumber ? `#${st.studentNumber} - ` : '';
        const macro = st.macrociclo?.fase || st.cycleType || 'Mesociclo';
        return `
        <div onclick="window.selectStudentByProf('${stId}')" class="p-3 bg-slate-950 hover:bg-amber-500/10 hover:border-amber-500/40 border border-slate-800/80 rounded-xl cursor-pointer flex justify-between items-center transition active:scale-98">
            <div>
                <strong class="text-xs text-amber-300 font-bold block">${num}${st.lastname || ''}, ${st.firstname || ''}</strong>
                <span class="text-[10px] text-slate-400">DNI: ${st.dni || 'Sin reg.'} • Macrociclo: ${macro}</span>
            </div>
            <span class="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg shadow">
                Gestionar →
            </span>
        </div>`;
    }).join('');
}

function bindEvents() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = async () => {
            showToast("Cerrando sesión...");
            await logoutSupabase();
            isProfLoggedIn = false;
            currentStudentId = null;
            localStorage.removeItem('fit_prof_logged_in');
            localStorage.removeItem('fit_active_student_id');
            renderApp();
            showToast("Sesión cerrada correctamente.");
        };
    }
}

// ==========================================
// 🌐 NAVEGACIÓN Y HANDLERS GLOBALES (100% SUPABASE)
// ==========================================
window.switchRelationalTab = function(tabName) {
    activeRelationalTab = tabName;
    renderApp();
};

window.deselectStudent = function() {
    currentStudentId = null;
    localStorage.removeItem('fit_active_student_id');
    renderApp();
};

window.selectStudentByProf = function(studentId) {
    if (!studentId || studentId === 'undefined') return;
    currentStudentId = studentId;
    localStorage.setItem('fit_active_student_id', studentId);
    renderApp();
};

window.filterProfStudentList = function(query) {
    const q = (query || '').trim().toLowerCase();
    const filtered = studentsDatabase.filter(s => {
        const fn = (s.firstname || '').toLowerCase();
        const ln = (s.lastname || '').toLowerCase();
        const dni = String(s.dni || '');
        return fn.includes(q) || ln.includes(q) || dni.includes(q);
    });
    const container = document.getElementById('prof-student-list-container');
    if (container) container.innerHTML = renderProfStudentListHTML(filtered);
};

window.registerNewStudentPrompt = async function() {
    const firstname = prompt("Nombre del Alumno:");
    if (!firstname) return;
    const lastname = prompt("Apellido del Alumno:");
    if (!lastname) return;
    const dni = prompt("DNI del Alumno:");
    if (!dni) return;

    const newStudent = {
        id: generateUUID(),
        studentNumber: studentsDatabase.length + 1,
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        dni: dni.trim(),
        datosAntropometricos: { peso: null, altura: null, grasa: null },
        historialLesiones: '',
        evaluacionInicial: '',
        macrociclo: { fase: 'Adaptación', objetivo: '' },
        mesociclo: { numeroSemanas: 4, semanaEnPreparacion: 1, enfoque: '' },
        microciclo: { diasPorSemana: 3 },
        microcicloByWeek: {},
        visibilitySettings: {},
        routine: {},
        draftRoutine: {},
        nutrition: { diet: '', supplements: '' },
        history: []
    };

    showToast("Registrando en Supabase...");
    await saveStudentDifferential(newStudent);
    studentsDatabase = await fetchStudentsFromSupabase();
    currentStudentId = newStudent.id;
    localStorage.setItem('fit_active_student_id', newStudent.id);
    showToast("¡Nuevo alumno registrado con éxito!");
    renderApp();
};

function loadStudentData(studentId) {
    const st = studentsDatabase.find(s => String(s.id) === String(studentId));
    if (!st) return;
    populateWeekSelectors(st.totalWeeks || 4);
    populateDaySelectors();
    renderExercises();
}

function populateWeekSelectors(totalWeeks = 4) {
    const container = document.getElementById('week-selector-container');
    if (!container) return;
    let html = '';
    for (let w = 1; w <= totalWeeks; w++) {
        const isActive = (w === selectedWeek);
        html += `
        <button onclick="window.selectWeek(${w})" class="px-3 py-1.5 rounded-xl text-xs font-black transition flex-shrink-0 ${isActive ? 'bg-amber-500 text-slate-950 shadow-lg' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'}">
            Sem ${w}
        </button>`;
    }
    container.innerHTML = html;
}

function populateDaySelectors() {
    const container = document.getElementById('day-selector-container');
    if (!container) return;
    let html = '';
    for (let d = 1; d <= 7; d++) {
        const isActive = (d === selectedDay);
        html += `
        <button onclick="window.selectDay(${d})" class="px-2.5 py-1 rounded-xl text-[11px] font-black transition flex-shrink-0 ${isActive ? 'bg-sky-500 text-slate-950 shadow-lg' : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'}">
            Día ${d}
        </button>`;
    }
    container.innerHTML = html;
}

function renderExercises() {
    const container = document.getElementById('exercise-list');
    if (!container) return;
    const st = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!st) return;
    const exercises = (st.routine && st.routine[selectedWeek] && st.routine[selectedWeek][selectedDay]) || [];
    if (exercises.length === 0) {
        container.innerHTML = `
        <div class="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-400">
            <i data-feather="calendar" class="w-8 h-8 text-amber-400 mx-auto mb-2"></i>
            <p class="text-xs">Sin ejercicios programados para el <strong>Día ${selectedDay}</strong> de la <strong>Semana ${selectedWeek}</strong>.</p>
        </div>`;
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }
    container.innerHTML = exercises.map(ex => createExerciseCardHTML(ex, true)).join('');
    if (typeof feather !== 'undefined') feather.replace();
}

function initTimeDropdowns() {
    const timeFields = ['modal-ex-exec', 'modal-ex-rep-rest', 'modal-ex-set-rest'];
    timeFields.forEach(field => {
        const minSelect = document.getElementById(`${field}-min`);
        const secSelect = document.getElementById(`${field}-sec`);
        if (minSelect) {
            let minOptions = '';
            for (let m = 0; m <= 30; m++) {
                const str = String(m).padStart(2, '0');
                minOptions += `<option value="${str}">${str}m</option>`;
            }
            minSelect.innerHTML = minOptions;
        }
        if (secSelect) {
            let secOptions = '';
            for (let s = 0; s < 60; s += 5) {
                const str = String(s).padStart(2, '0');
                secOptions += `<option value="${str}">${str}s</option>`;
            }
            secSelect.innerHTML = secOptions;
        }
    });
}

export function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'app-toast';
        toast.className = 'fixed bottom-16 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-xs font-black px-4 py-2.5 rounded-2xl shadow-2xl z-50 transition-all duration-300 opacity-0 pointer-events-none';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none');
    }, 2500);
}

window.selectWeek = function(w) {
    selectedWeek = w;
    populateWeekSelectors();
    renderExercises();
};

window.selectDay = function(d) {
    selectedDay = d;
    populateDaySelectors();
    renderExercises();
};

window.installPWA = async function() {
    if (!deferredPwaPrompt) return;
    deferredPwaPrompt.prompt();
    const { outcome } = await deferredPwaPrompt.userChoice;
    if (outcome === 'accepted') {
        deferredPwaPrompt = null;
        const banner = document.getElementById('pwa-install-banner');
        if (banner) banner.remove();
        showToast("¡Aplicación instalada!");
    }
};

window.saveFichaStudent = async function() {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    student.studentNumber = parseInt(document.getElementById('ficha-student-number')?.value) || 1;
    student.lastname = (document.getElementById('ficha-lastname')?.value || '').trim();
    student.firstname = (document.getElementById('ficha-firstname')?.value || '').trim();
    student.dni = (document.getElementById('ficha-dni')?.value || '').trim();
    student.datosAntropometricos = {
        peso: parseFloat(document.getElementById('ficha-peso')?.value) || null,
        altura: parseFloat(document.getElementById('ficha-altura')?.value) || null,
        grasa: parseFloat(document.getElementById('ficha-grasa')?.value) || null
    };
    student.historialLesiones = (document.getElementById('ficha-lesiones')?.value || '').trim();
    student.evaluacionInicial = (document.getElementById('ficha-evaluacion')?.value || '').trim();
    student.visibilitySettings = {
        ...student.visibilitySettings,
        antropometria: document.getElementById('vis-antropo')?.checked ?? true,
        lesiones: document.getElementById('vis-lesiones')?.checked ?? true,
        evaluacion: document.getElementById('vis-evaluacion')?.checked ?? true
    };

    showToast("Guardando cambios en la ficha...");
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast("¡Ficha del alumno actualizada!");
    renderApp();
};

window.saveMacrocicloStudent = async function() {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const selectEl = document.getElementById('macro-fase-select');
    const customInput = document.getElementById('macro-fase-custom');
    let fase = 'Adaptación';
    if (selectEl?.value === '__custom__') {
        fase = (customInput?.value || '').trim() || 'Fase Personalizada';
    } else {
        fase = selectEl?.value || 'Adaptación';
    }
    const objetivo = (document.getElementById('macro-objetivo')?.value || '').trim();
    const isVisibleMacro = document.getElementById('vis-macrociclo')?.checked ?? true;
    const isVisibleObjetivos = document.getElementById('vis-objetivos')?.checked ?? true;

    student.macrociclo = { fase, objetivo };
    student.cycleType = fase;
    student.visibilitySettings = {
        ...student.visibilitySettings,
        macrociclo: isVisibleMacro,
        objetivos: isVisibleObjetivos
    };

    showToast("Guardando Macrociclo...");
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast("¡Macrociclo actualizado con éxito!");
    renderApp();
};

window.handleMacroFaseChange = function(value) {
    const customInput = document.getElementById('macro-fase-custom');
    if (!customInput) return;
    if (value === '__custom__') {
        customInput.classList.remove('hidden');
        customInput.focus();
    } else {
        customInput.classList.add('hidden');
        customInput.value = '';
    }
};

window.setMesoWeeksPreset = function(weeks) {
    const input = document.getElementById('meso-weeks-input');
    if (input) {
        input.value = weeks;
        window.updatePrepWeeksDropdown();
    }
    document.querySelectorAll('.meso-week-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'border-amber-400', 'shadow-lg');
        btn.classList.add('bg-slate-950', 'text-slate-300', 'border-slate-800');
    });
    if (event && event.target) {
        event.target.classList.remove('bg-slate-950', 'text-slate-300', 'border-slate-800');
        event.target.classList.add('bg-amber-500', 'text-slate-950', 'border-amber-400', 'shadow-lg');
    }
};

window.saveMesocicloStudent = async function() {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const numWeeks = parseInt(document.getElementById('meso-weeks-input')?.value) || 4;
    const prepWeek = parseInt(document.getElementById('meso-prep-week-select')?.value) || 1;
    const enfoque = (document.getElementById('meso-enfoque-input')?.value || '').trim();
    const isVisibleMeso = document.getElementById('vis-mesociclo')?.checked ?? true;
    const isVisibleSemanaPrep = document.getElementById('vis-semana-prep')?.checked ?? true;
    const isVisibleEnfoque = document.getElementById('vis-enfoque-meso')?.checked ?? true;

    student.mesociclo = {
        numeroSemanas: numWeeks,
        semanaEnPreparacion: prepWeek,
        enfoque
    };
    student.totalWeeks = numWeeks;
    student.visibilitySettings = {
        ...student.visibilitySettings,
        mesociclo: isVisibleMeso,
        semanaEnPreparacion: isVisibleSemanaPrep,
        enfoqueMesociclo: isVisibleEnfoque
    };

    showToast("Guardando Mesociclo...");
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast("¡Mesociclo actualizado con éxito!");
    renderApp();
};

window.updatePrepWeeksDropdown = function() {
    const weeksInput = document.getElementById('meso-weeks-input');
    const prepSelect = document.getElementById('meso-prep-week-select');
    if (!weeksInput || !prepSelect) return;
    const totalWeeks = parseInt(weeksInput.value) || 4;
    const currentPrepVal = parseInt(prepSelect.value) || 1;
    let html = '';
    for (let w = 1; w <= totalWeeks; w++) {
        const isSelected = (w === currentPrepVal || (w === totalWeeks && currentPrepVal > totalWeeks));
        html += `<option value="${w}" ${isSelected ? 'selected' : ''}>Semana ${w} ${isSelected ? '(En Edición)' : ''}</option>`;
    }
    prepSelect.innerHTML = html;
};

window.setMicroDaysCount = function(count) {
    document.querySelectorAll('.micro-day-num-btn').forEach((btn, idx) => {
        if (idx + 1 === count) {
            btn.classList.remove('bg-slate-950', 'text-slate-400', 'border-slate-800');
            btn.classList.add('bg-amber-500', 'text-slate-950', 'border-amber-400', 'shadow-lg');
        } else {
            btn.classList.remove('bg-amber-500', 'text-slate-950', 'border-amber-400', 'shadow-lg');
            btn.classList.add('bg-slate-950', 'text-slate-400', 'border-slate-800');
        }
    });
};

window.toggleMicroDaySelection = function(btnEl, dayName) {
    if (!btnEl) return;
    const isSelected = btnEl.classList.contains('bg-sky-500');
    if (isSelected) {
        btnEl.classList.remove('bg-sky-500', 'text-slate-950', 'border-sky-400', 'shadow-md', 'font-black');
        btnEl.classList.add('bg-slate-950', 'text-slate-400', 'border-slate-800');
    } else {
        btnEl.classList.remove('bg-slate-950', 'text-slate-400', 'border-slate-800');
        btnEl.classList.add('bg-sky-500', 'text-slate-950', 'border-sky-400', 'shadow-md', 'font-black');
    }

    const activeChips = document.querySelectorAll('.micro-day-chip.bg-sky-500');
    const prepSelect = document.getElementById('micro-prep-day-select');
    if (prepSelect) {
        const currentVal = parseInt(prepSelect.value) || 1;
        let optionsHTML = '';
        activeChips.forEach((chip, idx) => {
            const dayNum = idx + 1;
            const dName = chip.getAttribute('data-day');
            const isSel = (dayNum === currentVal || (dayNum === activeChips.length && currentVal > activeChips.length));
            optionsHTML += `<option value="${dayNum}" ${isSel ? 'selected' : ''}>Día ${dayNum} - ${dName} ${isSel ? '(En Edición)' : ''}</option>`;
        });
        prepSelect.innerHTML = optionsHTML || `<option value="1">Día 1 (Sin días asignados)</option>`;
    }
};

window.handleMicroTipoChange = function(val) {
    const customInput = document.getElementById('micro-tipo-custom');
    if (!customInput) return;
    if (val === '__custom__') {
        customInput.classList.remove('hidden');
        customInput.focus();
    } else {
        customInput.classList.add('hidden');
        customInput.value = '';
    }
};

window.saveMicrocicloStudent = async function() {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const activeDayChips = document.querySelectorAll('.micro-day-chip.bg-sky-500');
    const diasAsignados = Array.from(activeDayChips).map(chip => chip.getAttribute('data-day'));
    const activeNumBtn = document.querySelector('.micro-day-num-btn.bg-amber-500');
    const diasPorSemana = activeNumBtn ? (parseInt(activeNumBtn.innerText) || diasAsignados.length) : (diasAsignados.length || 3);
    const prepDay = parseInt(document.getElementById('micro-prep-day-select')?.value) || 1;

    const selectEl = document.getElementById('micro-tipo-select');
    const customInput = document.getElementById('micro-tipo-custom');
    let tipoMicrociclo = 'Carga';
    if (selectEl?.value === '__custom__') {
        tipoMicrociclo = (customInput?.value || '').trim() || 'Tipo Personalizado';
    } else {
        tipoMicrociclo = selectEl?.value || 'Carga';
    }

    const observaciones = (document.getElementById('micro-obs-input')?.value || '').trim();
    const isVisibleMicro = document.getElementById('vis-microciclo')?.checked ?? true;
    const isVisibleDias = document.getElementById('vis-dias-semana')?.checked ?? true;
    const isVisibleDiaPrep = document.getElementById('vis-dia-prep')?.checked ?? true;

    const microData = {
        diasPorSemana,
        diasAsignados,
        diaEnPreparacion: prepDay,
        tipoMicrociclo,
        observaciones
    };

    student.microciclo = microData;
    if (!student.microcicloByWeek) student.microcicloByWeek = {};
    student.microcicloByWeek[prepWeek] = microData;
    student.visibilitySettings = {
        ...student.visibilitySettings,
        microciclo: isVisibleMicro,
        diasSemana: isVisibleDias,
        diaEnPreparacion: isVisibleDiaPrep
    };

    if (typeof showToast === 'function') showToast(`Guardando Microciclo de la Semana ${prepWeek}...`);
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    if (typeof showToast === 'function') showToast(`¡Microciclo de la Semana ${prepWeek} guardado con éxito!`);
    renderApp();
};

window.toggleDayVisibilityDirect = async function(week, day) {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const key = `semana_${week}_dia_${day}`;
    const currentVis = student.visibilitySettings?.[key] !== false;
    student.visibilitySettings = {
        ...student.visibilitySettings,
        [key]: !currentVis
    };
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast(`Día ${day} de Semana ${week}: ${!currentVis ? '👁️ Publicado' : '🔒 Oculto'}`);
    renderApp();
};

window.toggleWeekVisibilityDirect = async function(week) {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const key = `semana_${week}`;
    const currentVis = student.visibilitySettings?.[key] !== false;
    student.visibilitySettings = {
        ...student.visibilitySettings,
        [key]: !currentVis
    };
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast(`Semana ${week}: ${!currentVis ? '👁️ Publicada' : '🔒 Oculta'}`);
    renderApp();
};

const VIDEO_BANK_KEY = 'fit_video_bank';
export function getVideoBank() {
    try {
        const raw = localStorage.getItem(VIDEO_BANK_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

export async function saveToVideoBank(exerciseName, url) {
    if (!exerciseName || !url) return;
    const cleanKey = exerciseName.trim().toLowerCase();
    if (!cleanKey) return;
    const bank = getVideoBank();
    bank[cleanKey] = url.trim();
    try {
        localStorage.setItem(VIDEO_BANK_KEY, JSON.stringify(bank));
    } catch (e) {
        console.warn('Error guardando en LocalStorage:', e);
    }
    await syncVideoBankToSupabase(bank);
}

export async function loadAndSyncVideoBank() {
    const remoteBank = await fetchVideoBankFromSupabase();
    if (remoteBank && typeof remoteBank === 'object') {
        const localBank = getVideoBank();
        const mergedBank = { ...localBank, ...remoteBank };
        try {
            localStorage.setItem(VIDEO_BANK_KEY, JSON.stringify(mergedBank));
        } catch (e) {}
        return mergedBank;
    }
    return getVideoBank();
}

window.openAddExerciseModal = function(nextNum) {
    const modal = document.getElementById('exercise-entity-modal');
    if (!modal) return;
    const titleEl = document.getElementById('ex-modal-title');
    if (titleEl) {
        titleEl.innerHTML = `<i data-feather="plus-circle" class="w-4 h-4"></i> Cargar Ejercicio ${nextNum || 1} ('Todo en Uno')`;
        if (typeof feather !== 'undefined') feather.replace();
    }
    document.getElementById('ex-modal-id').value = '';
    document.getElementById('ex-modal-num').value = nextNum || 1;
    document.getElementById('ex-modal-num-display').value = nextNum || 1;
    document.getElementById('ex-modal-name').value = '';
    const catSelect = document.getElementById('ex-modal-category');
    if (catSelect) catSelect.value = 'Peso Libre';
    const catCustom = document.getElementById('ex-modal-category-custom');
    if (catCustom) {
        catCustom.value = '';
        catCustom.classList.add('hidden');
    }
    document.getElementById('ex-modal-media-url').value = '';
    document.getElementById('ex-modal-notes').value = '';
    const badge = document.getElementById('ex-modal-video-badge');
    if (badge) badge.classList.add('hidden');

    document.getElementById('ex-modal-series').value = 4;
    document.getElementById('ex-modal-tipo-serie').value = 'Normal';
    document.getElementById('ex-modal-set-rest').value = '90s';
    document.getElementById('ex-modal-block-rest').value = '120s';
    document.getElementById('ex-modal-reps').value = '8-12';
    const rpeSelect = document.getElementById('ex-modal-rpe-select');
    const rpeCustom = document.getElementById('ex-modal-rpe-custom');
    if (rpeSelect) rpeSelect.value = 'RPE 8 (Exigente / 2 reps en reserva)';
    if (rpeCustom) {
        rpeCustom.value = '';
        rpeCustom.classList.add('hidden');
    }
    document.getElementById('ex-modal-tempo').value = '3-0-1-0';
    document.getElementById('ex-modal-carga').value = '0';
    document.getElementById('ex-modal-rm').value = '75%';
    document.getElementById('ex-modal-progression').value = 'Lineal';
    modal.classList.remove('hidden');
};

window.handleExRpeSelectChange = function(value) {
    const customInput = document.getElementById('ex-modal-rpe-custom');
    if (!customInput) return;
    if (value === '__custom__') {
        customInput.classList.remove('hidden');
        customInput.focus();
    } else {
        customInput.classList.add('hidden');
        customInput.value = '';
    }
};

window.saveExerciseFromModal = async function() {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const microByW = (student.microcicloByWeek && student.microcicloByWeek[prepWeek]) || {};
    const prepDay = microByW.diaEnPreparacion || student.microciclo?.diaEnPreparacion || 1;

    const exId = document.getElementById('ex-modal-id')?.value;
    const exNum = parseInt(document.getElementById('ex-modal-num')?.value) || 1;
    const exName = (document.getElementById('ex-modal-name')?.value || '').trim();
    if (!exName) {
        showToast("Escribe el nombre del ejercicio.");
        return;
    }

    const rpeSelectVal = document.getElementById('ex-modal-rpe-select')?.value;
    const rpeCustomVal = (document.getElementById('ex-modal-rpe-custom')?.value || '').trim();
    let rpe = 'RPE 8 (Exigente / 2 reps en reserva)';
    if (rpeSelectVal === '__custom__') {
        rpe = rpeCustomVal || 'RPE Personalizado';
    } else {
        rpe = rpeSelectVal || '-';
    }

    const catSelect = document.getElementById('ex-modal-category')?.value;
    const catCustom = (document.getElementById('ex-modal-category-custom')?.value || '').trim();
    let category = catSelect === '__custom__' ? (catCustom || 'Personalizada') : (catSelect || 'Peso Libre');
    const mediaUrl = (document.getElementById('ex-modal-media-url')?.value || '').trim();
    const notes = (document.getElementById('ex-modal-notes')?.value || '').trim();
    const series = parseInt(document.getElementById('ex-modal-series')?.value) || 4;
    const tipoSerie = document.getElementById('ex-modal-tipo-serie')?.value || 'Normal';
    const setRest = (document.getElementById('ex-modal-set-rest')?.value || '').trim() || '90s';
    const blockRest = (document.getElementById('ex-modal-block-rest')?.value || '').trim() || '120s';
    const repeticiones = (document.getElementById('ex-modal-reps')?.value || '').trim() || '8-12';
    const tempo = (document.getElementById('ex-modal-tempo')?.value || '').trim() || '3-0-1-0';
    const cargaKg = (document.getElementById('ex-modal-carga')?.value || '').trim() || '0';
    const porcentajeRM = (document.getElementById('ex-modal-rm')?.value || '').trim() || '75%';
    const progression = document.getElementById('ex-modal-progression')?.value || 'Lineal';

    if (!student.routine) student.routine = {};
    if (!student.routine[prepWeek]) student.routine[prepWeek] = {};
    if (!student.routine[prepWeek][prepDay]) student.routine[prepWeek][prepDay] = [];

    const dayList = student.routine[prepWeek][prepDay];
    const exData = {
        exerciseNumber: exNum,
        name: exName,
        category,
        mediaUrl,
        notes,
        series,
        tipoSerie,
        setRest,
        blockRest,
        repeticiones,
        repsRange: repeticiones,
        rpe,
        tempo,
        cargaKg,
        porcentajeRM,
        progression,
        visible: true
    };

    if (exId) {
        const existingIdx = dayList.findIndex(e => String(e.id) === String(exId));
        if (existingIdx !== -1) {
            dayList[existingIdx] = { ...dayList[existingIdx], ...exData };
        }
    } else {
        dayList.push({
            id: 'ex_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            ...exData
        });
    }

    if (mediaUrl) {
        syncVideoBankToSupabase(exName, mediaUrl);
    }

    showToast(`Guardando ${exName}...`);
    window.closeExerciseModal();
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast(`¡${exName} guardado con éxito!`);
    renderApp();
};

window.editExerciseInModal = function(exId) {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const microByW = (student.microcicloByWeek && student.microcicloByWeek[prepWeek]) || {};
    const prepDay = microByW.diaEnPreparacion || student.microciclo?.diaEnPreparacion || 1;
    const routine = student.routine || {};
    const weekRoutine = routine[prepWeek] || {};
    const dayExercises = weekRoutine[prepDay] || [];
    const ex = dayExercises.find(e => String(e.id) === String(exId));
    if (!ex) return;

    const modal = document.getElementById('exercise-entity-modal');
    if (!modal) return;

    document.getElementById('ex-modal-id').value = ex.id || '';
    document.getElementById('ex-modal-num').value = ex.exerciseNumber || 1;
    document.getElementById('ex-modal-num-display').value = ex.exerciseNumber || 1;
    document.getElementById('ex-modal-name').value = ex.name || '';

    const rpePresets = [
        '-',
        'RPE 6 (Fácil / Calentamiento)',
        'RPE 7 (Moderado / 3 reps en reserva)',
        'RPE 8 (Exigente / 2 reps en reserva)',
        'RPE 9 (Muy exigente / 1 rep en reserva)',
        'RPE 10 (Fallo muscular / 0 reps en reserva)',
        'RIR 3',
        'RIR 2',
        'RIR 1',
        'RIR 0 (Fallo)'
    ];
    const rpeSelect = document.getElementById('ex-modal-rpe-select');
    const rpeCustom = document.getElementById('ex-modal-rpe-custom');
    const currentRpe = ex.rpe || 'RPE 8 (Exigente / 2 reps en reserva)';

    if (rpePresets.includes(currentRpe)) {
        if (rpeSelect) rpeSelect.value = currentRpe;
        if (rpeCustom) {
            rpeCustom.value = '';
            rpeCustom.classList.add('hidden');
        }
    } else {
        if (rpeSelect) rpeSelect.value = '__custom__';
        if (rpeCustom) {
            rpeCustom.value = currentRpe;
            rpeCustom.classList.remove('hidden');
        }
    }

    document.getElementById('ex-modal-series').value = ex.series || 4;
    document.getElementById('ex-modal-tipo-serie').value = ex.tipoSerie || 'Normal';
    document.getElementById('ex-modal-set-rest').value = ex.setRest || '90s';
    document.getElementById('ex-modal-block-rest').value = ex.blockRest || '120s';
    document.getElementById('ex-modal-reps').value = ex.repeticiones || ex.repsRange || '8-12';
    document.getElementById('ex-modal-tempo').value = ex.tempo || '3-0-1-0';
    document.getElementById('ex-modal-carga').value = ex.cargaKg !== undefined ? ex.cargaKg : '0';
    document.getElementById('ex-modal-rm').value = ex.porcentajeRM || '75%';
    document.getElementById('ex-modal-progression').value = ex.progression || 'Lineal';

    modal.classList.remove('hidden');
};

window.closeExerciseModal = function() {
    const modal = document.getElementById('exercise-entity-modal');
    if (modal) modal.classList.add('hidden');
};

window.deleteExerciseFromRoutine = async function(exerciseId) {
    if (!confirm("¿Deseas eliminar este ejercicio de la sesión?")) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    if (student.routine?.[prepWeek]?.[prepDay]) {
        student.routine[prepWeek][prepDay] = student.routine[prepWeek][prepDay].filter(e => String(e.id) !== String(exerciseId));
        await saveStudentDifferential(student);
        studentsDatabase = await fetchStudentsFromSupabase();
        showToast("Ejercicio eliminado.");
        renderApp();
    }
};

window.toggleExerciseVisibility = async function(exerciseId) {
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const dayList = student.routine?.[prepWeek]?.[prepDay] || [];
    const ex = dayList.find(e => String(e.id) === String(exerciseId));
    if (!ex) return;

    ex.visible = (ex.visible === false) ? true : false;
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast(`Ejercicio: ${ex.visible ? '👁️ Visible' : '🔒 Oculto'}`);
    renderApp();
};

window.quickUpdateExerciseProp = async function(exId, propName, value) {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const microByW = (student.microcicloByWeek && student.microcicloByWeek[prepWeek]) || {};
    const prepDay = microByW.diaEnPreparacion || student.microciclo?.diaEnPreparacion || 1;

    const dayList = student.routine?.[prepWeek]?.[prepDay] || [];
    const ex = dayList.find(e => String(e.id) === String(exId));
    if (!ex) return;

    if (propName === 'series') {
        ex[propName] = parseInt(value) || 4;
    } else if (propName === 'repeticiones') {
        ex.repeticiones = value;
        ex.repsRange = value;
    } else {
        ex[propName] = value;
    }

    showToast(`Actualizado: ${propName} = ${value}`);
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
};

window.setSeriesCountForEx = function(exId, count) {
    const input = document.getElementById(`series-count-input-${exId}`);
    if (input) input.value = count;
    document.querySelectorAll(`.series-count-btn-${exId}`).forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'border-amber-400', 'shadow-md');
        btn.classList.add('bg-slate-950', 'text-slate-400', 'border-slate-800');
    });
    if (event && event.target) {
        event.target.classList.remove('bg-slate-950', 'text-slate-400', 'border-slate-800');
        event.target.classList.add('bg-amber-500', 'text-slate-950', 'border-amber-400', 'shadow-md');
    }
};

window.setSeriesRestForEx = function(exId, restStr) {
    const customInput = document.getElementById(`series-rest-custom-${exId}`);
    if (customInput) customInput.value = restStr;
    document.querySelectorAll(`.series-rest-btn-${exId}`).forEach(btn => {
        btn.classList.remove('bg-sky-500', 'text-slate-950', 'border-sky-400', 'font-black', 'shadow');
        btn.classList.add('bg-slate-950', 'text-slate-400', 'border-slate-800');
    });
    if (event && event.target) {
        event.target.classList.remove('bg-slate-950', 'text-slate-400', 'border-slate-800');
        event.target.classList.add('bg-sky-500', 'text-slate-950', 'border-sky-400', 'font-black', 'shadow');
    }
};

window.saveSeriesStudent = async function() {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const dayList = student.routine?.[prepWeek]?.[prepDay] || [];
    if (dayList.length === 0) return;

    dayList.forEach(ex => {
        const exId = String(ex.id);
        const countInput = document.getElementById(`series-count-input-${exId}`);
        const tipoSelect = document.getElementById(`series-tipo-select-${exId}`);
        const restInput = document.getElementById(`series-rest-custom-${exId}`);
        const visCheck = document.getElementById(`vis-series-ex-${exId}`);
        if (countInput) ex.series = parseInt(countInput.value) || 3;
        if (tipoSelect) ex.tipoSerie = tipoSelect.value;
        if (restInput) ex.setRest = (restInput.value || '').trim() || '60s';
        if (visCheck) ex.visibleSeries = visCheck.checked;
    });

    const isVisibleSeriesGlobal = document.getElementById('vis-series-global')?.checked ?? true;
    student.visibilitySettings = {
        ...student.visibilitySettings,
        seriesGlobal: isVisibleSeriesGlobal
    };

    showToast("Guardando configuración de Series...");
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast("¡Series actualizadas exitosamente!");
    renderApp();
};

window.setRepsPresetForEx = function(exId, presetStr) {
    const input = document.getElementById(`reps-input-${exId}`);
    if (input) input.value = presetStr;
    document.querySelectorAll(`.reps-preset-btn-${exId}`).forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'border-amber-400', 'font-black', 'shadow');
        btn.classList.add('bg-slate-950', 'text-slate-400', 'border-slate-800');
    });
    if (event && event.target) {
        event.target.classList.remove('bg-slate-950', 'text-slate-400', 'border-slate-800');
        event.target.classList.add('bg-amber-500', 'text-slate-950', 'border-amber-400', 'font-black', 'shadow');
    }
};

window.setTempoPresetForEx = function(exId, tempoStr) {
    const input = document.getElementById(`reps-tempo-input-${exId}`);
    if (input) input.value = tempoStr;
    document.querySelectorAll(`.tempo-btn-${exId}`).forEach(btn => {
        btn.classList.remove('bg-sky-500', 'text-slate-950', 'border-sky-400', 'font-black', 'shadow');
        btn.classList.add('bg-slate-950', 'text-slate-400', 'border-slate-800');
    });
    if (event && event.target) {
        event.target.classList.remove('bg-slate-950', 'text-slate-400', 'border-slate-800');
        event.target.classList.add('bg-sky-500', 'text-slate-950', 'border-sky-400', 'font-black', 'shadow');
    }
};

window.saveRepeticionesStudent = async function() {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const dayList = student.routine?.[prepWeek]?.[prepDay] || [];
    if (dayList.length === 0) return;

    dayList.forEach(ex => {
        const exId = String(ex.id);
        const repsInput = document.getElementById(`reps-input-${exId}`);
        const rpeSelect = document.getElementById(`reps-rpe-select-${exId}`);
        const tempoInput = document.getElementById(`reps-tempo-input-${exId}`);
        const visCheck = document.getElementById(`vis-reps-ex-${exId}`);

        if (repsInput) {
            ex.repeticiones = (repsInput.value || '').trim() || '8-12';
            ex.repsRange = ex.repeticiones;
        }
        if (rpeSelect) ex.rpe = rpeSelect.value || '-';
        if (tempoInput) ex.tempo = (tempoInput.value || '').trim() || '0';
        if (visCheck) ex.visibleReps = visCheck.checked;
    });

    const isVisibleRepsGlobal = document.getElementById('vis-reps-global')?.checked ?? true;
    student.visibilitySettings = {
        ...student.visibilitySettings,
        repetitionGlobal: isVisibleRepsGlobal
    };

    showToast("Guardando configuración de Repeticiones...");
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast("¡Repeticiones actualizadas exitosamente!");
    renderApp();
};

window.setCargaPresetForEx = function(exId, valStr) {
    const input = document.getElementById(`carga-kg-input-${exId}`);
    if (input) input.value = valStr;
};

window.setRMPresetForEx = function(exId, rmStr) {
    const input = document.getElementById(`carga-rm-input-${exId}`);
    if (input) input.value = rmStr;
    document.querySelectorAll(`.rm-preset-btn-${exId}`).forEach(btn => {
        btn.classList.remove('bg-emerald-500', 'text-slate-950', 'border-emerald-400', 'font-black', 'shadow');
        btn.classList.add('bg-slate-950', 'text-slate-400', 'border-slate-800');
    });
    if (event && event.target) {
        event.target.classList.remove('bg-slate-950', 'text-slate-400', 'border-slate-800');
        event.target.classList.add('bg-emerald-500', 'text-slate-950', 'border-emerald-400', 'font-black', 'shadow');
    }
};

window.saveCargaStudent = async function() {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const dayList = student.routine?.[prepWeek]?.[prepDay] || [];
    if (dayList.length === 0) return;

    dayList.forEach(ex => {
        const exId = String(ex.id);
        const kgInput = document.getElementById(`carga-kg-input-${exId}`);
        const rmInput = document.getElementById(`carga-rm-input-${exId}`);
        const metodoSelect = document.getElementById(`carga-metodo-select-${exId}`);
        const notasInput = document.getElementById(`carga-notas-input-${exId}`);
        const visCheck = document.getElementById(`vis-carga-ex-${exId}`);

        if (kgInput) {
            ex.cargaKg = (kgInput.value || '').trim();
            ex.pesoKg = ex.cargaKg;
        }
        if (rmInput) ex.porcentajeRM = (rmInput.value || '').trim();
        if (metodoSelect) ex.metodoCarga = metodoSelect.value;
        if (notasInput) ex.notasCarga = (notasInput.value || '').trim();
        if (visCheck) ex.visibleCarga = visCheck.checked;
    });

    const isVisibleCargaGlobal = document.getElementById('vis-carga-global')?.checked ?? true;
    student.visibilitySettings = {
        ...student.visibilitySettings,
        cargaGlobal: isVisibleCargaGlobal
    };

    showToast("Guardando configuración de Cargas...");
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast("¡Cargas y Pesos actualizados exitosamente!");
    renderApp();
};

window.exportFullPDF = function() {
    if (!currentStudentId) {
        showToast("Selecciona un alumno primero.");
        return;
    }
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;
    showToast("Generando vista PDF...");
    generateFullRoutinePDF(student);
};

window.sendStudentAccess = async function() {
    if (!currentStudentId) {
        showToast("Selecciona un alumno primero.");
        return;
    }
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;
    let token = student.accessToken;
    if (!token) {
        showToast("Generando Token de acceso seguro...");
        token = await generateStudentAccessToken(student.id);
    }
    const appUrl = `${window.location.origin}/?token=${token}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(appUrl);
        showToast("¡Enlace Mágico copiado al portapapeles!");
    } else {
        prompt("Copia este enlace individual para el alumno:", appUrl);
    }
};

window.selectStudentPwaWeek = function(weekNum) {
    selectedWeek = weekNum;
    selectedDay = 1;
    renderApp();
};

window.selectStudentPwaDay = function(dayNum) {
    selectedDay = dayNum;
    renderApp();
};

window.handleExCategoryChange = function(value) {
    const customInput = document.getElementById('ex-modal-category-custom');
    if (!customInput) return;
    if (value === '__custom__') {
        customInput.classList.remove('hidden');
        customInput.focus();
    } else {
        customInput.classList.add('hidden');
        customInput.value = '';
    }
};

window.handleWeekChange = async function(newWeek) {
    if (!currentStudentId) return;
    showToast(`Cargando Semana ${newWeek} desde Supabase...`);
    studentsDatabase = await fetchStudentsFromSupabase();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const w = parseInt(newWeek) || 1;
    if (!student.mesociclo) student.mesociclo = {};
    student.mesociclo.semanaEnPreparacion = w;

    if (!student.microcicloByWeek) student.microcicloByWeek = {};
    if (!student.microcicloByWeek[w]) {
        student.microcicloByWeek[w] = {
            diasPorSemana: 0,
            diasAsignados: [],
            diaEnPreparacion: 1,
            tipoMicrociclo: 'Carga',
            observaciones: ''
        };
    }
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    renderApp();
};

window.handleDayChange = async function(newDay) {
    if (!currentStudentId) return;
    studentsDatabase = await fetchStudentsFromSupabase();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = parseInt(student.mesociclo?.semanaEnPreparacion) || 1;
    if (!student.microcicloByWeek) student.microcicloByWeek = {};
    if (!student.microcicloByWeek[prepWeek]) {
        student.microcicloByWeek[prepWeek] = {
            diasPorSemana: 0,
            diasAsignados: [],
            diaEnPreparacion: 1,
            tipoMicrociclo: 'Carga',
            observaciones: ''
        };
    }

    const d = parseInt(newDay) || 1;
    student.microcicloByWeek[prepWeek].diaEnPreparacion = d;
    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    renderApp();
};

window.toggleMicroDaySelectionAuto = async function(dayName) {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = parseInt(student.mesociclo?.semanaEnPreparacion) || 1;
    if (!student.microcicloByWeek) student.microcicloByWeek = {};
    if (!student.microcicloByWeek[prepWeek]) {
        student.microcicloByWeek[prepWeek] = {
            diasPorSemana: 0,
            diasAsignados: [],
            diaEnPreparacion: 1,
            tipoMicrociclo: 'Carga',
            observaciones: ''
        };
    }
    const wMicro = student.microcicloByWeek[prepWeek];
    let dias = Array.isArray(wMicro.diasAsignados) ? [...wMicro.diasAsignados] : [];

    if (dias.includes(dayName)) {
        dias = dias.filter(d => d !== dayName);
    } else {
        dias.push(dayName);
    }

    wMicro.diasAsignados = dias;
    wMicro.diasPorSemana = dias.length;
    if (wMicro.diaEnPreparacion > dias.length && dias.length > 0) {
        wMicro.diaEnPreparacion = 1;
    }

    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    renderApp();
};

window.saveMesocicloStudentAuto = async function() {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const numWeeks = parseInt(document.getElementById('meso-weeks-input')?.value) || 4;
    const prepWeek = parseInt(document.getElementById('meso-prep-week-select')?.value) || 1;
    const enfoque = (document.getElementById('meso-enfoque-input')?.value || '').trim();

    student.totalWeeks = numWeeks;
    student.mesociclo = {
        ...student.mesociclo,
        numeroSemanas: numWeeks,
        semanaEnPreparacion: prepWeek,
        enfoque
    };

    const isVisibleMeso = document.getElementById('vis-mesociclo')?.checked ?? true;
    const isVisibleSemanas = document.getElementById('vis-semanas-totales')?.checked ?? true;
    const isVisibleSemanaPrep = document.getElementById('vis-semana-prep')?.checked ?? true;

    student.visibilitySettings = {
        ...student.visibilitySettings,
        mesociclo: isVisibleMeso,
        semanasTotales: isVisibleSemanas,
        semanaEnPreparacion: isVisibleSemanaPrep
    };

    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    renderApp();
};

window.setMesoWeeksPresetAuto = async function(weeks) {
    const input = document.getElementById('meso-weeks-input');
    if (input) input.value = weeks;
    await window.saveMesocicloStudentAuto();
};

window.saveMicrocicloStudentAuto = async function() {
    if (!currentStudentId) return;
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = parseInt(student.mesociclo?.semanaEnPreparacion) || 1;
    if (!student.microcicloByWeek) student.microcicloByWeek = {};
    if (!student.microcicloByWeek[prepWeek]) {
        student.microcicloByWeek[prepWeek] = {
            diasPorSemana: 0,
            diasAsignados: [],
            diaEnPreparacion: 1,
            tipoMicrociclo: 'Carga',
            observaciones: ''
        };
    }

    const selectEl = document.getElementById('micro-tipo-select');
    const customInput = document.getElementById('micro-tipo-custom');
    let tipoMicrociclo = 'Carga';
    if (selectEl?.value === '__custom__') {
        tipoMicrociclo = (customInput?.value || '').trim() || 'Tipo Personalizado';
    } else {
        tipoMicrociclo = selectEl?.value || 'Carga';
    }

    const observaciones = (document.getElementById('micro-obs-input')?.value || '').trim();
    student.microcicloByWeek[prepWeek].tipoMicrociclo = tipoMicrociclo;
    student.microcicloByWeek[prepWeek].observaciones = observaciones;

    const isVisibleMicro = document.getElementById('vis-microciclo')?.checked ?? true;
    const isVisibleDias = document.getElementById('vis-dias-semana')?.checked ?? true;
    const isVisibleDiaPrep = document.getElementById('vis-dia-prep')?.checked ?? true;

    student.visibilitySettings = {
        ...student.visibilitySettings,
        microciclo: isVisibleMicro,
        diasSemana: isVisibleDias,
        diaEnPreparacion: isVisibleDiaPrep
    };

    await saveStudentDifferential(student);
    studentsDatabase = await fetchStudentsFromSupabase();
    renderApp();
};

window.handleMicroTipoChangeAuto = function(val) {
    const customInput = document.getElementById('micro-tipo-custom');
    if (customInput) {
        if (val === '__custom__') {
            customInput.classList.remove('hidden');
            customInput.focus();
        } else {
            customInput.classList.add('hidden');
            customInput.value = '';
            window.saveMicrocicloStudentAuto();
        }
    }
};

window.autoSuggestVideoLink = function(nameValue) {
    const mediaInput = document.getElementById('ex-modal-media-url');
    const badge = document.getElementById('ex-modal-video-badge');
    if (!mediaInput) return;
    const cleanKey = (nameValue || '').trim().toLowerCase();
    if (!cleanKey) {
        if (badge) badge.classList.add('hidden');
        return;
    }
    const bank = getVideoBank();
    if (bank[cleanKey]) {
        if (!mediaInput.value.trim() || mediaInput.dataset.autoFilled === 'true') {
            mediaInput.value = bank[cleanKey];
            mediaInput.dataset.autoFilled = 'true';
            if (badge) badge.classList.remove('hidden');
        }
    } else {
        if (mediaInput.dataset.autoFilled === 'true') {
            mediaInput.value = '';
            delete mediaInput.dataset.autoFilled;
        }
        if (badge) badge.classList.add('hidden');
    }
};

window.searchVideoInYouTube = function() {
    const nameInput = document.getElementById('ex-modal-name');
    const exerciseName = (nameInput?.value || '').trim();
    if (!exerciseName) {
        if (typeof showToast === 'function') showToast("Escribe primero el nombre del ejercicio para buscar su video.");
        if (nameInput) nameInput.focus();
        return;
    }
    const searchQuery = `${exerciseName} ejercicio entrenamiento`;
    const encodedQuery = encodeURIComponent(searchQuery);

    // 🟢 URL absoluta limpia con https:// explícito
    const p1 = 'you';
    const p2 = 'tube';
    const domain = `${p1}${p2}.com`;
    const ytUrl = `https://www.${domain}/results?search_query=${encodedQuery}`;

    const width = 480;
    const height = 660;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));

    window.open(
        ytUrl,
        'YouTubeVideoSearchPopup',
        `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
    );
};