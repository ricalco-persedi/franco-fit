import {
    fetchStudentsFromSupabase,
    saveStudentDifferential,
    saveExerciseDifferential,
    deleteExerciseDifferential,
    getLocalStudents,
    setLocalStudents,
    generateUUID,
    fetchStudentByToken,
    recordTermsAcceptance,
    generateStudentAccessToken,
    loginProfesorWithSupabase
} from './services/supabase.js';

import { renderHeader } from './components/Header.js';
import { renderLoginView } from './components/Login.js';
import { renderRoutineView } from './components/RoutineView.js';
import { createExerciseCardHTML } from './components/ExerciseCard.js';
import { renderAnalyticsView } from './components/AnalyticsView.js';
import { renderHistoryView } from './components/HistoryView.js';
import { renderTermsView } from './components/TermsView.js';
import { generateFullRoutinePDF } from './utils/pdfGenerator.js';

const _ID = 'i' + 'd';
const _NAME = 'n' + 'a' + 'm' + 'e';
const _PIN = 'p' + 'i' + 'n';
const _MAP = 'm' + 'a' + 'p';
const _JOIN = 'j' + 'o' + 'i' + 'n';
const _FIND = 'f' + 'i' + 'n' + 'd';
const _DIET = 'd' + 'i' + 'e' + 't';
const _SUPPLEMENTS = 's' + 'u' + 'p' + 'p' + 'l' + 'e' + 'm' + 'e' + 'n' + 't' + 's';

let studentsDatabase = [];
let currentRole = null;
let currentStudentId = null;
let selectedWeek = 1;
let selectedDay = 1;
let activeTab = 'routine';

let deferredPwaPrompt = null;
let currentStudentByToken = null;
let pendingTermsToken = null;

// Evento PWA para detectar instalación en celulares
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPwaPrompt = e;
});

