
from rest_framework import serializers

from .models import InstitucionEducativa, ResultadoSaber


class InstitucionEducativaSerializer(serializers.ModelSerializer):
    
    total_evaluados = serializers.IntegerField(
        read_only=True,
        required=False,
        help_text='Total de pruebas Saber 11 asociadas a esta institución.'
    )

    class Meta:
        model = InstitucionEducativa
        fields = [
            'id',
            'codigo_dane',
            'nombre',
            'departamento',
            'municipio',
            'naturaleza',
            'zona',
            'total_evaluados',
            'fecha_registro',
            'fecha_actualizacion',
        ]
        extra_kwargs = {
            'codigo_dane': {'required': True},
            'nombre': {'required': True},
            'departamento': {'required': True},
            'municipio': {'required': True},
        }

    def validate_codigo_dane(self, valor):
        
        codigo_limpio = str(valor).strip()
        if not codigo_limpio:
            raise serializers.ValidationError('El código DANE no puede estar vacío.')
        return codigo_limpio


class ResultadoSaberSerializer(serializers.ModelSerializer):
    
    institucion_nombre = serializers.ReadOnlyField(
        source='institucion.nombre',
        help_text='Nombre de la institución educativa vinculada.'
    )

    institucion_dane = serializers.ReadOnlyField(
        source='institucion.codigo_dane',
        help_text='Código DANE de la institución vinculada.'
    )

    departamento = serializers.ReadOnlyField(
        source='institucion.departamento',
        help_text='Departamento territorial de la institución.'
    )

    municipio = serializers.ReadOnlyField(
        source='institucion.municipio',
        help_text='Municipio territorial de la institución.'
    )

    naturaleza = serializers.ReadOnlyField(
        source='institucion.naturaleza',
        help_text='Naturaleza administrativa de la institución.'
    )

    zona = serializers.ReadOnlyField(
        source='institucion.zona',
        help_text='Zona geográfica de la institución.'
    )

    class Meta:
        model = ResultadoSaber
        fields = [
            'id',
            'institucion',
            'institucion_nombre',
            'institucion_dane',
            'departamento',
            'municipio',
            'naturaleza',
            'zona',
            'consecutivo',
            'anio',
            'periodo',
            'puntaje_global',
            'puntaje_matematicas',
            'puntaje_lectura',
            'puntaje_ciencias',
            'puntaje_ingles',
            'puntaje_sociales',
            'observacion',
            'fecha_creacion',
            'fecha_actualizacion',
        ]
        extra_kwargs = {
            'consecutivo': {'required': True},
            'puntaje_global': {'min_value': 0, 'max_value': 500},
            'puntaje_matematicas': {'min_value': 0, 'max_value': 100},
            'puntaje_lectura': {'min_value': 0, 'max_value': 100},
            'puntaje_ciencias': {'min_value': 0, 'max_value': 100},
            'puntaje_ingles': {'min_value': 0, 'max_value': 100},
            'puntaje_sociales': {'min_value': 0, 'max_value': 100},
            'anio': {'min_value': 2000, 'max_value': 2030},
        }

    def validate_puntaje_global(self, valor):
       
        if valor < 0 or valor > 500:
            raise serializers.ValidationError('El puntaje global debe ubicarse en el rango de 0 a 500 puntos.')
        return valor

    def validate_consecutivo(self, valor):
        
        consecutivo_limpio = str(valor).strip().upper()
        if not consecutivo_limpio:
            raise serializers.ValidationError('El consecutivo del examen es obligatorio.')
        return consecutivo_limpio
