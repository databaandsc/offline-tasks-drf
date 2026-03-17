from django.db import models

# ES: Definición del esquema de datos para la entidad Task.
# Utiliza el ORM de Django para abstraer la persistencia en SQLite.
# EN: Data schema definition for the Task entity.
# Leverages Django ORM to abstract persistence in SQLite.
class Task(models.Model):
    #  Título de la tarea. Se define como CharField para optimizar el almacenamiento indexado.
    #  Task title. Defined as CharField to optimize indexed storage.
    title = models.CharField(max_length=200)
    
    #  Descripción detallada. TextField permite contenido de longitud variable sin restricciones rígidas.
    #  Detailed description. TextField allows variable length content without rigid constraints.
    description = models.TextField(blank=True)
    
    #  Flag booleano para el estado de completitud. Default False para nuevas instancias.
    #  Boolean flag for completion status. Defaults to False for new instances.
    completed = models.BooleanField(default=False)
    
    #  Timestamp inmutable de creación. Gestionado automáticamente por el motor de base de datos.
    #  Immutable creation timestamp. Automatically managed by the database engine.
    created_at = models.DateTimeField(auto_now_add=True)

    #  Manager explícito para satisfacer linting y facilitar futuras consultas personalizadas.
    #  Explicit manager to satisfy linting and facilitate future custom queries.
    objects = models.Manager() 

    def __str__(self):
        #  Representación en cadena utilizada en logs y el Panel Administrativo.
        #  String representation used in logs and the Administrative Panel.
        return str(self.title)