import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const LOCAL_STORAGE_KEY = 'fit_students_db';

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

export function getLocalStudents() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Error leyendo LocalStorage:', e);
    return [];
  }
}

export function setLocalStudents(students) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.warn('Error guardando LocalStorage:', e);
  }
}

// 🟢 Consulta directa a Supabase como Fuente Única de la Verdad
export async function fetchStudentsFromSupabase() {
  if (!supabase) {
    return getLocalStudents();
  }
  try {
    const { data, error } = await supabase.from('alumnos').select('*');
    if (error) {
      console.warn('Error consultando Supabase, usando copia local:', error.message);
      return getLocalStudents();
    }
    if (data && Array.isArray(data)) {
      const formatted = data.map(st => ({
        id: st.id || st._id,
        studentNumber: parseInt(st.student_number || st.studentNumber) || 1,
        lastname: st.apellido || st.lastname || '',
        firstname: st.nombre || st.firstname || '',
        dni: st.dni || '',
        accessToken: st.access_token || st.accessToken || '',
        cycleType: st.cycle_type || st.cycleType || 'Mesociclo',
        totalWeeks: parseInt(st.total_weeks || st.totalWeeks) || 4,
        datosAntropometricos: st.datos_antropometricos || st.datosAntropometricos || { peso: null, altura: null, grasa: null },
        historialLesiones: st.historial_lesiones || st.historialLesiones || '',
        evaluacionInicial: st.evaluacion_inicial || st.evaluacionInicial || '',
        macrociclo: st.macrociclo || { fase: 'Adaptación', objetivo: '' },
        mesociclo: st.mesociclo || { numeroSemanas: 4, semanaEnPreparacion: 1, enfoque: '' },
        microciclo: st.microciclo || { diasPorSemana: 3, diasAsignados: ['Lunes', 'Miércoles', 'Viernes'], diaEnPreparacion: 1, tipoMicrociclo: 'Carga' },
        microcicloByWeek: st.microciclo_by_week || st.microcicloByWeek || {},
        visibilitySettings: st.visibility_settings || st.visibilitySettings || {},
        routine: st.routine || {},
        draftRoutine: st.draft_routine || st.draftRoutine || {},
        nutrition: st.nutrition || { diet: '', supplements: '' },
        history: Array.isArray(st.history) ? st.history : []
      }));

      // Actualizar copia local de respaldo
      setLocalStudents(formatted);
      return formatted;
    }
    return getLocalStudents();
  } catch (err) {
    console.warn('Excepción de red al leer alumnos de Supabase:', err);
    return getLocalStudents();
  }
}

// 🟢 Persistencia Directa en Supabase
export async function saveStudentDifferential(student) {
  if (!student || !student.id) return { error: 'ID de alumno inválido' };

  // 1. Actualización inmediata en memoria local
  const localList = getLocalStudents();
  const idx = localList.findIndex(s => String(s.id) === String(student.id));
  if (idx >= 0) {
    localList[idx] = student;
  } else {
    localList.push(student);
  }
  setLocalStudents(localList);

  if (!supabase) return { data: student };

  try {
    const payload = {
      id: student.id,
      student_number: student.studentNumber || 1,
      nombre: student.firstname || '',
      apellido: student.lastname || '',
      dni: student.dni || '',
      access_token: student.accessToken || '',
      cycle_type: student.cycleType || student.macrociclo?.fase || 'Mesociclo',
      total_weeks: student.totalWeeks || student.mesociclo?.numeroSemanas || 4,
      routine: student.routine || {},
      draft_routine: student.draftRoutine || {},
      nutrition: student.nutrition || {},
      history: student.history || [],
      datos_antropometricos: student.datosAntropometricos || {},
      historial_lesiones: student.historialLesiones || '',
      evaluacion_inicial: student.evaluacionInicial || '',
      macrociclo: student.macrociclo || {},
      mesociclo: student.mesociclo || {},
      microciclo: student.microciclo || {},
      microciclo_by_week: student.microcicloByWeek || {},
      visibility_settings: student.visibilitySettings || {}
    };

    const { data, error } = await supabase
      .from('alumnos')
      .upsert(payload, { onConflict: 'id' });

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

export async function loginProfesorWithSupabase(email, password) {
  if (!supabase) return { error: { message: 'Supabase no está configurado.' } };
  return await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim()
  });
}

export async function logoutSupabase() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function syncVideoBankToSupabase(exerciseName, url) {
  if (!supabase || !exerciseName || !url) return;
  try {
    const cleanKey = exerciseName.trim().toLowerCase();
    const { data: existing } = await supabase.from('app_settings').select('data').eq('id', 'video_bank').maybeSingle();
    const bank = existing?.data || {};
    bank[cleanKey] = url.trim();
    await supabase.from('app_settings').upsert({ id: 'video_bank', data: bank });
  } catch (e) {
    console.warn('Error sincronizando banco de videos:', e);
  }
}

export async function fetchVideoBankFromSupabase() {
  if (!supabase) return {};
  try {
    const { data } = await supabase.from('app_settings').select('data').eq('id', 'video_bank').maybeSingle();
    return data?.data || {};
  } catch (e) {
    return {};
  }
}

export async function fetchStudentByToken(token) {
  if (!token) return null;
  const cleanToken = String(token).trim();
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('obtener_alumno_por_token', { p_token: cleanToken });
      if (!error && data && data.length > 0) {
        const st = Array.isArray(data) ? data[0] : data;
        return {
          id: st.id,
          studentNumber: parseInt(st.student_number) || 1,
          lastname: st.apellido || '',
          firstname: st.nombre || '',
          dni: st.dni || '',
          totalWeeks: parseInt(st.total_weeks) || 4,
          datosAntropometricos: st.datos_antropometricos || {},
          historialLesiones: st.historial_lesiones || '',
          evaluacionInicial: st.evaluacion_inicial || '',
          routine: st.routine || {},
          visibilitySettings: st.visibility_settings || {},
          microcicloByWeek: st.microciclo_by_week || {},
          accessToken: st.access_token || cleanToken
        };
      }
    } catch (e) {}
  }
  const localList = getLocalStudents();
  return localList.find(s => s.accessToken === cleanToken) || null;
}

export async function generateStudentAccessToken(studentId) {
  const newToken = generateUUID();
  const students = await fetchStudentsFromSupabase();
  const st = students.find(s => String(s.id) === String(studentId));
  if (st) {
    st.accessToken = newToken;
    await saveStudentDifferential(st);
  }
  return newToken;
}