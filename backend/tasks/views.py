from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer

# Controlador de API (ViewSet): Encapsula la lógica de los métodos HTTP (GET, POST, PUT, DELETE).
# Proporciona una interfaz CRUD estandarizada siguiendo los principios REST.
# API Controller (ViewSet): Encapsulates HTTP method logic (GET, POST, PUT, DELETE).
# Provides a standardized CRUD interface following REST principles.
class TaskViewSet(viewsets.ModelViewSet):
    # Definición del conjunto de datos fuente (QuerySet).
    # Definition of the source data set (QuerySet).
    queryset = Task.objects.all()
    
    # Inyección de la lógica de transformación de datos.
    # Injection of the data transformation logic.
    serializer_class = TaskSerializer