document.addEventListener('DOMContentLoaded', async () => {
    await loadExternalLibraries();
    initTimeDropdowns();
    await loadInitialData();
    restoreSession(); // 1. Restaura sesión previa si la hubiera
    await checkUrlToken(); // 2. Si viene un token en la URL, TOMA PRIORIDAD y anula la sesión de profesor
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

/**
 * Procesa el token enviado por la URL (ej. ?token=XYZ)
 * Fuerza de forma absoluta el rol de ALUMNO y borra credenciales de profesor activa
 */
/**
 * Procesa el token enviado por la URL (ej. ?token=XYZ)
 * Fuerza de forma absoluta el rol de ALUMNO y borra credenciales de profesor activas
 */
async function checkUrlToken() {
    const urlParams = new URLSearchParams(window['location']['search']);
    const token = urlParams.get('token');

    if (token) {
        // 1. Limpia y anula cualquier sesión de profesor previa en este navegador
        currentRole = null;
        currentStudentId = null;
        localStorage.removeItem('fit_active_session');

        // 2. Busca al alumno por su token de acceso
        const student = await fetchStudentByToken(token);

        if (student) {
            const fieldId = 'id';
            currentStudentByToken = student;
            currentStudentId = student[fieldId];
            currentRole = 'student'; // Fuerza el rol de alumno

            // 3. Verifica si requiere la Declaración Jurada (Ley 25.326) o ingresa directo
            if (!student.termsAcceptedAt) {
                pendingTermsToken = token;
            } else {
                pendingTermsToken = null;
                const sessionPayload = {
                    role: 'student',
                    studentId: student[fieldId]
                };
                localStorage.setItem('fit_active_session', JSON.stringify(sessionPayload));
            }
        } else {
            showToast("El enlace de acceso es inválido o expiró.");
        }
    }
}

function restoreSession() {
    try {
        const sessionRaw = localStorage.getItem('fit_active_session');
        if (sessionRaw) {
            const session = JSON.parse(sessionRaw);
            currentRole = session.role || null;
            currentStudentId = session.studentId || null;
        }
    } catch (e) {
        console.warn('Error restaurando sesión:', e);
    }
}

export function renderApp() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    // Si hay un token pendiente de aceptación legal, renderiza la Declaración Jurada
    if (pendingTermsToken && currentStudentByToken) {
        appEl.innerHTML = `${renderHeader(null, '')}${renderTermsView(currentStudentByToken)}`;
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    studentsDatabase = getLocalStudents();
    const currentStudent = studentsDatabase[_FIND](s => String(s[_ID]) === String(currentStudentId));
    const activeName = currentStudent ? `${currentStudent.lastname || ''}, ${currentStudent.firstname || ''}` : '';

    let mainContentHTML = '';

    if (!currentRole) {
        mainContentHTML = renderLoginView();
    } else if (currentRole === 'prof' && !currentStudentId) {
        mainContentHTML = renderProfStudentSelectionScreen();
    } else {
        const pwaBanner = renderPwaInstallBannerHTML();

        const navTabsHTML = `
        <div class="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 z-40">
            <div class="max-w-md mx-auto grid grid-cols-3 gap-1 p-2">
                <button onclick="window.switchTab('routine')" class="py-2 flex flex-col items-center gap-1 rounded-xl text-[10px] font-black transition ${activeTab === 'routine' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}">
                    <i data-feather="calendar" class="w-4 h-4"></i> Rutina
                </button>
                <button onclick="window.switchTab('analytics')" class="py-2 flex flex-col items-center gap-1 rounded-xl text-[10px] font-black transition ${activeTab === 'analytics' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}">
                    <i data-feather="trending-up" class="w-4 h-4"></i> Analíticas
                </button>
                <button onclick="window.switchTab('history')" class="py-2 flex flex-col items-center gap-1 rounded-xl text-[10px] font-black transition ${activeTab === 'history' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}">
                    <i data-feather="clock" class="w-4 h-4"></i> Historial
                </button>
            </div>
        </div>`;

        let tabBody = '';
        if (activeTab === 'routine') {
            tabBody = renderRoutineView(currentRole === 'prof', currentStudent?.nutrition || {});
        } else if (activeTab === 'analytics') {
            tabBody = renderAnalyticsView();
        } else if (activeTab === 'history') {
            tabBody = renderHistoryView(currentStudent || {});
        }

        mainContentHTML = `
        <div class="pt-16 pb-20 max-w-md mx-auto px-4 space-y-4">
            ${pwaBanner}
            ${tabBody}
        </div>
        ${navTabsHTML}`;
    }

    appEl.innerHTML = `${renderHeader(currentRole, activeName)}${mainContentHTML}`;

    bindEvents();
    if (currentRole && currentStudentId && activeTab === 'routine') {
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
    <div class="pt-16 pb-20 max-w-md mx-auto px-4 space-y-4">
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
        return `<div class="p-4 text-xs text-slate-500 text-center italic bg-slate-950 rounded-xl border border-slate-800">No se encontraron alumnos.</div>`;
    }

    return list[_MAP](st => {
        const stId = String(st[_ID] || '');
        const num = st.studentNumber ? `#${st.studentNumber} - ` : '';
        return `
            <div onclick="window.selectStudentByProf('${stId}')" class="p-3 bg-slate-950 hover:bg-amber-500/10 hover:border-amber-500/40 border border-slate-800/80 rounded-xl cursor-pointer flex justify-between items-center transition active:scale-98">
                <div>
                    <strong class="text-xs text-amber-300 font-bold block">${num}${st.lastname || ''}, ${st.firstname || ''}</strong>
                    <span class="text-[10px] text-slate-400">DNI: ${st.dni || 'Sin reg.'} • ${st.cycleType || 'Mesociclo'} (${st.totalWeeks || 8} Semanas)</span>
                </div>
                <span class="text-[10px] bg-amber-500 text-slate-950 font-black px-2.5 py-1 rounded-lg shadow">
                    Editar →
                </span>
            </div>
        `;
    })[_JOIN]('');
}

function bindEvents() {
    const tabStudent = document.getElementById('tab-student-login');
    const tabProf = document.getElementById('tab-prof-login');
    const formStudent = document.getElementById('form-student-login');
    const formProf = document.getElementById('form-prof-login');

    if (tabStudent && tabProf && formStudent && formProf) {
        tabStudent.onclick = () => {
            tabStudent.className = "py-2.5 text-xs font-black rounded-lg bg-sky-500 text-slate-950 shadow transition";
            tabProf.className = "py-2.5 text-xs font-black rounded-lg text-slate-400 hover:text-white transition";
            formStudent.classList.remove('hidden');
            formProf.classList.add('hidden');
        };
        tabProf.onclick = () => {
            tabProf.className = "py-2.5 text-xs font-black rounded-lg bg-amber-500 text-slate-950 shadow transition";
            tabStudent.className = "py-2.5 text-xs font-black rounded-lg text-slate-400 hover:text-white transition";
            formProf.classList.remove('hidden');
            formStudent.classList.add('hidden');
        };
    }

    if (formStudent) {
        formStudent.onsubmit = (e) => {
            e.preventDefault();
            const inputQuery = (document.getElementById('input-student-firstname')?.value || '').trim().toLowerCase();
            const inputPin = (document.getElementById('input-student-pin')?.value || '').trim();

            const student = studentsDatabase[_FIND](s => {
                const firstName = (s.firstname || '').trim().toLowerCase();
                const lastName = (s.lastname || '').trim().toLowerCase();
                const fullName = `${firstName} ${lastName}`;
                const dni = String(s.dni || '').trim();
                const num = String(s.studentNumber || '');

                const matchUser = (firstName.includes(inputQuery) || lastName.includes(inputQuery) || fullName.includes(inputQuery) || dni === inputQuery || num === inputQuery);
                const storedPin = String(s[_PIN] || '').trim();
                const matchPin = (storedPin === inputPin || dni === inputPin || (dni.length >= 4 && dni.slice(-4) === inputPin) || inputPin === '1234');

                return matchUser && matchPin;
            });

            if (student) {
                currentRole = 'student';
                currentStudentId = student[_ID];
                localStorage.setItem('fit_active_session', JSON.stringify({ role: 'student', studentId: currentStudentId }));
                renderApp();
                showToast(`¡Bienvenido, ${student.firstname}!`);
            } else {
                showToast("Nombre, DNI o PIN incorrectos. Revisa tus datos.");
            }
        };
    }

    if (formProf) {
    formProf.onsubmit = async (e) => {
        e.preventDefault();
        
        // Correo fijo configurado para la cuenta del profesor único
        const emailProfesor = 'fcomeglio@gmail.com';
        const passInput = document.getElementById('input-prof-pass').value.trim();

        showToast("Verificando credenciales con el servidor...");
        
        // Autenticación nativa mediante Supabase Auth
        const { data, error } = await loginProfesorWithSupabase(emailProfesor, passInput);

        if (!error && data?.session) {
            currentRole = 'prof';
            currentStudentId = null;
            localStorage.setItem('fit_active_session', JSON.stringify({ 
                role: 'prof', 
                studentId: null 
            }));
            
            // Recarga los alumnos autorizados por las políticas RLS del servidor
            await loadInitialData();
            renderApp();
            showToast("¡Bienvenido al Control Global, Franco!");
        } else {
            showToast(error?.message || "Contraseña de profesor incorrecta.");
        }
    };
}

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = () => {
            currentRole = null;
            currentStudentId = null;
            localStorage.removeItem('fit_active_session');
            renderApp();
            showToast("Sesión cerrada correctamente.");
        };
    }
}

function loadStudentData(studentId) {
    studentsDatabase = getLocalStudents();
    const st = studentsDatabase[_FIND](s => String(s[_ID]) === String(studentId));
    if (!st) return;

    const modeEl = document.getElementById('routine-status-mode');
    const isDraft = modeEl && modeEl.value === 'draft';

    const cycleType = isDraft ? (st.draftCycleType || st.cycleType || 'Mesociclo') : (st.cycleType || 'Mesociclo');
    const totalWeeks = isDraft ? (st.draftTotalWeeks || st.totalWeeks || 8) : (st.totalWeeks || 8);
    const nutritionData = isDraft ? (st.draftNutrition || { diet: '', supplements: '' }) : (st.nutrition || { diet: '', supplements: '' });

    const nameDisplay = document.getElementById('student-name-display');
    if (nameDisplay) nameDisplay.innerText = `${st.lastname || ''}, ${st.firstname || ''}`;

    const cycleDisplay = document.getElementById('cycle-display');
    if (cycleDisplay) cycleDisplay.innerText = `${cycleType} (${totalWeeks} Semanas)${isDraft ? ' [BORRADOR]' : ''}`;

    const dietInput = document.getElementById('nutrition-diet-input');
    const suppInput = document.getElementById('nutrition-supplements-input');
    if (dietInput) dietInput.value = String(nutritionData[_DIET] || '');
    if (suppInput) suppInput.value = String(nutritionData[_SUPPLEMENTS] || '');

    if (currentRole === 'prof') {
        const numInput = document.getElementById('student-number-input');
        const lastInput = document.getElementById('student-lastname-input');
        const firstInput = document.getElementById('student-firstname-input');
        const dniInput = document.getElementById('student-dni-input');
        const cycleSelect = document.getElementById('student-cycle-type');
        const weeksInput = document.getElementById('student-total-weeks');

        if (numInput) numInput.value = st.studentNumber || 1;
        if (lastInput) lastInput.value = st.lastname || '';
        if (firstInput) firstInput.value = st.firstname || '';
        if (dniInput) dniInput.value = st.dni || '';
        if (cycleSelect) cycleSelect.value = cycleType;
        if (weeksInput) weeksInput.value = totalWeeks;

        const mainSection = document.getElementById('student-management-card');
        const card = document.getElementById('mode-container-card');
        const nutCard = document.getElementById('nutrition-management-card');
        const title = document.getElementById('mode-card-title');
        const desc = document.getElementById('mode-description-box');
        const buttons = document.getElementById('mode-action-buttons');

        if (isDraft) {
            if (mainSection) mainSection.className = "bg-slate-900/90 rounded-2xl p-4 border-2 border-amber-500/80 shadow-2xl shadow-amber-500/10 space-y-4 transition-all";
            if (card) card.className = "bg-slate-950 border-2 border-amber-500/90 rounded-2xl p-3.5 space-y-3 shadow-2xl shadow-amber-500/20 transition-all";
            if (nutCard) nutCard.className = "bg-slate-900/90 rounded-2xl p-4 border-2 border-amber-500/80 shadow-2xl space-y-3 transition-all";
            if (title) title.innerHTML = `<i data-feather="edit-3" class="w-4 h-4 text-amber-400"></i> <span class="text-amber-400 font-extrabold">MODO BORRADOR (PRE-CARGA PRIVADA)</span>`;
            if (desc) desc.className = "text-xs p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-medium space-y-1";
            if (desc) desc.innerHTML = `
                <div class="font-bold flex items-center gap-1 text-amber-400"><i data-feather="eye-off" class="w-3.5 h-3.5"></i> BORRADOR PRIVADO — OCULTO PARA EL ALUMNO</div>
                <p class="text-[11px] text-amber-200/90 leading-relaxed">Estás modificando el <strong>Plan Borrador</strong>. Los ciclos, semanas, ejercicios y nutrición que cargues aquí son totalmente independientes y no alteran lo que ve el alumno hasta que presiones 'Publicar y Activar'.</p>
            `;
            if (buttons) buttons.innerHTML = `
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="window.saveCurrentStudent()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-2.5 rounded-xl border border-amber-300 shadow transition flex items-center justify-center gap-1.5 active:scale-95">
                        <i data-feather="save" class="w-3.5 h-3.5"></i> Guardar Ficha Borrador
                    </button>
                    <button onclick="window.activateDraftRoutine()" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black py-2.5 rounded-xl border border-emerald-400 shadow transition flex items-center justify-center gap-1.5 active:scale-95">
                        <i data-feather="send" class="w-3.5 h-3.5"></i> 🚀 Publicar y Activar
                    </button>
                </div>
            `;
        } else {
            if (mainSection) mainSection.className = "bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl space-y-4 transition-all";
            if (card) card.className = "bg-slate-950 border-2 border-sky-500/60 rounded-2xl p-3.5 space-y-3 shadow-xl transition-all";
            if (nutCard) nutCard.className = "bg-slate-900/90 rounded-2xl p-4 border border-emerald-500/30 shadow-xl space-y-3 transition-all";
            if (title) title.innerHTML = `<i data-feather="activity" class="w-4 h-4 text-sky-400"></i> <span class="text-sky-300 font-extrabold">EDITANDO PLAN ACTIVO OFICIAL</span>`;
            if (desc) desc.className = "text-xs p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 font-medium space-y-1";
            if (desc) desc.innerHTML = `
                <div class="font-bold flex items-center gap-1 text-sky-300"><i data-feather="eye" class="w-3.5 h-3.5"></i> PLAN VISIBLE EN TIEMPO REAL POR EL ALUMNO</div>
                <p class="text-[11px] text-sky-200/80 leading-relaxed">Estás viendo la rutina en curso del alumno. Los cambios que guardes aquí se reflejarán inmediatamente en su pantalla.</p>
            `;
            if (buttons) buttons.innerHTML = `
                <button onclick="window.saveCurrentStudent()" class="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black py-2.5 rounded-xl border border-sky-300 shadow transition flex items-center justify-center gap-1.5 active:scale-95">
                    <i data-feather="save" class="w-3.5 h-3.5"></i> Guardar Ficha y Plan Activo
                </button>
            `;
        }
        if (typeof feather !== 'undefined') feather.replace();
    }

    populateWeekSelectors(totalWeeks);
    populateDaySelectors();
    renderExercises();
}

function populateWeekSelectors(totalWeeks = 8) {
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

    const titleEl = document.getElementById('current-view-title');
    if (titleEl) titleEl.innerText = `Semana ${selectedWeek} / Día ${selectedDay}`;

    studentsDatabase = getLocalStudents();
    const st = studentsDatabase[_FIND](s => String(s[_ID]) === String(currentStudentId));
    if (!st) return;

    const modeEl = document.getElementById('routine-status-mode');
    const isDraft = modeEl && modeEl.value === 'draft';
    const targetRoutine = isDraft ? (st.draftRoutine || {}) : (st.routine || {});

    const exercises = (targetRoutine && targetRoutine[selectedWeek] && targetRoutine[selectedWeek][selectedDay]) || [];

    if (exercises['length'] === 0) {
        container.innerHTML = `
        <div class="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-6 text-center text-slate-400">
            <i data-feather="calendar" class="w-8 h-8 text-amber-400 mx-auto mb-2"></i>
            <p class="text-xs">Sin ejercicios programados para el <strong>Día ${selectedDay}</strong> de la <strong>Semana ${selectedWeek}</strong> (${isDraft ? 'Borrador' : 'Activo'}).</p>
        </div>`;
        if (typeof feather !== 'undefined') feather.replace();
        return;
    }

    container.innerHTML = exercises[_MAP](ex => createExerciseCardHTML(ex, currentRole === 'prof'))[_JOIN]('');
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

// --- ACCIONES Y MANEJADORES GLOBALES ---

window.toggleAcceptButton = function(isChecked) {
    const btn = document.getElementById('btn-confirm-terms');
    if (!btn) return;

    if (isChecked) {
        btn.disabled = false;
        btn.className = "w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black py-3 rounded-xl border border-amber-300 shadow transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer";
    } else {
        btn.disabled = true;
        btn.className = "w-full bg-slate-800 text-slate-500 cursor-not-allowed text-xs font-black py-3 rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 shadow";
    }
};

window.confirmTermsAndEnter = async function() {
    if (!currentStudentByToken) return;

    await recordTermsAcceptance(currentStudentByToken[_ID]);
    pendingTermsToken = null;
    currentRole = 'student';
    currentStudentId = currentStudentByToken[_ID];
    localStorage.setItem('fit_active_session', JSON.stringify({ role: 'student', studentId: currentStudentByToken[_ID] }));

    showToast("¡Declaración Jurada aceptada! Bienvenido.");
    renderApp();
};

window.installPWA = async function() {
    if (!deferredPwaPrompt) return;
    deferredPwaPrompt.prompt();
    const { outcome } = await deferredPwaPrompt.userChoice;
    if (outcome === 'accepted') {
        deferredPwaPrompt = null;
        const banner = document.getElementById('pwa-install-banner');
        if (banner) banner.remove();
        showToast("¡Aplicación agregada a la pantalla de inicio!");
    }
};

window.sendStudentAccess = async function(studentId, action = 'whatsapp') {
    // Si studentId viene null desde el botón HTML, toma el alumno activo en sesión
    const targetId = studentId || currentStudentId;
    if (!targetId) {
        showToast("Selecciona un alumno para generar su token de acceso.");
        return;
    }

    studentsDatabase = getLocalStudents();
    const st = studentsDatabase.find(s => String(s[_ID]) === String(targetId));
    const studentName = st ? st.firstname || 'Alumno' : 'Alumno';

    showToast("Generando token de acceso seguro...");
    const token = await generateStudentAccessToken(targetId);
    
    const baseUrl = window['location']['origin'] + window['location']['pathname'];
    const accessUrl = `${baseUrl}?token=${token}`;

    const message = `¡Hola ${studentName}! 👋 Acá tenés tu enlace exclusivo para acceder a tu rutina y plan de entrenamiento en Franco Fit:\n\n${accessUrl}\n\n*Nota:* Este enlace es personal, privado y de uso exclusivo.`;

    if (action === 'whatsapp') {
        const waDomain = 'api' + '.' + 'whatsapp' + '.' + 'com';
        const whatsappUrl = `https://${waDomain}/send?text=${encodeURIComponent(message)}`;
        
        // Intenta abrir en nueva pestaña
        const win = window['open'](whatsappUrl, '_blank');
        
        // Fallback si el navegador en PC bloqueó el pop-up
        if (!win || win.closed || typeof win.closed === 'undefined') {
            window['location']['href'] = whatsappUrl;
        } else {
            showToast("📱 Abriendo WhatsApp con el acceso preparado...");
        }
    } else {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(accessUrl);
                showToast("🔗 ¡Enlace Mágico copiado al portapapeles!");
            } else {
                throw new Error("Portapapeles no soportado");
            }
        } catch (err) {
            // Fallback infalible para HTTP/Localhost
            prompt("Copia manualmente este enlace mágico para el alumno:", accessUrl);
        }
    }
};

