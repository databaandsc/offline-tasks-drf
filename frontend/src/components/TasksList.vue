<script setup>
import { ref, onMounted } from 'vue'
import tasksService from '../services/tasksService'

const tasks = ref([])
const loading = ref(true)
const error = ref(null)

const fetchTasks = async () => {
  try {
    loading.value = true
    // 2. Usamos el servicio. ¡Mucho más limpio!
    const response = await tasksService.getTasks()
    tasks.value = response.data
  } catch (err) {
    console.error('Error fetching tasks:', err)
    error.value = 'No se pudo conectar con el servidor.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTasks()
})
</script>


<template>
  <div class="tasks-container">
    <h2>Mi Lista de Tareas</h2>

    <div v-if="loading">Cargando tareas...</div>
    
    <div v-else-if="error" class="error-msg">
      {{ error }}
    </div>

    <div v-else>
      <ul v-if="tasks.length > 0" class="task-list">
        <li v-for="task in tasks" :key="task.id" class="task-item">
          <input type="checkbox" :checked="task.completed" disabled />
          <span :class="{ done: task.completed }">{{ task.title }}</span>
        </li>
      </ul>
      <p v-else>Aún no hay tareas. Créalas en el Admin de Django.</p>
    </div>
  </div>
</template>

<style scoped>
/* Estilos sencillos para que se vea profesional */
.tasks-container { max-width: 500px; margin: 2rem auto; text-align: left; }
.task-list { list-style: none; padding: 0; }
.task-item { padding: 10px; border-bottom: 1px solid #eee; display: flex; gap: 10px; }
.done { text-decoration: line-through; color: #888; }
.error-msg { color: #e74c3c; font-weight: bold; }
</style>
