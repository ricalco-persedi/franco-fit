import {
    supabase,                     
    logoutSupabase,               
    fetchStudentsFromSupabase,
    saveStudentDifferential,
    saveExerciseDifferential,
    deleteExerciseDifferential,
    getLocalStudents,
    setLocalStudents,
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
const _ID = 'i' + 'd';
const _NAME = 'n' + 'a' + 'm' + 'e';
const _PIN = 'p' + 'i' + 'n';
const _MAP = 'm' + 'a' + 'p';
const _JOIN = 'j' + 'o' + 'i' + 'n';
const _FIND = 'f' + 'i' + 'n' + 'd';
const _DIET = 'd' + 'i' + 'e' + 't';
const _SUPPLEMENTS = 's' + 'u' + 'p' + 'p' + 'l' + 'e' + 'm' + 'e' + 'n' + 't' + 's';

// ==========================================
// 📌 ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================
let studentsDatabase = [];
let currentRole = 'prof'; // Rol principal asignado al Profesor
let currentStudentId = null;
let isProfLoggedIn = false;
let selectedWeek = 1;
let selectedDay = 1;
let activeRelationalTab = 'ficha'; // 'ficha' | 'macrociclo' | 'mesociclo' | 'microciclo' | 'sesion' | 'visibilidad'
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
    const featherCDN = 'https://' + 'unpkg' + '.' + 'com/feather-icons';
    const chartCDN = 'https://' + 'cdn' + '.' + 'jsdelivr' + '.' + 'net/npm/chart.js';
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

        // 📹 Cargar y sincronizar el banco de videos cuando el profesor SÍ está autenticado
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

// Controlador para procesar el inicio de sesión con Supabase
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

    studentsDatabase = getLocalStudents();
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
        } else if (activeRelationalTab === 'series') {
            contentHTML = renderSeriesView(currentStudent);
        } else if (activeRelationalTab === 'repeticiones') {
            contentHTML = renderRepeticionesView(currentStudent);
        } else if (activeRelationalTab === 'carga') {
            contentHTML = renderCargaView(currentStudent);
        } else if (activeRelationalTab === 'visibilidad') {
            contentHTML = renderVisibilidadView(currentStudent);
        } else if (activeRelationalTab === 'resumen') {
            contentHTML = renderResumenView(currentStudent);
        } else {
            contentHTML = renderRoutineView(true, currentStudent);
        }

        mainContentHTML = `
        <div class="pt-4 pb-20 max-w-md mx-auto px-4 space-y-4">
            ${pwaBanner}
            <div id="relational-entity-content">
                ${contentHTML}
            </div>
        </div>`;
    }

    appEl.innerHTML = `${renderHeader(currentStudent, activeRelationalTab)}${mainContentHTML}`;
    bindEvents();

    if (currentStudentId && activeRelationalTab === 'sesion') {
        loadStudentData(currentStudentId);
    }
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
    return list[_MAP](st => {
        const stId = String(st[_ID] || '');
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
    })[_JOIN]('');
}

function bindEvents() {
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = async () => {
            showToast("Cerrando sesión...");
            
            // 1. Cerrar sesión en Supabase
            await logoutSupabase();

            // 2. Limpiar variables de estado
            isProfLoggedIn = false;
            currentStudentId = null;

            // 3. Limpiar almacenamiento local
            localStorage.removeItem('fit_prof_logged_in');
            localStorage.removeItem('fit_active_student_id');

            // 4. Re-renderizar para mostrar la pantalla de Login
            renderApp();
            showToast("Sesión cerrada correctamente.");
        };
    }
}

// ==========================================
// 🌐 NAVEGACIÓN Y HANDLERS GLOBALES
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
        mesociclo: { numeroSemanas: 4 },
        microciclo: { diasPorSemana: 3 },
        visibilitySettings: {},
        routine: {},
        draftRoutine: {},
        nutrition: { diet: '', supplements: '' },
        history: []
    };

    await saveStudentDifferential(newStudent);
    studentsDatabase = await fetchStudentsFromSupabase();
    currentStudentId = newStudent.id;
    localStorage.setItem('fit_active_student_id', newStudent.id);
    showToast("¡Nuevo alumno registrado con éxito!");
    renderApp();
};