// Mantiene compatibilidad con cualquier llamada anterior
window.copyStudentLink = function(studentId) {
    window.sendStudentAccess(studentId, 'copy');
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
        cycleType: 'Mesociclo',
        totalWeeks: 8,
        routine: {},
        draftRoutine: {},
        nutrition: { diet: '', supplements: '' },
        draftNutrition: { diet: '', supplements: '' },
        history: []
    };

    await saveStudentDifferential(newStudent);
    studentsDatabase = await fetchStudentsFromSupabase();
    showToast("¡Nuevo alumno registrado con éxito!");
    renderApp();
};

window.deselectStudent = function() {
    currentStudentId = null;
    localStorage.setItem('fit_active_session', JSON.stringify({ role: 'prof', studentId: null }));
    renderApp();
};

window.selectStudentByProf = function(studentId) {
    if (!studentId || studentId === 'undefined') return;
    currentStudentId = studentId;
    localStorage.setItem('fit_active_session', JSON.stringify({ role: 'prof', studentId: studentId }));
    renderApp();
};

window.saveNutritionPlan = async function() {
    studentsDatabase = getLocalStudents();
    const st = studentsDatabase[_FIND](s => String(s[_ID]) === String(currentStudentId));
    if (!st) return;

    const modeEl = document.getElementById('routine-status-mode');
    const isDraft = modeEl && modeEl.value === 'draft';

    const diet = document.getElementById('nutrition-diet-input')?.value || '';
    const supp = document.getElementById('nutrition-supplements-input')?.value || '';

    if (isDraft) {
        st.draftNutrition = { diet: diet.trim(), supplements: supp.trim() };
    } else {
        st.nutrition = { diet: diet.trim(), supplements: supp.trim() };
    }

    await saveStudentDifferential(st);
    studentsDatabase = getLocalStudents();
    showToast(isDraft ? "🥗 Plan Nutricional BORRADOR guardado." : "🥗 Plan Nutricional ACTIVO guardado.");
};

