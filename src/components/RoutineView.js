/**
 * Módulo Principal: Formulario de creación de Rutinas y Nutrición + Vista Previa Móvil
 */
export function renderRoutineView(data) {
  return `
    <div class="p-4 space-y-6" id="pdf-content">
      
      <!-- Ficha Alumno -->
      <section class="bg-brand-gray p-4 rounded-xl border border-gray-800 shadow-md">
        <h3 class="text-xs font-bold text-brand-gold uppercase tracking-wider mb-3 flex items-center gap-2">
          <i data-lucide="user" class="w-4 h-4"></i> Datos del Alumno
        </h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label class="block text-[10px] text-gray-400">Nombre del Alumno</label>
            <input type="text" id="studentName" value="${data.studentName || ''}" class="w-full bg-brand-black border border-gray-700 rounded p-2 text-white mt-1 focus:border-brand-gold focus:outline-none text-xs" placeholder="Ej: Juan Pérez" />
          </div>
          <div>
            <label class="block text-[10px] text-gray-400">Nombre de Rutina</label>
            <input type="text" id="routineName" value="${data.routineName || ''}" class="w-full bg-brand-black border border-gray-700 rounded p-2 text-white mt-1 focus:border-brand-gold focus:outline-none text-xs" placeholder="Ej: Hipertrofia Fase 1" />
          </div>
          <div>
            <label class="block text-[10px] text-gray-400">Fecha de Inicio</label>
            <input type="date" id="startDate" value="${data.startDate || new Date().toISOString().split('T')[0]}" class="w-full bg-brand-black border border-gray-700 rounded p-2 text-white mt-1 focus:border-brand-gold focus:outline-none text-xs" />
          </div>
          <div>
            <label class="block text-[10px] text-gray-400">Duración (Semanas)</label>
            <input type="number" id="durationWeeks" value="${data.durationWeeks || 4}" class="w-full bg-brand-black border border-gray-700 rounded p-2 text-white mt-1 focus:border-brand-gold focus:outline-none text-xs" />
          </div>
        </div>
      </section>

      <!-- Módulo de Ejercicios -->
      <section class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-xs font-bold text-brand-gold uppercase tracking-wider flex items-center gap-2">
            <i data-lucide="dumbbell" class="w-4 h-4"></i> Plan de Ejercicios
          </h3>
          <button id="add-exercise-btn" class="no-print bg-brand-gold text-black px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 active:scale-95 transition-all">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Agregar
          </button>
        </div>

        <div id="exercises-container" class="space-y-4">
          <!-- Renderizado dinámico de ejercicios -->
          ${(data.exercises || []).map((ex, index) => renderExerciseCard(ex, index)).join('')}
        </div>
      </section>

      <!-- Módulo Nutricional -->
      <section class="bg-brand-gray p-4 rounded-xl border border-gray-800 shadow-md">
        <h3 class="text-xs font-bold text-brand-gold uppercase tracking-wider mb-2 flex items-center gap-2">
          <i data-lucide="apple" class="w-4 h-4"></i> Guía Nutricional & Hábitos
        </h3>
        <textarea id="nutritionNotes" rows="3" class="w-full bg-brand-black border border-gray-700 rounded p-2 text-white text-xs focus:border-brand-gold focus:outline-none" placeholder="Recomendaciones de hidratación, proteínas y suplementación...">${data.nutritionNotes || ''}</textarea>
      </section>

      <!-- Acciones Rápidas (No imprimibles) -->
      <div class="no-print pt-2 space-y-3">
        <button id="save-routine-btn" class="w-full bg-brand-gold text-black font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 text-sm uppercase active:scale-95 transition-all">
          <i data-lucide="save" class="w-4 h-4"></i> Guardar Rutina
        </button>
        <button id="export-pdf-btn" class="w-full bg-gray-800 border border-brand-gold text-brand-gold font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 text-sm uppercase active:scale-95 transition-all">
          <i data-lucide="file-text" class="w-4 h-4"></i> Exportar en PDF
        </button>
      </div>

    </div>
  `;
}

function renderExerciseCard(ex, index) {
  return `
    <div class="bg-brand-gray p-4 rounded-xl border border-gray-800 relative space-y-3" data-index="${index}">
      <button class="no-print remove-ex-btn absolute top-3 right-3 text-red-400 hover:text-red-300" data-index="${index}">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
      
      <div>
        <label class="block text-[10px] text-gray-400">Nombre del Ejercicio</label>
        <input type="text" class="ex-name w-full bg-brand-black border border-gray-700 rounded p-2 text-white text-xs mt-1" value="${ex.name || ''}" placeholder="Ej: Sentadilla Búlgara" />
      </div>

      <!-- Video Demostrativo Corto (Loop sin audio para ahorro de datos) -->
      <div>
        <label class="block text-[10px] text-gray-400 mb-1">Video Táctico / GIF (URL Cloudinary/MP4)</label>
        <input type="url" class="ex-video-url w-full bg-brand-black border border-gray-700 rounded p-2 text-white text-xs mb-2" value="${ex.videoUrl || ''}" placeholder="https://res.cloudinary.com/demo/video/upload/sample.mp4" />
        ${ex.videoUrl ? `
          <div class="relative rounded-lg overflow-hidden border border-gray-700 max-h-40 bg-black">
            <video src="${ex.videoUrl}" autoplay loop muted playsinline class="w-full h-36 object-cover"></video>
          </div>
        ` : ''}
      </div>

      <div class="grid grid-cols-3 gap-2 text-center">
        <div>
          <span class="block text-[10px] text-gray-400">Series</span>
          <input type="text" class="ex-sets bg-brand-black border border-gray-700 rounded p-1.5 text-white text-xs w-full text-center mt-1" value="${ex.sets || '4'}" />
        </div>
        <div>
          <span class="block text-[10px] text-gray-400">Reps</span>
          <input type="text" class="ex-reps bg-brand-black border border-gray-700 rounded p-1.5 text-white text-xs w-full text-center mt-1" value="${ex.reps || '10-12'}" />
        </div>
        <div>
          <span class="block text-[10px] text-gray-400">Días</span>
          <input type="text" class="ex-days bg-brand-black border border-gray-700 rounded p-1.5 text-white text-xs w-full text-center mt-1" value="${ex.days || 'Lun-Jue'}" />
        </div>
      </div>
    </div>
  `;
}