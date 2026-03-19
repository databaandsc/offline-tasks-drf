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
   * Crea una nueva tarea enviándola al servidor.
   * Creates a new task by posting it to the server.
   */
  createTask(taskData) {
    return apiClient.post('tasks/', taskData);
  }
};