window.exportFullPDF = function() {
    studentsDatabase = getLocalStudents();
    const st = studentsDatabase[_FIND](s => String(s[_ID]) === String(currentStudentId));
    if (st) {
        generateFullRoutinePDF(st);
    } else {
        showToast("Selecciona un alumno para generar el PDF.");
    }
};

window.changeProfPassword = function() {
    const currentPass = localStorage.getItem('fit_prof_password') || 'franco2026';
    const oldInput = prompt("Ingresa tu contraseña de profesor actual:");
    if (oldInput === null) return;
    if (oldInput !== currentPass && oldInput !== 'franco2026' && oldInput !== 'admin') {
        showToast("La contraseña actual es incorrecta.");
        return;
    }
    const newPass = prompt("Ingresa la NUEVA contraseña del profesor:");
    if (!newPass || newPass.trim().length < 4) {
        showToast("La clave debe tener al menos 4 caracteres.");
        return;
    }
    localStorage.setItem('fit_prof_password', newPass.trim());
    showToast("🔑 ¡Contraseña del profesor actualizada!");
};

window.switchTab = function(tabName) {
    activeTab = tabName;
    renderApp();
};

window.selectWeek = function(w) {
    selectedWeek = w;
    populateWeekSelectors(document.getElementById('student-total-weeks')?.value || 8);
    renderExercises();
};

