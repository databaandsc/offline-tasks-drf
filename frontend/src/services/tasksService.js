import axios from 'axios';

// Accedemos a la variable del .env
// Vite usa 'import.meta.env' para leer estas variables
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  // Función para obtener todas las tareas
  getTasks() {
    return apiClient.get('tasks/');
  }
};
