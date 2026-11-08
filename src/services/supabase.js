import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Constantes internas del módulo
const _ID = 'i' + 'd';
const _PIN = 'p' + 'i' + 'n';

// ==========================================
// 🔐 FUNCIONES DE AUTENTICACIÓN NATIVA (JWT)
// ==========================================

export async function loginProfesorWithSupabase(email, password) {
    if (!supabase) return { error: { message: 'Supabase no está configurado.' } };
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
    });
    
    return { data, error };
}

export async function logoutSupabase() {
    if (supabase) {
        await supabase.auth.signOut();
    }
}

// ==========================================
// 🛠️ FUNCIONES UTILITARIAS Y DE CACHÉ LOCAL
// ==========================================

export function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const LOCAL_STORAGE_KEY = 'fit_students_db';

export function getLocalStudents() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn('Error leyendo de LocalStorage:', e);
        return [];
    }
}

export function setLocalStudents(students) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
        console.warn('Error guardando en LocalStorage:', e);
    }
}

export async function fetchStudentsFromSupabase() {
    if (!supabase) {
        return getLocalStudents();
    }
    try {
        const fieldId = 'i' + 'd';
        
        // 🟢 Consulta directa a la tabla alumnos (evita el error 404)
        const { data, error } = await supabase.from('alumnos').select('*');

        if (error) {
            console.warn('Error leyendo Supabase, usando caché local:', error.message);
            return getLocalStudents();
        }

        if (data && Array.isArray(data)) {
            const uniqueMap = new Map();
            data.forEach(st => {
                const dniKey = (st['dni'] && String(st['dni']).trim()) ? String(st['dni']).trim() : null;
                const nameKey = `${(st['nombre'] || st['firstname'] || '').trim().toLowerCase()}_${(st['apellido'] || st['lastname'] || '').trim().toLowerCase()}`;
                const key = dniKey ? `dni_${dniKey}` : `name_${nameKey}`;
                if (!uniqueMap.has(key) || (st[fieldId] && !uniqueMap.get(key)[fieldId])) {
                    uniqueMap.set(key, st);
                }
            });

            const formattedStudents = Array.from(uniqueMap.values()).map(st => ({
                id: st[fieldId] || st['_id'],
                studentNumber: parseInt(st['studentNumber'] || st['student_number'] || st['studentnumber']) || 1,
                lastname: st['apellido'] || st['lastname'] || '',
                firstname: st['nombre'] || st['firstname'] || '',
                dni: st['dni'] || '',
                pin: st[_PIN] || st['pin'] || '',
                cycleType: st['cycleType'] || st['cycle_type'] || 'Mesociclo',
                totalWeeks: parseInt(st['totalWeeks'] || st['total_weeks']) || 8,
                datosAntropometricos: st['datos_antropometricos'] || st['datosAntropometricos'] || { peso: null, altura: null, grasa: null },
                historialLesiones: st['historial_lesiones'] || st['historialLesiones'] || '',
                evaluacionInicial: st['evaluacion_inicial'] || st['evaluacionInicial'] || '',
                macrociclo: st['macrociclo'] || { fase: 'Adaptación', objetivo: '' },
                mesociclo: st['mesociclo'] || { numeroSemanas: 4 },
                microciclo: st['microciclo'] || { diasPorSemana: 3 },
                visibilitySettings: st['visibility_settings'] || st['visibilitySettings'] || {},
                history: Array.isArray(st['history']) ? st['history'] : [],
                nutrition: st['nutrition'] || { diet: '', supplements: '' },
                routine: st['routine'] || {},
                draftRoutine: st['draft_routine'] || st['draftRoutine'] || {},
                accessToken: st['access_token'] || st['accessToken'] || ''
            }));

            setLocalStudents(formattedStudents);
            return formattedStudents;
        }

        return getLocalStudents();
    } catch (err) {
        console.warn('Excepción de red al leer alumnos:', err);
        return getLocalStudents();
    }
}

export async function saveStudentDifferential(student) {
    if (!student || !student.id) return { error: 'ID de alumno inválido' };

    // 1. Guardado inmediato en la memoria local (LocalStorage)
    const localList = getLocalStudents();
    const index = localList.findIndex(s => String(s.id) === String(student.id));
    if (index >= 0) {
        localList[index] = student;
    } else {
        localList.push(student);
    }
    setLocalStudents(localList);

    if (!supabase) return { data: student };

    try {
        const _ID = 'i' + 'd';
        
        // Mapeo exacto a los nombres reales de las columnas en Supabase
        const payload = {
            [_ID]: student.id,
            student_number: student.studentNumber || 1,
            nombre: student.firstname || '',   // 🟢 Coincide con la columna 'nombre'
            apellido: student.lastname || '',  // 🟢 Coincide con la columna 'apellido'
            dni: student.dni || '',
            access_token: student.accessToken || student.access_token || '', // 👈 LÍNEA AGREGADA
            cycle_type: student.cycleType || student.macrociclo?.fase || 'Mesociclo',
            total_weeks: student.totalWeeks || student.mesociclo?.numeroSemanas || 8,
            routine: student.routine || {},
            draft_routine: student.draftRoutine || {},
            nutrition: student.nutrition || {},
            draft_nutrition: student.draftNutrition || {},
            history: student.history || [],
            datos_antropometricos: student.datosAntropometricos || {},
            historial_lesiones: student.historialLesiones || '',
            evaluacion_inicial: student.evaluacionInicial || '',
            macrociclo: student.macrociclo || {},
            mesociclo: student.mesociclo || {},
            microciclo: student.microciclo || {},
            visibility_settings: student.visibilitySettings || {}
        };

        const { data, error } = await supabase
            .from('alumnos')
            .upsert(payload, { onConflict: _ID });

        if (error) {
            console.warn('Error al guardar en Supabase:', error.message);
            return { error };
        }

        return { data };
    } catch (err) {
        console.warn('Excepción al guardar en Supabase:', err);
        return { error: err };
    }
}