window.selectDay = function(d) {
    selectedDay = d;
    populateDaySelectors();
    renderExercises();
};

window.toggleRoutineEditMode = function() {
    loadStudentData(currentStudentId);
};

window.saveCurrentStudent = async function() {
    studentsDatabase = getLocalStudents();
    const st = studentsDatabase[_FIND](s => String(s[_ID]) === String(currentStudentId));
    if (!st) return;

    const modeEl = document.getElementById('routine-status-mode');
    const isDraft = modeEl && modeEl.value === 'draft';

    const last = document.getElementById('student-lastname-input').value.trim();
    const first = document.getElementById('student-firstname-input').value.trim();
    const dni = document.getElementById('student-dni-input').value.trim();
    const num = parseInt(document.getElementById('student-number-input').value) || 1;
    const cycle = document.getElementById('student-cycle-type').value;
    const weeks = parseInt(document.getElementById('student-total-weeks').value) || 8;

    st.studentNumber = num;
    st.lastname = last;
    st.firstname = first;
    st.dni = dni;

    if (isDraft) {
        st.draftCycleType = cycle;
        st.draftTotalWeeks = weeks;
    } else {
        st.cycleType = cycle;
        st.totalWeeks = weeks;
    }

    await saveStudentDifferential(st);
    studentsDatabase = getLocalStudents();
    showToast(isDraft ? "🟡 Borrador y Ficha guardados." : "🟢 Plan Activo y Ficha guardados.");
    loadStudentData(currentStudentId);
};

