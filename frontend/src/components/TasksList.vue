<script setup>
/**
 * COMPONENTE DE PRESENTACIÓN: Visualización de la lista de tareas.
 * Utiliza Reactividad de Vue 3 (Composition API) y Lifecycle Hooks.
 * 
 * PRESENTATION COMPONENT: Task list visualization.
 * Leverages Vue 3 Reactivity (Composition API) and Lifecycle Hooks.
 */
import { ref, onMounted } from 'vue'
import tasksService from '../services/tasksService'

// Estado Reactivo: Mantiene la sincronización entre el JS y el DOM.
// Reactive State: Maintains synchronization between JS and the DOM.
const tasks = ref([])
const loading = ref(true)
const error = ref(null)

// NUEVO: Guardamos el texto de la nueva tarea
// NEW: Store the text for the new task
const newTaskTitle = ref('')

/**
 * Función asíncrona para la orquestación del fetch de datos.
 * Asynchronous function for data fetch orchestration.
 */
const fetchTasks = async () => {
  try {
    loading.value = true
    const response = await tasksService.getTasks()
    tasks.value = response.data
  } catch (err) {
    console.error('Error fetching tasks:', err)
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    loading.value = false
  }
}

//  Función para enviar la tarea al servidor
//  Function to send the task to the server
const addTask = async () => {
  // Evitamos crear tareas vacías. Si está en blanco, no hacemos nada.
  if (!newTaskTitle.value.trim()) return;
  
  try {
    // Enviamos solo el título 
    const response = await tasksService.createTask({ title: newTaskTitle.value });
    
    // .unshift() añade la nueva tarea de Django al principio de nuestra lista visual
    tasks.value.unshift(response.data); 
    
    // Limpiamos el texto del input
    newTaskTitle.value = '';
  } catch (err) {
    console.error('Error creating task:', err);
    error.value = 'No se pudo crear la tarea.';
  }
}

// Hook de Ciclo de Vida: Ejecución inmediata al montar el componente.
// Lifecycle Hook: Immediate execution upon component mount.
onMounted(() => {
  fetchTasks()
})
</script>

<template>
  <div class="tasks-container">
    <h2>Mi Lista de Tareas</h2>
    
    <!-- Formulario para crear tareas -->
    <div class="task-form">
      <input 
        v-model="newTaskTitle" 
        @keyup.enter="addTask"
        type="text" 
        placeholder="¿Qué necesitas hacer hoy?" 
        class="task-input"
      />
      <button @click="addTask" class="task-button">Añadir</button>
    </div>

    <!-- Resto de la página -->
    <p v-if="loading" class="loading">Cargando tareas...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-else-if="tasks.length === 0" class="empty">Aún no hay tareas. ¡Empieza a crear una!</p>
    
    <ul v-else class="task-list">
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <span class="status">{{ task.completed ? '✓' : '◯' }}</span>
        <span>{{ task.title }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Estilos sencillos  */
.tasks-container { max-width: 500px; margin: 2rem auto; text-align: left; }

/* Estilos para el formulario */
.task-form { display: flex; gap: 10px; margin-bottom: 20px; }
.task-input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
.task-input:focus { outline: none; border-color: #42b983; }

.task-button { padding: 10px 20px; background-color: #42b983; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; transition: background-color 0.2s; }
.task-button:hover { background-color: #3aa876; }

/* Lista de tareas */
.task-list { list-style: none; padding: 0; }
.task-item { padding: 15px; border-bottom: 1px solid #eee; display: flex; gap: 10px; align-items: center;}
.status { font-weight: bold; color: #42b983; font-size: 18px; }
.loading, .error, .empty { text-align: center; color: #666; font-style: italic; }
.error { color: #d9534f; }
</style>
