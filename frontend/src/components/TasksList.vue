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

// Función para cambiar el estado de completado
// Function to toggle completion status
const toggleTask = async (task) => {
  try {
    const updatedData = { completed: !task.completed };
    // Llamamos a nuestro nuevo servicio
    // We call our new service
    const response = await tasksService.updateTask(task.id, updatedData);
    
    // Y actualizamos visualmente el estado
    // And visually update the state
    task.completed = response.data.completed;
  } catch (err) {
    console.error("[Error] Failed to update task:", err);
  }
}

// Función para eliminar definitivamente
// Function to delete definitively
const removeTask = async (id) => {
  try {
    await tasksService.deleteTask(id);
    // Para no recargar, simplemente filtramos nuestra lista en pantalla
    // To avoid reload, we simply filter our list on screen
    tasks.value = tasks.value.filter(t => t.id !== id);
  } catch (err) {
    console.error("[Error] Failed to delete task:", err);
  }
}


// Hook de Ciclo de Vida: Ejecución inmediata al montar el componente.
// Lifecycle Hook: Immediate execution upon component mount.
onMounted(() => {
  fetchTasks();

  // Escuchamos el evento nativo del navegador 'online'
  // We listen to the native browser 'online' event
  window.addEventListener('online', async () => {
    console.log("[Sync] Connection restored! Initiating synchronization...");
    
    const updatedTasks = await tasksService.syncOfflineTasks();
    
    if (updatedTasks) {
      // Si hubo sincronización, actualizamos la lista visual para tener los IDs reales de Django
      // If sync occurred, we update the visual list to reflect real Django IDs
      tasks.value = updatedTasks;
    }
  });
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
      <!-- El v-if es para ocultar inmediatamente de la vista las tareas borradas offline -->
      <li v-for="task in tasks" :key="task.id" class="task-item" v-if="!task.delete_pending">
        
        <!-- Círculo que se puede clickear -->
        <span @click="toggleTask(task)" class="status toggle-btn">
          {{ task.completed ? '✓' : '◯' }}
        </span>
        
        <!-- Texto de la tarea, que se tacha si está completada -->
        <span :class="{ 'task-done': task.completed }" class="task-title">
          {{ task.title }}
        </span>
        
        <!-- Botón de papelera / Borrar -->
        <button @click="removeTask(task.id)" class="delete-btn">X</button>
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

/* Nuevos estilos para Misión 2 */
.toggle-btn { cursor: pointer; user-select: none; width: 30px;}
.toggle-btn:hover { opacity: 0.7; }
.task-title { flex: 1; transition: color 0.3s; }
.task-done { text-decoration: line-through; color: #a0a0a0; }

.delete-btn {
  background-color: transparent;
  color: #ff5252;
  border: 1px solid #ff5252;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}
.delete-btn:hover { background-color: #ff5252; color: white; }
</style>