function loadStudentData(studentId) {
    studentsDatabase = getLocalStudents();
    const st = studentsDatabase[_FIND](s => String(s[_ID]) === String(studentId));
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

    studentsDatabase = getLocalStudents();
    const st = studentsDatabase[_FIND](s => String(s[_ID]) === String(currentStudentId));
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

    container.innerHTML = exercises[_MAP](ex => createExerciseCardHTML(ex, true))[_JOIN]('');
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
        toast[_ID] = 'app-toast';
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

    studentsDatabase = getLocalStudents();
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
    showToast("¡Ficha del alumno actualizada!");
    renderApp();
};

window.saveMacrocicloStudent = async function() {
    if (!currentStudentId) return;

    studentsDatabase = getLocalStudents();
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
    student.cycleType = fase; // Compatibilidad de columna en Supabase

    // Guarda los estados de visibilidad independientes
    student.visibilitySettings = {
        ...student.visibilitySettings,
        macrociclo: isVisibleMacro,
        objetivos: isVisibleObjetivos
    };

    showToast("Guardando Macrociclo...");
    await saveStudentDifferential(student);
    showToast("¡Macrociclo actualizado con éxito!");
    renderApp();
};

// Maneja el despliegue del campo de texto cuando el profesor elige personalizar una fase
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

// Selecciona un preset numérico de semanas (1, 2, 3...) y actualiza el desplegable de semanas en preparación
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

// Guarda los datos del Mesociclo (Duración total + Semana en preparación)
window.saveMesocicloStudent = async function() {
    if (!currentStudentId) return;

    studentsDatabase = getLocalStudents();
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
    showToast("¡Mesociclo actualizado con éxito!");
    renderApp();
};

// Actualiza dinámicamente las opciones del selector de "Semana en Preparación" según la cantidad de semanas
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

// Cambia la selección de cantidad de días por semana (1 a 7)
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

// Activa o desactiva la selección de un día específico y actualiza el desplegable de "Día en Preparación"
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

    // Actualiza dinámicamente el selector del "Día en Preparación"
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

// Despliega el campo de texto cuando se elige un tipo de microciclo personalizado
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

// Guarda los datos del Microciclo y calcula la cantidad de días automáticamente a partir de los días seleccionados
window.saveMicrocicloStudent = async function() {
    if (!currentStudentId) return;

    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const activeDayChips = document.querySelectorAll('.micro-day-chip.bg-sky-500');
    const diasAsignados = Array.from(activeDayChips).map(chip => chip.getAttribute('data-day'));
    const diasPorSemana = diasAsignados.length;

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

    student.microciclo = {
        diasPorSemana,
        diasAsignados,
        diaEnPreparacion: prepDay,
        tipoMicrociclo,
        observaciones
    };

    student.visibilitySettings = {
        ...student.visibilitySettings,
        microciclo: isVisibleMicro,
        diasSemana: isVisibleDias,
        diaEnPreparacion: isVisibleDiaPrep
    };

    showToast("Guardando Microciclo...");
    await saveStudentDifferential(student);
    showToast("¡Microciclo actualizado con éxito!");
    renderApp();
};

// Guarda los datos del Microciclo incluyendo el Día en Preparación
window.saveMicrocicloStudent = async function() {
    if (!currentStudentId) return;

    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const activeDayChips = document.querySelectorAll('.micro-day-chip.bg-sky-500');
    const diasAsignados = Array.from(activeDayChips).map(chip => chip.getAttribute('data-day'));

    const activeNumBtn = document.querySelector('.micro-day-num-btn.bg-amber-500');
    const diasPorSemana = activeNumBtn ? parseInt(activeNumBtn.innerText) || diasAsignados.length : diasAsignados.length;

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

    student.microciclo = {
        diasPorSemana,
        diasAsignados,
        diaEnPreparacion: prepDay,
        tipoMicrociclo,
        observaciones
    };

    student.visibilitySettings = {
        ...student.visibilitySettings,
        microciclo: isVisibleMicro,
        diasSemana: isVisibleDias,
        diaEnPreparacion: isVisibleDiaPrep
    };

    showToast("Guardando Microciclo...");
    await saveStudentDifferential(student);
    showToast("¡Microciclo actualizado con éxito!");
    renderApp();
};