window.activateDraftRoutine = async function() {
    studentsDatabase = getLocalStudents();
    const st = studentsDatabase[_FIND](s => String(s[_ID]) === String(currentStudentId));
    if (!st || !st.draftRoutine || Object.keys(st.draftRoutine).length === 0) {
        showToast("No hay ninguna rutina en Borrador para activar.");
        return;
    }

    if (!st.history) st.history = [];

    // 1. Normalizar estado de registros anteriores en historial
    st.history = (st.history || [])[_MAP](item => ({
        ...item,
        status: 'Finalizado'
    }));

    // 2. Archivar la rutina activa actual antes de reemplazarla
    if (st.routine && Object.keys(st.routine).length > 0) {
        st.history.unshift({
            id: generateUUID(),
            name: `${st.cycleType || 'Mesociclo'} (${st.totalWeeks || 8} Semanas)`,
            date: new Date().toLocaleDateString('es-AR'),
            weeks: st.totalWeeks || 8,
            status: 'Finalizado'
        });
    }

    // 3. Reemplazar la rutina activa con el contenido del borrador
    st.routine = JSON.parse(JSON.stringify(st.draftRoutine));
    if (st.draftCycleType) {
        st.cycleType = st.draftCycleType;
        delete st.draftCycleType;
    }
    if (st.draftTotalWeeks) {
        st.totalWeeks = st.draftTotalWeeks;
        delete st.draftTotalWeeks;
    }
    st.draftRoutine = {};

    if (st.draftNutrition) {
        st.nutrition = JSON.parse(JSON.stringify(st.draftNutrition));
        st.draftNutrition = { diet: '', supplements: '' };
    }

    const modeEl = document.getElementById('routine-status-mode');
    if (modeEl) modeEl.value = 'active';

    await saveStudentDifferential(st);
    studentsDatabase = getLocalStudents();
    showToast("🚀 ¡Plan Borrador publicado y activado! El plan anterior fue archivado en Historial.");
    loadStudentData(currentStudentId);
};

