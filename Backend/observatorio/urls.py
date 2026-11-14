
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    EstadisticasView,
    EstadoSistemaView,
    InstitucionViewSet,
    InyeccionMasivaView,
    LimpiezaMasivaView,
    ResultadoViewSet,
    ResumenIngestionView,
)


router = DefaultRouter()

router.register('instituciones', InstitucionViewSet, basename='institucion')

router.register('resultados', ResultadoViewSet, basename='resultado')

urlpatterns = [
    path('estado/', EstadoSistemaView.as_view(), name='api-estado'),

    path('resultados/estadisticas/', EstadisticasView.as_view(), name='api-estadisticas'),

    path('resultados/inyeccion/', InyeccionMasivaView.as_view(), name='api-inyeccion'),

    path('resultados/limpieza/', LimpiezaMasivaView.as_view(), name='api-limpieza'),

    path('resumen-ingestion/', ResumenIngestionView.as_view(), name='resumen-ingestion'),

    *router.urls,
]
