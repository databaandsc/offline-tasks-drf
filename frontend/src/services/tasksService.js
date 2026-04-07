import axios from 'axios';

/**
 * CAPA DE SERVICIO: Abstracción de la comunicación con la API y Almacenamiento Offline.
 * SERVICE LAYER: API communication and Offline Storage abstraction.
 */

// Inyección de configuración mediante variables de entorno (Vite).
// Configuration injection via environment variables (Vite).
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

// Clave de almacenamiento constante para la caché local.
// Constant storage key for local cache.
const CACHE_KEY = 'tasks_offline_cache';

// Cliente HTTP configurado con cabeceras globales.
// HTTP Client configured with global headers.
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  /**
   * Intenta obtener tareas del servidor. Si falla (offline), devuelve la versión en caché.
   * Attempts to fetch tasks from server. If it fails (offline), returns cached version.
   */
  async getTasks() {
    try {
      // Intento de conexión con el backend.
      // Attempting connection with the backend.
      const response = await apiClient.get('tasks/');
      
      // Persistencia local: Guardado de la copia más reciente si hay éxito.
      // Local persistence: Saving the most recent copy on success.
      localStorage.setItem(CACHE_KEY, JSON.stringify(response.data));
      
      return response;
    } catch (error) {
      // Fallback: Recuperación estática desde LocalStorage ante pérdida de red.
      // Fallback: Static retrieval from LocalStorage upon network loss.
      console.warn("Offline mode active. Loading cached tasks...");
      
      const cachedData = localStorage.getItem(CACHE_KEY);
      
      if (cachedData) {
        // Retorno estructurado para simular la respuesta estándar de Axios.
        // Structured return to simulate standard Axios response.
        return { data: JSON.parse(cachedData) };
      }
      
      // Propagación del error crítico si el servidor cae y no hay caché local.
      // Critical error propagation if server is down and no local cache exists.
      throw error; 
    }
  },
  
  /**
   * Crea una nueva tarea. Si el servidor está caído, la guarda en local
   * con una marca para sincronizarla más tarde.
   * Creates a new task. If server is down, saves locally for later sync.
   */
  async createTask(taskData) {
    try {
      // Intentamos enviarla a Django
      // Attempting to send it to Django
      const response = await apiClient.post('tasks/', taskData);
      
      // Si hay éxito, actualizamos la caché (LocalStorage)
      // On success, we update the cache (LocalStorage)
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const tasksList = JSON.parse(cachedData); 
        tasksList.unshift(response.data);         
        localStorage.setItem(CACHE_KEY, JSON.stringify(tasksList)); 
      }
      
      return response;
      
    } catch (error) {
      // ¡Django está apagado o no hay internet! (Modo Offline)
      // Django is down or there is no internet! (Offline Mode)
      console.warn("Unreachable server. Saving task in offline mode...");
      
      // Creamos una tarea simulada con un ID temporal basado en la fecha
      // We create a simulated task with a temporary date-based ID
      const offlineTask = {
        id: Date.now(),
        title: taskData.title,
        completed: false,
        sync_pending: true // Nuestra marca interna / Our internal marker
      };
      
      // Recuperamos la caché local o creamos una lista vacía si no existe
      // We retrieve the local cache or create an empty list if it doesn't exist
      const cachedData = localStorage.getItem(CACHE_KEY);
      const tasksList = cachedData ? JSON.parse(cachedData) : [];
      
      // Insertamos la tarea simulada
      // We insert the simulated task
      tasksList.unshift(offlineTask);
      localStorage.setItem(CACHE_KEY, JSON.stringify(tasksList));
      
      // Devolvemos la tarea simulada a Vue para que la renderice
      // We return the simulated task to Vue so it can render it
      return { data: offlineTask };
    }
  },

    /**
   * Actualiza una tarea. Si está offline, la actualiza en la caché local.
   * Updates a task. If offline, it updates it in the local cache.
   */
    async updateTask(taskId, taskData) {
      try {
        // Intentamos usar PATCH para enviar solo lo que cambió (ej: completed: true)
        // We try using PATCH to send only what changed (e.g., completed: true)
        const response = await apiClient.patch(`tasks/${taskId}/`, taskData);
        
        // Actualizamos la caché local
        // We update the local cache
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          let tasksList = JSON.parse(cachedData);
          tasksList = tasksList.map(t => t.id === taskId ? response.data : t);
          localStorage.setItem(CACHE_KEY, JSON.stringify(tasksList));
        }
        return response;
      } catch (error) {
        console.warn("[Offline] Updating task locally...");
        
        // Modo Offline: Modificamos la tarea y le ponemos otra marca
        // Offline Mode: We modify the task and add another marker
        const cachedData = localStorage.getItem(CACHE_KEY);
        let tasksList = cachedData ? JSON.parse(cachedData) : [];
        let updatedTask = null;
        
        tasksList = tasksList.map(t => {
          if (t.id === taskId) {
             updatedTask = { ...t, ...taskData, update_pending: true };
             return updatedTask;
          }
          return t;
        });
        
        localStorage.setItem(CACHE_KEY, JSON.stringify(tasksList));
        return { data: updatedTask };
      }
    },
  
    /**
     * Borra una tarea. Si es una tarea offline o no hay red, la maneja en caché.
     * Deletes a task. If it's an offline task or network is down, handles in cache.
     */
    async deleteTask(taskId) {
      try {
        // Si el ID es gigante y numérico (nuestro invento), no existe en Django
        // If the ID is a huge number (our invention), it does not exist in Django
        if (typeof taskId === 'number' && taskId > 1000000000000) {
          throw new Error("Temporary offline ID");
        }
        
        // Intentamos borrar en el servidor real
        // We try to delete in the real server
        await apiClient.delete(`tasks/${taskId}/`);
        
        // Eliminamos de la caché local si tuvo éxito
        // We remove from local cache upon success
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const tasksList = JSON.parse(cachedData).filter(t => t.id !== taskId);
          localStorage.setItem(CACHE_KEY, JSON.stringify(tasksList));
        }
        return { data: { success: true } };
        
      } catch (error) {
        console.warn("[Offline] Marking task for deletion...");
        
        // Modo Offline: En lugar de borrar la tarea (para no perderla si el server vive), la marcamos
        // Offline Mode: Instead of deleting (to avoid losing it if server is up), we mark it
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          let tasksList = JSON.parse(cachedData);
          tasksList = tasksList.map(t => t.id === taskId ? { ...t, delete_pending: true } : t);
          localStorage.setItem(CACHE_KEY, JSON.stringify(tasksList));
        }
        return { data: { success: true } };
      }
    },  

  /**
   * Busca tareas pendientes en local y las envía al servidor al recuperar conexión.
   * Scans for pending local tasks and sends them to the server upon connection recovery.
   */
  async syncOfflineTasks() {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return;

    let tasksList = JSON.parse(cachedData);
    
    // Filtramos las tareas que tienen nuestra marca 'sync_pending'
    // We filter out the tasks that carry our 'sync_pending' marker
    const pendingTasks = tasksList.filter(task => task.sync_pending);
    
    if (pendingTasks.length === 0) return;

    console.log(`[Sync] Synchronizing ${pendingTasks.length} pending tasks...`);

    for (const task of pendingTasks) {
      try {
        // Preparamos los datos limpios (sin el ID temporal ni la marca)
        // We prepare clean data (removing temporary ID and marker)
        const cleanData = {
          title: task.title,
          completed: task.completed
        };

        // Realizamos la petición real al servidor
        // We perform the actual request to the server
        const response = await apiClient.post('tasks/', cleanData);
        
        // Actualizamos caché local reemplazando la tarea temporal por la real
        // We update local cache replacing the temporary task with the real one
        tasksList = tasksList.map(t => 
          t.id === task.id ? response.data : t
        );
        
        console.log(`[Sync] Task '${task.title}' successfully synchronized.`);
      } catch (error) {
        console.error(`[Sync] Failed to synchronize task '${task.title}':`, error);
      }
    }

    // Guardamos la lista actualizada (sin las marcas de los que tuvieron éxito)
    // We save the updated list (without markers for successful ones)
    localStorage.setItem(CACHE_KEY, JSON.stringify(tasksList));
    
    // Retornamos la lista para actualizar la vista
    // We return the list to trigger a view update
    return tasksList;
  }
}
