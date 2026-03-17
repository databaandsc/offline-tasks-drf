import axios from 'axios';

/**
 * CAPA DE SERVICIO: Abstracción de la comunicación con la API.
 * Gestiona la URL base y configura la instancia de Axios para reutilización.
 * 
 * SERVICE LAYER: API communication abstraction.
 * Manages the Base URL and configures the Axios instance for reusability.
 */

// Inyección de configuración mediante variables de entorno (Vite).
// Configuration injection via environment variables (Vite).
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

// Cliente HTTP configurado con cabeceras globales y timeout potencial.
// HTTP Client configured with global headers and potential timeout.
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  /**
   * Recupera todas las tareas desde el endpoint GET /tasks/.
   * Fetches all tasks from the GET /tasks/ endpoint.
   */
  getTasks() {
    return apiClient.get('tasks/');
  }
};
