import { createClient } from '@supabase/supabase-js';

// Configuración Backend Gratis en Supabase
// Reemplazar estas variables con las claves gratuitas de tu panel en supabase.com
const SUPABASE_URL = 'https://euhwhkykkkozoliepjlu.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aHdoa3lra2tvem9saWVwamx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1NDk3NjksImV4cCI6MjEwNDEyNTc2OX0.AoxVPQoAuQdFWboxmkt0C_1l1MDJMePEO2XJdlbRslc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Guardado de respaldo en LocalStorage cuando no hay conexión a Supabase
export const localDB = {
  getRoutine: () => JSON.parse(localStorage.getItem('franco_fit_routine')) || null,
  saveRoutine: (data) => localStorage.setItem('franco_fit_routine', JSON.stringify(data)),
  getHistory: () => JSON.parse(localStorage.getItem('franco_fit_history')) || [],
  saveHistory: (history) => localStorage.setItem('franco_fit_history', JSON.stringify(history))
};