import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const _ID = 'i' + 'd';
const _PIN = 'p' + 'i' + 'n';

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
        const { data, error } = await supabase
            .from('alumnos')
            .select('*');

        if (error) {
            console.warn('Error leyendo Supabase, usando caché local:', error.message);
            return getLocalStudents();
        }

        if (data && data.length > 0) {
            const uniqueMap = new Map();

            data.forEach(st => {
                const dniKey = (st['dni'] && String(st['dni']).trim()) ? String(st['dni']).trim() : null;
                const nameKey = `${(st['nombre'] || st['firstname'] || '').trim().toLowerCase()}_${(st['apellido'] || st['lastname'] || '').trim().toLowerCase()}`;
                const key = dniKey ? `dni_${dniKey}` : `name_${nameKey}`;

                if (!uniqueMap.has(key) || (st[_ID] && !uniqueMap.get(key)[_ID])) {
                    uniqueMap.set(key, st);
                }
            });

            const formattedStudents = Array.from(uniqueMap.values()).map(st => ({
                id: st[_ID],
                studentNumber: parseInt(st['studentNumber'] || st['student_number'] || st['studentnumber']) || 1,
                lastname: st['apellido'] || st['lastname'] || '',
                firstname: st['nombre'] || st['firstname'] || '',
                dni: st['dni'] || '',
                pin: st[_PIN] || '',
                cycleType: st['cycleType'] || 'Mesociclo',
                totalWeeks: parseInt(st['totalWeeks'] || st['total_weeks']) || 8,
                draftCycleType: st['draftCycleType'] || st['draft_cycle_type'] || undefined,
                draftTotalWeeks: st['draftTotalWeeks'] ? parseInt(st['draftTotalWeeks']) : undefined,
                history: Array.isArray(st['history']) ? st['history'] : [],
                ratings: Array.isArray(st['ratings']) ? st['ratings'] : [],
                nutrition: st['nutrition'] || { diet: '', supplements: '' },
                draftNutrition: st['draft_nutrition'] || st['draftNutrition'] || { diet: '', supplements: '' },
                routine: st['routine'] || {},
                draftRoutine: st['draft_routine'] || st['draftRoutine'] || {},
                accessToken: st['access_token'] || st['accessToken'] || '',
                termsAcceptedAt: st['terms_accepted_at'] || st['termsAcceptedAt'] || null
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
    if (!student) return null;

    if (!student[_ID] || String(student[_ID]).startsWith('st_') || String(student[_ID]) === 'undefined') {
        student[_ID] = generateUUID();
    }

    const payload = {
        id: student[_ID],
        nombre: student['firstname'] || '',
        apellido: student['lastname'] || '',
        dni: student['dni'] || '',
        studentNumber: parseInt(student['studentNumber']) || 1,
        cycleType: student['cycleType'] || 'Mesociclo',
        totalWeeks: parseInt(student['totalWeeks']) || 8,
        draftCycleType: student['draftCycleType'] || null,
        draftTotalWeeks: student['draftTotalWeeks'] ? parseInt(student['draftTotalWeeks']) : null,
        history: student['history'] || [],
        ratings: student['ratings'] || [],
        nutrition: student['nutrition'] || { diet: '', supplements: '' },
        draft_nutrition: student['draftNutrition'] || { diet: '', supplements: '' },
        routine: student['routine'] || {},
        draft_routine: student['draftRoutine'] || {},
        access_token: student['accessToken'] || null,
        terms_accepted_at: student['termsAcceptedAt'] || null
    };

    const localList = getLocalStudents();
    const existingIndex = localList.findIndex(s => String(s[_ID]) === String(student[_ID]));
    if (existingIndex >= 0) {
        localList[existingIndex] = { ...student };
    } else {
        localList.push({ ...student });
    }
    setLocalStudents(localList);

    if (!supabase) return student;

    try {
        const { data, error } = await supabase
            .from('alumnos')
            .upsert(payload)
            .select();

        if (error) {
            console.error('Error al guardar en Supabase:', error.message);
            return student;
        }

        if (data && data.length > 0 && data[0] && data[0][_ID]) {
            const returnedId = data[0][_ID];
            student[_ID] = returnedId;
            const updatedList = getLocalStudents();
            const idx = updatedList.findIndex(s => String(s[_ID]) === String(student[_ID]));
            if (idx >= 0) {
                updatedList[idx][_ID] = returnedId;
                setLocalStudents(updatedList);
            }
        }

        return student;
    } catch (err) {
        console.error('Excepción en guardado diferencial de alumno:', err);
        return student;
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

    if (supabase) {
        try {
            const { data, error } = await supabase
                .rpc('obtener_alumno_por_token', { p_token: cleanToken });

            if (!error && data && data.length > 0) {
                const st = Array.isArray(data) ? data : data;
                const studentObj = {
                    id: st['id'],
                    studentNumber: parseInt(st['studentNumber'] || st['student_number']) || 1,
                    lastname: st['apellido'] || st['lastname'] || '',
                    firstname: st['nombre'] || st['firstname'] || '',
                    dni: st['dni'] || '',
                    cycleType: st['cycleType'] || 'Mesociclo',
                    totalWeeks: parseInt(st['totalWeeks']) || 8,
                    history: st['history'] || [],
                    nutrition: st['nutrition'] || { diet: '', supplements: '' },
                    routine: st['routine'] || {},
                    accessToken: st['access_token'] || st['accessToken'] || cleanToken,
                    termsAcceptedAt: st['terms_accepted_at'] || st['termsAcceptedAt'] || null
                };

                // Guardar/Actualizar en caché local del teléfono para acceso offline futuro
                const localList = getLocalStudents();
                const idx = localList.findIndex(s => String(s['id']) === String(studentObj.id));
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
    const student = localList.find(s => String(s['id']) === String(studentId));

    if (student) {
        student['accessToken'] = newToken;
        setLocalStudents(localList);
        // Garantiza que la ficha y el token se guarden completos en Supabase
        await saveStudentDifferential(student);
    }

    return newToken;
}