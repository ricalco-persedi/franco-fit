/**
 * Módulo Principal: Formulario de creación de Rutinas y Nutrición + Vista Previa Móvil
 * Totalmente optimizado para Tailwind CLI y acoplado con src/main.js
 */
export function renderRoutineView(data = {}) {
  const exercises = data.exercises || [];

  return `
    <div class="space-y-6 pb-6" id="pdf-content">
      
      <section class="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <h3 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <i data-lucide="user" class="w-4 h-4"></i> Datos del Alumno
        </h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label class="block text-[10px] text-slate-400 font-medium">Nombre del Alumno</label>
            <input 
              type="text" 
              id="studentName" 
              value="${data.studentName || ''}" 
              class="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 mt-1 focus:border-amber-500 focus:outline-none text-xs transition-colors" 
              placeholder="Ej: Juan Pérez" 
            />
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 font-medium">Nombre de Rutina</label>
            <input 
              type="text" 
              id="routineName" 
              value="${data.routineName || ''}" 
              class="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 mt-1 focus:border-amber-500 focus:outline-none text-xs transition-colors" 
              placeholder="Ej: Hipertrofia Fase 1" 
            />
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 font-medium">Fecha de Inicio</label>
            <input 
              type="date" 
              id="startDate" 
              value="${data.startDate || new Date().toISOString().split('T')[0]}" 
              class="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 mt-1 focus:border-amber-500 focus:outline-none text-xs transition-colors" 
            />
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 font-medium">Duración (Semanas)</label>
            <input 
              type="number" 
              id="durationWeeks" 
              value="${data.durationWeeks || 4}" 
              class="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 mt-1 focus:border-amber-500 focus:outline-none text-xs transition-colors" 
            />
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex justify-between items-center px-1">
          <h3 class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <i data-lucide="dumbbell" class="w-4 h-4"></i> Plan de Ejercicios
          </h3>
          <button 
            id="add-exercise-btn" 
            type="button"
            class="no-print bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Agregar Ejercicio
          </button>
        </div>

        <div id="exercises-container" class="space-y-4">
          ${exercises.length > 0 
            ? exercises.map((ex, index) => renderExerciseCard(ex, index)).join('')
            : `<div class="text-center py-8 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-xs">
                No hay ejercicios agregados a esta rutina.
               </div>`
          }
        </div>
      </section>

      <section class="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <h3 class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <i data-lucide="apple" class="w-4 h-4"></i> Guía Nutricional & Hábitos
        </h3>
        <textarea 
          id="nutritionNotes" 
          rows="3" 
          class="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-slate-100 text-xs focus:border-amber-500 focus:outline-none transition-colors resize-none" 
          placeholder="Recomendaciones de hidratación, proteínas y suplementación..."
        >${data.nutritionNotes || ''}</textarea>
      </section>

      <div class="no-print pt-2 space-y-3">
        <button 
          id="save-routine-btn" 
          type="button"
          class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 rounded-xl shadow-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 transition-all"
        >
          <i data-lucide="save" class="w-4 h-4"></i> Guardar Rutina
        </button>
        
        <button 
          id="export-pdf-btn" 
          type="button"
          class="w-full bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-400 font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider active:scale-95 transition-all"
        >
          <i data-lucide="file-down" class="w-4 h-4"></i> Exportar en PDF
        </button>
      </div>

    </div>
  `;
}

/**
 * Renderizado de Tarjeta Individual de Ejercicio
 */
function renderExerciseCard(ex, index) {
  return `
    <div class="exercise-item-row bg-slate-900 p-4 rounded-2xl border border-slate-800 relative space-y-3 shadow-md" data-index="${index}">
      
      <button 
        type="button"
        class="no-print remove-ex-btn absolute top-3.5 right-3.5 text-slate-500 hover:text-red-400 transition-colors p-1" 
        data-index="${index}"
        title="Eliminar ejercicio"
      >
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>

      <div class="pr-8">
        <label class="block text-[10px] text-slate-400 font-medium">Nombre del Ejercicio</label>
        <input 
          type="text" 
          class="ex-name w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-slate-100 text-xs mt-1 focus:border-amber-500 focus:outline-none" 
          value="${ex.name || ''}" 
          placeholder="Ej: Sentadilla Búlgara" 
        />
      </div>

      <div>
        <label class="block text-[10px] text-slate-400 font-medium mb-1">URL Video Demostrativo (MP4 / WebM)</label>
        <input 
          type="url" 
          class="ex-video w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-slate-100 text-xs mb-2 focus:border-amber-500 focus:outline-none" 
          value="${ex.videoUrl || ''}" 
          placeholder="https://res.cloudinary.com/demo/video/upload/sample.mp4" 
        />
        ${ex.videoUrl ? `
          <div class="relative rounded-xl overflow-hidden border border-slate-800 max-h-40 bg-slate-950">
            <video 
              src="${ex.videoUrl}" 
              autoplay 
              loop 
              muted 
              playsinline 
              class="w-full h-36 object-cover pointer-events-none"
            ></video>
          </div>
        ` : ''}
      </div>

      <div class="grid grid-cols-3 gap-2 text-center pt-1">
        <div>
          <span class="block text-[10px] text-slate-400 font-medium">Series</span>
          <input 
            type="text" 
            class="ex-sets bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-slate-100 text-xs w-full text-center mt-1 focus:border-amber-500 focus:outline-none font-semibold" 
            value="${ex.sets || '4'}" 
          />
        </div>
        <div>
          <span class="block text-[10px] text-slate-400 font-medium">Reps</span>
          <input 
            type="text" 
            class="ex-reps bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-slate-100 text-xs w-full text-center mt-1 focus:border-amber-500 focus:outline-none font-semibold" 
            value="${ex.reps || '10-12'}" 
          />
        </div>
        <div>
          <span class="block text-[10px] text-slate-400 font-medium">Días</span>
          <input 
            type="text" 
            class="ex-days bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-slate-100 text-xs w-full text-center mt-1 focus:border-amber-500 focus:outline-none font-semibold" 
            value="${ex.days || 'Lun-Jue'}" 
          />
        </div>
      </div>

    </div>
  `;
}