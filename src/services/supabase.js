import { createClient } from '@supabase/supabase-js';

// 1. Obtención y sanitización de variables de entorno de Vite
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://euhwhkykkkozoliepjlu.supabase.co').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aHdoa3lra2tvem9saWVwamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDk3NjksImV4cCI6MjEwNDEyNTc2OX0.AoxVPQoAuQdFWboxmkt0C_1l1MDJMePEO2XJdlbRslc';

// Validación básica
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ [Supabase] Las credenciales no están completamente configuradas. Se usará LocalStorage como respaldo principal.');
}

// 2. Inicialización limpia del Cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 3. Servicio de Persistencia Híbrida (Supabase Cloud + LocalStorage)
export const dbService = {
  
  /**
   * Obtiene la rutina actual almacenada localmente
   */
  getRoutine: () => {
    try {
      const data = localStorage.getItem('franco_fit_routine');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error al leer rutina local:', e);
      return null;
    }
  },

  /**
   * Guarda la rutina activa localmente e intenta sincronizarla con Supabase SQL
   */
  saveRoutine: async (data) => {
    // A. Guardado síncrono e inmediato en LocalStorage
    localStorage.setItem('franco_fit_routine', JSON.stringify(data));

    // B. Sincronización asíncrona con las tablas 'alumnos' y 'rutinas_historial' en Supabase
    try {
      if (!data.studentName) return { success: true, localOnly: true };

      // 1. Buscar o registrar alumno en la tabla 'alumnos'
      let { data: alumno, error: alumnoErr } = await supabase
        .from('alumnos')
        .select('id')
        .ilike('nombre', data.studentName.trim())
        .maybeSingle();

      if (alumnoErr) console.warn('[Supabase] Buscando alumno:', alumnoErr.message);

      if (!alumno) {
        const { data: newAlumno, error: insertAlumnoErr } = await supabase
          .from('alumnos')
          .insert([{ 
            nombre: data.studentName.trim(),
            routine: data 
          }])
          .select('id')
          .single();

        if (!insertAlumnoErr) alumno = newAlumno;
      }

      // 2. Insertar registro formal en 'rutinas_historial'
      const { error: historyErr } = await supabase
        .from('rutinas_historial')
        .insert([{
          alumno_id: alumno?.id || null,
          nombre_rutina: data.routineName || 'Rutina General',
          fecha_inicio: data.startDate || new Date().toISOString().split('T')[0],
          duracion_semanas: parseInt(data.durationWeeks, 10) || 4,
          ejercicios_json: data.exercises || [],
          nutricion_json: { notes: data.nutritionNotes || '' }
        }]);

      if (historyErr) console.warn('[Supabase] Guardado en historial:', historyErr.message);

      return { success: true, cloudSynced: !historyErr };
    } catch (err) {
      console.warn('[Supabase] Modos sin conexión. Guardado completado en LocalStorage:', err.message);
      return { success: true, cloudSynced: false };
    }
  },

  /**
   * Obtiene el historial de rutinas (prioriza Supabase, cae en LocalStorage)
   */
  getHistory: async () => {
    try {
      const { data, error } = await supabase
        .from('rutinas_historial')
        .select(`
          id,
          nombre_rutina,
          fecha_inicio,
          duracion_semanas,
          ejercicios_json,
          nutricion_json,
          alumnos ( nombre )
        `)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Mapear al formato interno de la aplicación
        const cloudHistory = data.map(item => ({
          studentName: item.alumnos?.nombre || 'Alumno Sin Nombre',
          routineName: item.nombre_rutina,
          startDate: item.fecha_inicio,
          durationWeeks: item.duracion_semanas,
          exercises: item.ejercicios_json || [],
          nutritionNotes: item.nutricion_json?.notes || ''
        }));
        
        // Actualizar cache local
        localStorage.setItem('franco_fit_history', JSON.stringify(cloudHistory));
        return cloudHistory;
      }
    } catch (e) {
      console.warn('[Supabase] No se pudo obtener el historial remoto. Leyendo local:', e.message);
    }

    // Respaldo LocalStorage
    const localData = localStorage.getItem('franco_fit_history');
    return localData ? JSON.parse(localData) : [];
  },

  /**
   * Actualiza el historial en LocalStorage
   */
  saveHistory: (history) => {
    localStorage.setItem('franco_fit_history', JSON.stringify(history));
  }
};