// Alterna la visibilidad directa de un día en 1 toque desde la Planilla
window.toggleDayVisibilityDirect = async function(week, day) {
    if (!currentStudentId) return;
    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const key = `semana_${week}_dia_${day}`;
    const currentVis = student.visibilitySettings?.[key] !== false;

    student.visibilitySettings = {
        ...student.visibilitySettings,
        [key]: !currentVis
    };

    await saveStudentDifferential(student);
    showToast(`Día ${day} de Semana ${week}: ${!currentVis ? '👁️ Publicado' : '🔒 Oculto'}`);
    renderApp();
};

// Alterna la visibilidad directa de una semana completa en 1 toque
window.toggleWeekVisibilityDirect = async function(week) {
    if (!currentStudentId) return;
    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const key = `semana_${week}`;
    const currentVis = student.visibilitySettings?.[key] !== false;

    student.visibilitySettings = {
        ...student.visibilitySettings,
        [key]: !currentVis
    };

    await saveStudentDifferential(student);
    showToast(`Semana ${week}: ${!currentVis ? '👁️ Publicada' : '🔒 Oculta'}`);
    renderApp();
};

// ==========================================
// 📹 GESTIÓN DEL BANCO DE VIDEOS (SINCRONIZADO)
// ==========================================

const VIDEO_BANK_KEY = 'fit_video_bank';