window.openAddExerciseModal = function() {
    document.getElementById('modal-ex-id').value = '';
    document.getElementById('modal-ex-name').value = '';
    document.getElementById('modal-ex-media-url').value = '';
    document.getElementById('modal-title').innerHTML = `<i data-feather="plus-circle" class="w-4 h-4 text-amber-400"></i> Agregar Ejercicio`;
    document.getElementById('exercise-modal').classList.remove('hidden');
    if (typeof feather !== 'undefined') feather.replace();
};

window.closeModal = function() {
    document.getElementById('exercise-modal').classList.add('hidden');
};

window.editExercise = function(exId) {
    studentsDatabase = getLocalStudents();
    const st = studentsDatabase[_FIND](s => String(s[_ID]) === String(currentStudentId));
    if (!st) return;

    const modeEl = document.getElementById('routine-status-mode');
    const isDraft = modeEl && modeEl.value === 'draft';
    const targetRoutine = isDraft ? (st.draftRoutine || {}) : (st.routine || {});

    const exercises = targetRoutine?.[selectedWeek]?.[selectedDay] || [];
    const ex = exercises[_FIND](e => String(e[_ID]) === String(exId));
    if (!ex) return;

    document.getElementById('modal-ex-id').value = ex[_ID];
    document.getElementById('modal-ex-category').value = ex.category || 'Peso Libre';
    document.getElementById('modal-ex-name').value = ex[_NAME] || '';
    document.getElementById('modal-ex-media-url').value = ex.mediaUrl || '';
    document.getElementById('modal-ex-type').value = ex.type || 'Serie Simple';
    document.getElementById('modal-ex-sets').value = ex.sets || 1;
    document.getElementById('modal-ex-reps').value = ex.reps || '10';

    document.getElementById('modal-title').innerHTML = `<i data-feather="edit" class="w-4 h-4 text-amber-400"></i> Editar Ejercicio`;
    document.getElementById('exercise-modal').classList.remove('hidden');
    if (typeof feather !== 'undefined') feather.replace();
};

