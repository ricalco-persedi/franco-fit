import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Lectura 100% directa desde la base de datos de Supabase
export async function fetchStudentsFromSupabase() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase.from('alumnos').select('*');
    if (error || !data) return [];
    
    return data.map(st => ({
      id: st.id,
      studentNumber: parseInt(st.student_number) || 1,
      lastname: st.apellido || '',
      firstname: st.nombre || '',
      dni: st.dni || '',
      accessToken: st.access_token || '',
      cycleType: st.cycle_type || 'Mesociclo',
      totalWeeks: parseInt(st.total_weeks) || 4,
      datosAntropometricos: st.datos_antropometricos || {},
      historialLesiones: st.historial_lesiones || '',
      evaluacionInicial: st.evaluacion_inicial || '',
      macrociclo: st.macrociclo || {},
      mesociclo: st.mesociclo || {},
      microciclo: st.microciclo || {},
      microcicloByWeek: st.microciclo_by_week || {},
      visibilitySettings: st.visibility_settings || {},
      routine: st.routine || {},
      draftRoutine: st.draft_routine || {},
      nutrition: st.nutrition || {},
      history: Array.isArray(st.history) ? st.history : []
    }));
  } catch (err) {
    console.error('Error al conectar con Supabase:', err);
    return [];
  }
}

// 🟢 PERSISTENCIA 100% DIRECTA EN SUPABASE (SIN LOCALSTORAGE)
export async function saveStudentDifferential(student) {
  if (!student || !student.id) return { error: 'ID de alumno inválido' };
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

    const { data, error } = await supabase.from('alumnos').upsert(payload).select();
    if (error) {
      console.error('Error al guardar alumno en Supabase:', error.message);
      return { error: error.message };
    }
    return { data: data?.[0] || student };
  } catch (err) {
    console.error('Excepción de red al guardar en Supabase:', err);
    return { error: err.message };
  }
}

export async function loginProfesorWithSupabase(email, password) {
  if (!supabase) return { error: 'Supabase no inicializado' };
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function logoutSupabase() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function syncVideoBankToSupabase(exerciseName, url) {
  if (!supabase || !exerciseName || !url) return;
  try {
    await supabase.from('video_bank').upsert({
      exercise_name: exerciseName.trim().toLowerCase(),
      video_url: url.trim(),
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Error sincronizando Banco de Videos en Supabase:', e);
  }
}

export async function fetchVideoBankFromSupabase() {
  if (!supabase) return {};
  try {
    const { data } = await supabase.from('video_bank').select('*');
    const bank = {};
    if (data) {
      data.forEach(item => {
        if (item.exercise_name && item.video_url) {
          bank[item.exercise_name] = item.video_url;
        }
      });
    }
    return bank;
  } catch (e) {
    console.warn('Error leyendo Banco de Videos:', e);
    return {};
  }
}

export async function fetchStudentByToken(token) {
  if (!supabase || !token) return null;
  try {
    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
      .eq('access_token', token)
      .maybeSingle();

    if (error || !data) return null;
    return {
      id: data.id,
      studentNumber: parseInt(data.student_number) || 1,
      lastname: data.apellido || '',
      firstname: data.nombre || '',
      dni: data.dni || '',
      accessToken: data.access_token || '',
      cycleType: data.cycle_type || 'Mesociclo',
      totalWeeks: parseInt(data.total_weeks) || 4,
      datosAntropometricos: data.datos_antropometricos || {},
      historialLesiones: data.historial_lesiones || '',
      evaluacionInicial: data.evaluacion_inicial || '',
      macrociclo: data.macrociclo || {},
      mesociclo: data.mesociclo || {},
      microciclo: data.microciclo || {},
      microcicloByWeek: data.microciclo_by_week || {},
      visibilitySettings: data.visibility_settings || {},
      routine: data.routine || {},
      draftRoutine: data.draft_routine || {},
      nutrition: data.nutrition || {},
      history: Array.isArray(data.history) ? data.history : []
    };
  } catch (err) {
    console.error('Error buscando alumno por token:', err);
    return null;
  }
}

export async function generateStudentAccessToken(studentId) {
  if (!studentId) return null;
  const newToken = 'st_' + generateUUID().substring(0, 12);
  const students = await fetchStudentsFromSupabase();
  const st = students.find(s => String(s.id) === String(studentId));
  if (st) {
    st.accessToken = newToken;
    await saveStudentDifferential(st);
  }
  return newToken;
}