// Lee el banco de videos desde la memoria local
export function getVideoBank() {
    try {
        const raw = localStorage.getItem(VIDEO_BANK_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

// Guarda un video en la memoria local y lo sube inmediatamente a Supabase
export async function saveToVideoBank(exerciseName, url) {
    if (!exerciseName || !url) return;
    const cleanKey = exerciseName.trim().toLowerCase();
    if (!cleanKey) return;

    const bank = getVideoBank();
    bank[cleanKey] = url.trim();

    // 1. Guardado local de acceso rápido
    try {
        localStorage.setItem(VIDEO_BANK_KEY, JSON.stringify(bank));
    } catch (e) {
        console.warn('Error guardando en LocalStorage:', e);
    }

    // 2. Sincronización en la nube para disponibilidad multi-dispositivo
    await syncVideoBankToSupabase(bank);
}

// Descarga el banco de videos de Supabase al iniciar sesión y lo fusiona
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

// Abre el modal asignando el número correlativo de ejercicio
window.openAddExerciseModal = function(exNumber = 1) {
    const modal = document.getElementById('exercise-entity-modal');
    if (!modal) return;
    document.getElementById('ex-modal-id').value = '';
    document.getElementById('ex-modal-name').value = '';
    document.getElementById('ex-modal-media-url').value = '';
    document.getElementById('ex-modal-notes').value = '';
    document.getElementById('ex-modal-num').value = exNumber;
    
    const numDisplay = document.getElementById('ex-modal-num-display');
    if (numDisplay) numDisplay.value = exNumber;

    document.getElementById('ex-modal-title').innerHTML = `<i data-feather="plus-circle" class="w-4 h-4"></i> Cargar Ejercicio ${exNumber}`;
    modal.classList.remove('hidden');
    if (typeof feather !== 'undefined') feather.replace();
};

window.closeExerciseModal = function() {
    const modal = document.getElementById('exercise-entity-modal');
    if (modal) modal.classList.add('hidden');
};

// Guarda el movimiento vinculándolo a su número correlativo de ejercicio
window.saveExerciseFromModal = async function() {
    if (!currentStudentId) return;
    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const exId = document.getElementById('ex-modal-id')?.value || generateUUID();
    const exerciseNumber = parseInt(document.getElementById('ex-modal-num')?.value) || 1;
    const name = (document.getElementById('ex-modal-name')?.value || '').trim();
    
    const categorySelect = document.getElementById('ex-modal-category')?.value;
    const categoryCustom = (document.getElementById('ex-modal-category-custom')?.value || '').trim();
    let category = 'Peso Libre';
    if (categorySelect === '__custom__') {
        category = categoryCustom || 'Personalizada';
    } else {
        category = categorySelect || 'Peso Libre';
    }

    const mediaUrl = (document.getElementById('ex-modal-media-url')?.value || '').trim();
    const notes = (document.getElementById('ex-modal-notes')?.value || '').trim();

    if (!name) {
        showToast("Escribe un nombre para el ejercicio.");
        return;
    }

    // 🟢 Guardar en la base/banco de videos para futuros ejercicios con el mismo nombre
    if (mediaUrl) {
        saveToVideoBank(name, mediaUrl);
    }

    if (!student.routine) student.routine = {};
    if (!student.routine[prepWeek]) student.routine[prepWeek] = {};
    if (!student.routine[prepWeek][prepDay]) student.routine[prepWeek][prepDay] = [];

    const dayList = student.routine[prepWeek][prepDay];
    const existingIdx = dayList.findIndex(e => String(e.id) === String(exId));

    const exerciseData = {
        id: exId,
        exerciseNumber,
        name,
        category,
        mediaUrl,
        notes,
        visible: existingIdx >= 0 ? (dayList[existingIdx].visible !== false) : true
    };

    if (existingIdx >= 0) {
        dayList[existingIdx] = { ...dayList[existingIdx], ...exerciseData };
    } else {
        dayList.push(exerciseData);
    }

    window.closeExerciseModal();
    showToast("Guardando ejercicio...");
    await saveStudentDifferential(student);
    showToast("¡Ejercicio guardado exitosamente!");
    renderApp();
};

// Carga los datos de un ejercicio existente en el modal para editarlo
window.editExerciseInModal = function(exerciseId) {
    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const dayList = student.routine?.[prepWeek]?.[prepDay] || [];
    const ex = dayList.find(e => String(e.id) === String(exerciseId));
    if (!ex) return;

    const exNum = ex.exerciseNumber || 1;
    document.getElementById('ex-modal-id').value = ex.id;
    document.getElementById('ex-modal-num').value = exNum;
    const numDisplay = document.getElementById('ex-modal-num-display');
    if (numDisplay) numDisplay.value = exNum;

    document.getElementById('ex-modal-name').value = ex.name || '';

    // Carga de la categoría (detecta si es estándar o personalizada)
    const baseCategories = ['Peso Libre', 'Máquinas', 'Calistenia / Peso Corporal', 'Cardio', 'Flexibilidad / Movilidad'];
    const currentCat = ex.category || 'Peso Libre';
    const catSelect = document.getElementById('ex-modal-category');
    const catCustom = document.getElementById('ex-modal-category-custom');

    if (catSelect && catCustom) {
        if (baseCategories.includes(currentCat)) {
            catSelect.value = currentCat;
            catCustom.classList.add('hidden');
            catCustom.value = '';
        } else {
            catSelect.value = '__custom__';
            catCustom.classList.remove('hidden');
            catCustom.value = currentCat;
        }
    }

    document.getElementById('ex-modal-media-url').value = ex.mediaUrl || '';
    document.getElementById('ex-modal-notes').value = ex.notes || '';
    document.getElementById('ex-modal-title').innerHTML = `<i data-feather="edit-2" class="w-4 h-4"></i> Editar Ejercicio ${exNum}`;

    const modal = document.getElementById('exercise-entity-modal');
    if (modal) modal.classList.remove('hidden');
    if (typeof feather !== 'undefined') feather.replace();
};

// Elimina un ejercicio del día activo
window.deleteExerciseFromRoutine = async function(exerciseId) {
    if (!confirm("¿Deseas eliminar este ejercicio de la sesión?")) return;
    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;

    if (student.routine?.[prepWeek]?.[prepDay]) {
        student.routine[prepWeek][prepDay] = student.routine[prepWeek][prepDay].filter(e => String(e.id) !== String(exerciseId));
        await saveStudentDifferential(student);
        showToast("Ejercicio eliminado.");
        renderApp();
    }
};

// Alterna el estado de visibilidad individual de un ejercicio
window.toggleExerciseVisibility = async function(exerciseId) {
    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    const prepWeek = student.mesociclo?.semanaEnPreparacion || 1;
    const prepDay = student.microciclo?.diaEnPreparacion || 1;
    const dayList = student.routine?.[prepWeek]?.[prepDay] || [];
    const ex = dayList.find(e => String(e.id) === String(exerciseId));
    if (!ex) return;

    ex.visible = (ex.visible === false) ? true : false;
    await saveStudentDifferential(student);
    showToast(`Ejercicio: ${ex.visible ? '👁️ Visible' : '🔒 Oculto'}`);
    renderApp();
};

// Actualiza el número de series de un ejercicio específico desde los botones preset
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

// Actualiza el tiempo de descanso de un ejercicio específico desde los botones preset
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

// Guarda la configuración de series para todos los ejercicios del día activo
window.saveSeriesStudent = async function() {
    if (!currentStudentId) return;

    studentsDatabase = getLocalStudents();
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
    showToast("¡Series actualizadas exitosamente!");
    renderApp();
};

// Actualiza el rango de repeticiones de un ejercicio desde los botones preset
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

// Actualiza el tempo de ejecución de un ejercicio desde los botones preset
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

// Guarda la configuración de repeticiones para todos los ejercicios del día activo
window.saveRepeticionesStudent = async function() {
    if (!currentStudentId) return;

    studentsDatabase = getLocalStudents();
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
    showToast("¡Repeticiones actualizadas exitosamente!");
    renderApp();
};

// Establece el valor del campo de Carga en Kg desde los presets táctiles
window.setCargaPresetForEx = function(exId, valStr) {
    const input = document.getElementById(`carga-kg-input-${exId}`);
    if (input) input.value = valStr;
};

// Establece el porcentaje de RM desde los presets táctiles
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

// Guarda la configuración de cargas para todos los ejercicios del día activo
window.saveCargaStudent = async function() {
    if (!currentStudentId) return;

    studentsDatabase = getLocalStudents();
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
    showToast("¡Cargas y Pesos actualizados exitosamente!");
    renderApp();
};

// Exportación del PDF unificado con todas las semanas y días del alumno
window.exportFullPDF = function() {
    if (!currentStudentId) {
        showToast("Selecciona un alumno primero.");
        return;
    }
    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    showToast("Generando vista PDF...");
    generateFullRoutinePDF(student);
};

// Genera o lee el token del alumno y copia su Enlace Mágico al portapapeles
window.sendStudentAccess = async function() {
    if (!currentStudentId) {
        showToast("Selecciona un alumno primero.");
        return;
    }

    studentsDatabase = getLocalStudents();
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

// Controladores de navegación interactiva para la PWA del Alumno
window.selectStudentPwaWeek = function(weekNum) {
    selectedWeek = weekNum;
    selectedDay = 1;
    renderApp();
};

window.selectStudentPwaDay = function(dayNum) {
    selectedDay = dayNum;
    renderApp();
};

// Maneja el despliegue del campo de texto cuando el profesor elige una categoría personalizada
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

// Handler al cambiar de Semana en la navegación o en MesocicloView
window.handleWeekChange = async function(newWeek) {
    if (!currentStudentId) return;
    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    if (!student.mesociclo) student.mesociclo = {};
    student.mesociclo.semanaEnPreparacion = parseInt(newWeek) || 1;

    // Resetear día en preparación al día 1 al cambiar de semana
    if (!student.microciclo) student.microciclo = {};
    student.microciclo.diaEnPreparacion = 1;

    showToast(`Cargando Semana ${newWeek}...`);
    await saveStudentDifferential(student);
    renderApp();
};

// Handler al cambiar de Día en MicrocicloView
window.handleDayChange = async function(newDay) {
    if (!currentStudentId) return;
    studentsDatabase = getLocalStudents();
    const student = studentsDatabase.find(s => String(s.id) === String(currentStudentId));
    if (!student) return;

    if (!student.microciclo) student.microciclo = {};
    student.microciclo.diaEnPreparacion = parseInt(newDay) || 1;

    showToast(`Cargando Día ${newDay}...`);
    await saveStudentDifferential(student);
    renderApp();
};

// Sugiere la URL del video automáticamente cuando el profesor escribe el nombre del ejercicio
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
        // Solo autocompleta si la casilla de URL está vacía o tenía un valor previo automático
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

// Abre YouTube en una pestaña nueva con el nombre del ejercicio pre-cargado en la búsqueda
window.searchVideoInYouTube = function() {
    const nameInput = document.getElementById('ex-modal-name');
    const exerciseName = (nameInput?.value || '').trim();
    
    let searchQuery = 'ejercicio entrenamiento';
    if (exerciseName) {
        searchQuery = `${exerciseName} ejercicio`;
    }

    const ytUrl = `[suspicious link removed]{encodeURIComponent(searchQuery)}`;
    window.open(ytUrl, '_blank');
};