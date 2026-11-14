
from django.contrib import admin

from .models import InstitucionEducativa, ResultadoSaber


@admin.register(InstitucionEducativa)
class InstitucionEducativaAdmin(admin.ModelAdmin):
    
    list_display = (
        'codigo_dane',
        'nombre',
        'departamento',
        'municipio',
        'naturaleza',
        'zona',
        'fecha_registro',
    )

    search_fields = (
        'codigo_dane',
        'nombre',
        'municipio',
        'departamento',
    )

    list_filter = (
        'departamento',
        'naturaleza',
        'zona',
    )

    ordering = ('nombre',)

    list_per_page = 50


@admin.register(ResultadoSaber)
class ResultadoSaberAdmin(admin.ModelAdmin):
   
    list_display = (
        'consecutivo',
        'institucion_nombre_columna',
        'anio',
        'periodo',
        'puntaje_global',
        'puntaje_matematicas',
        'puntaje_lectura',
        'puntaje_ciencias',
        'puntaje_ingles',
        'fecha_creacion',
    )

    search_fields = (
        'consecutivo',
        'institucion__nombre',
        'institucion__codigo_dane',
        'institucion__municipio',
    )

    list_filter = (
        'anio',
        'periodo',
        'institucion__departamento',
        'institucion__naturaleza',
        'institucion__zona',
    )

    ordering = ('-anio', '-puntaje_global')

    list_per_page = 50

    list_select_related = ('institucion',)

    autocomplete_fields = ('institucion',)

    def institucion_nombre_columna(self, obj):
        return obj.institucion.nombre

    institucion_nombre_columna.short_description = 'Colegio / Sede'
    institucion_nombre_columna.admin_order_field = 'institucion__nombre'