export async function saveExerciseDifferential(studentId, week, day, exercise, isDraft = false) {
    const localList = getLocalStudents();
    const student = localList.find(s => String(s[_ID]) === String(studentId));
    if (!student) return null;

    const routineTarget = isDraft ? 'draftRoutine' : 'routine';

    if (!student[routineTarget]) student[routineTarget] = {};
    if (!student[routineTarget][week]) student[routineTarget][week] = {};
    if (!student[routineTarget][week][day]) student[routineTarget][week][day] = [];

    const dayList = student[routineTarget][week][day];
    const existingIdx = dayList.findIndex(e => String(e[_ID]) === String(exercise[_ID]));

    if (existingIdx >= 0) {
        dayList[existingIdx] = { ...exercise };
    } else {
        if (!exercise[_ID]) exercise[_ID] = generateUUID();
        dayList.push({ ...exercise });
    }

    return await saveStudentDifferential(student);
}

export async function deleteExerciseDifferential(studentId, week, day, exerciseId, isDraft = false) {
    const localList = getLocalStudents();
    const student = localList.find(s => String(s[_ID]) === String(studentId));
    if (!student) return null;

    const routineTarget = isDraft ? 'draftRoutine' : 'routine';

    if (student[routineTarget]?.[week]?.[day]) {
        student[routineTarget][week][day] = student[routineTarget][week][day].filter(
            e => String(e[_ID]) !== String(exerciseId)
        );
        return await saveStudentDifferential(student);
    }

    return student;
}

export async function fetchStudentByToken(token) {
    if (!token) return null;

    const cleanToken = String(token).trim();
    const fieldId = 'i' + 'd';

    if (supabase) {
        try {
            const { data, error } = await supabase
                .rpc('obtener_alumno_por_token', { p_token: cleanToken });

            if (!error && data && data.length > 0) {
                // CORRECCIÓN: Extraer el primer objeto data del arreglo devuelto por Supabase
                const st = Array.isArray(data) ? data[0] : data;
                
                const studentObj = {
                    id: st[fieldId] || st['_id'] || st['id'],
                    studentNumber: parseInt(st['studentNumber'] || st['student_number']) || 1,
                    lastname: st['apellido'] || st['lastname'] || '',
                    firstname: st['nombre'] || st['firstname'] || '',
                    dni: st['dni'] || '',
                    cycleType: st['cycleType'] || st['cycle_type'] || 'Mesociclo',
                    totalWeeks: parseInt(st['totalWeeks'] || st['total_weeks']) || 8,
                    history: Array.isArray(st['history']) ? st['history'] : [],
                    nutrition: st['nutrition'] || { diet: '', supplements: '' },
                    routine: st['routine'] || {},
                    accessToken: st['access_token'] || st['accessToken'] || cleanToken,
                    termsAcceptedAt: st['terms_accepted_at'] || st['termsAcceptedAt'] || null
                };

                // Guardar en la caché local del dispositivo para soporte offline
                const localList = getLocalStudents();
                return localList.find(s => 
                    (s.accessToken && String(s.accessToken).trim() === cleanToken) || 
                    (s.id && String(s.id).trim() === cleanToken)
                ) || null;
                const idx = localList.findIndex(s => String(s[fieldId] || s['id']) === String(studentObj.id));
                if (idx >= 0) {
                    localList[idx] = studentObj;
                } else {
                    localList.push(studentObj);
                }
                setLocalStudents(localList);

                return studentObj;
            }
        } catch (err) {
            console.warn('Error al consultar token en Supabase:', err);
        }
    }

    // Respaldo en memoria local si no hay conexión
    const localList = getLocalStudents();
    return localList.find(s => s.accessToken && String(s.accessToken).trim() === cleanToken) || null;
}

export async function recordTermsAcceptance(studentId) {
    const localList = getLocalStudents();
    const student = localList.find(s => String(s[_ID]) === String(studentId));
    if (!student) return null;

    const nowIso = new Date().toISOString();
    student['termsAcceptedAt'] = nowIso;
    setLocalStudents(localList);

    if (!supabase) return student;

    try {
        await supabase
            .from('alumnos')
            .update({ terms_accepted_at: nowIso })
            .eq('id', studentId);
    } catch (err) {
        console.error('Error registrando aceptación legal:', err);
    }

    return student;
}

export async function generateStudentAccessToken(studentId) {
    const newToken = generateUUID();
    const localList = getLocalStudents();
    const fieldId = 'i' + 'd';
    const student = localList.find(s => String(s[fieldId] || s['_id'] || s['id']) === String(studentId));
    
    if (student) {
        student['accessToken'] = newToken;
        setLocalStudents(localList);
        // Guarda la ficha y el token en Supabase
        await saveStudentDifferential(student);
    }
    return newToken;
}