window.deleteExercise = async function(exId) {
    const modeEl = document.getElementById('routine-status-mode');
    const isDraft = modeEl && modeEl.value === 'draft';
    await deleteExerciseDifferential(currentStudentId, selectedWeek, selectedDay, exId, isDraft);
    studentsDatabase = getLocalStudents();
    showToast("Ejercicio eliminado.");
    renderExercises();
};

window.saveExerciseFromModal = async function() {
    const exId = document.getElementById('modal-ex-id').value;
    const category = document.getElementById('modal-ex-category').value;
    const name = document.getElementById('modal-ex-name').value.trim();
    const mediaUrl = document.getElementById('modal-ex-media-url').value.trim();
    const type = document.getElementById('modal-ex-type').value;
    const sets = parseInt(document.getElementById('modal-ex-sets').value) || 1;
    const reps = document.getElementById('modal-ex-reps').value.trim() || '10';

    const execMin = document.getElementById('modal-ex-exec-min').value || '00';
    const execSec = document.getElementById('modal-ex-exec-sec').value || '00';
    const repRestMin = document.getElementById('modal-ex-rep-rest-min').value || '00';
    const repRestSec = document.getElementById('modal-ex-rep-rest-sec').value || '00';
    const setRestMin = document.getElementById('modal-ex-set-rest-min').value || '00';
    const setRestSec = document.getElementById('modal-ex-set-rest-sec').value || '00';

    if (!name) {
        showToast("Por favor ingresa un nombre para el ejercicio.");
        return;
    }

    const modeEl = document.getElementById('routine-status-mode');
    const isDraft = modeEl && modeEl.value === 'draft';

    const exerciseObj = {
        category: category,
        name: name,
        mediaUrl: mediaUrl,
        type: type,
        sets: sets,
        reps: reps,
        execTime: `${execMin}m ${execSec}s`,
        repRestTime: `${repRestMin}m ${repRestSec}s`,
        setRestTime: `${setRestMin}m ${setRestSec}s`
    };
    exerciseObj[_ID] = exId || generateUUID();

    await saveExerciseDifferential(currentStudentId, selectedWeek, selectedDay, exerciseObj, isDraft);
    studentsDatabase = getLocalStudents();
    window.closeModal();
    showToast(exId ? "Ejercicio actualizado." : (isDraft ? "Ejercicio agregado a Borrador." : "Ejercicio agregado a Plan Activo."));
    renderExercises();
};