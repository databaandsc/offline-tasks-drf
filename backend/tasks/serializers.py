from rest_framework import serializers
from .models import Task

# Capa de serialización: Transforma modelos de base de datos en JSON y viceversa.
# Implementa validación automática basada en los campos del modelo.
# Serialization Layer: Transforms database models into JSON and vice-versa.
# Implements automatic validation based on model fields.
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        # Asociación con el modelo Task y exposición de todos sus atributos.
        # ssociation with the Task model and exposure of all its attributes.
        model = Task
        fields = '__all__'