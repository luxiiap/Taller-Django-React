
import time

import unicodedata
from django.db import connection
from django.db.models import Avg, Count, Max, Min, Q
from rest_framework import filters, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .fuente_icfes import descargar_e_importar_icfes
from .models import InstitucionEducativa, ResultadoSaber
from .paginacion import PaginacionSaber
from .serializers import InstitucionEducativaSerializer, ResultadoSaberSerializer


class PermisoEscrituraAutenticada(permissions.BasePermission):
  

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated)


class InstitucionViewSet(viewsets.ModelViewSet):
    
    queryset = InstitucionEducativa.objects.annotate(
        total_evaluados=Count('resultados')
    ).all()
    serializer_class = InstitucionEducativaSerializer
    pagination_class = PaginacionSaber
    permission_classes = [PermisoEscrituraAutenticada]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['codigo_dane', 'nombre', 'municipio', 'departamento']
    ordering_fields = ['nombre', 'departamento', 'municipio', 'codigo_dane', 'total_evaluados']
    ordering = ['nombre']

    def get_queryset(self):
        
        qs = super().get_queryset()

        depto = self.request.query_params.get('departamento')
        if depto:
            qs = qs.filter(departamento__iexact=depto.strip())

        mcpio = self.request.query_params.get('municipio')
        if mcpio:
            qs = qs.filter(municipio__iexact=mcpio.strip())

        naturaleza = self.request.query_params.get('naturaleza')
        if naturaleza:
            qs = qs.filter(naturaleza__iexact=naturaleza.strip())

        zona = self.request.query_params.get('zona')
        if zona:
            qs = qs.filter(zona__iexact=zona.strip())

        return qs


class ResultadoViewSet(viewsets.ModelViewSet):
  
    queryset = ResultadoSaber.objects.select_related('institucion').all()
    serializer_class = ResultadoSaberSerializer
    pagination_class = PaginacionSaber
    permission_classes = [PermisoEscrituraAutenticada]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    search_fields = [
        'consecutivo',
        'institucion__nombre',
        'institucion__codigo_dane',
        'institucion__municipio',
        'institucion__departamento',
    ]

    ordering_fields = [
        'puntaje_global',
        'anio',
        'puntaje_matematicas',
        'puntaje_lectura',
        'puntaje_ciencias',
        'puntaje_ingles',
        'puntaje_sociales',
        'consecutivo',
    ]
    ordering = ['-anio', '-puntaje_global']

    def get_queryset(self):
       
        qs = ResultadoSaber.objects.select_related('institucion').all()
        params = self.request.query_params

        anio = params.get('anio')
        if anio and anio.isdigit():
            qs = qs.filter(anio=int(anio))

        periodo = params.get('periodo')
        if periodo:
            qs = qs.filter(periodo=periodo.strip())

        departamento = params.get('departamento')
        if departamento:
            qs = qs.filter(institucion__departamento__iexact=departamento.strip())

        municipio = params.get('municipio')
        if municipio:
            qs = qs.filter(institucion__municipio__iexact=municipio.strip())

        naturaleza = params.get('naturaleza')
        if naturaleza:
            qs = qs.filter(institucion__naturaleza__iexact=naturaleza.strip())

        zona = params.get('zona')
        if zona:
            qs = qs.filter(institucion__zona__iexact=zona.strip())

        puntaje_min = params.get('puntaje_min')
        if puntaje_min and puntaje_min.isdigit():
            qs = qs.filter(puntaje_global__gte=int(puntaje_min))

        puntaje_max = params.get('puntaje_max')
        if puntaje_max and puntaje_max.isdigit():
            qs = qs.filter(puntaje_global__lte=int(puntaje_max))

        institucion_id = params.get('institucion_id')
        if institucion_id and institucion_id.isdigit():
            qs = qs.filter(institucion_id=int(institucion_id))

        return qs


class EstadisticasView(APIView):
    

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        inicio = time.perf_counter()

        qs = ResultadoSaber.objects.select_related('institucion').all()
        params = request.query_params

        if params.get('anio') and params.get('anio').isdigit():
            qs = qs.filter(anio=int(params.get('anio')))
        if params.get('departamento'):
            qs = qs.filter(institucion__departamento__iexact=params.get('departamento').strip())
        if params.get('municipio'):
            qs = qs.filter(institucion__municipio__iexact=params.get('municipio').strip())
        if params.get('naturaleza'):
            qs = qs.filter(institucion__naturaleza__iexact=params.get('naturaleza').strip())
        if params.get('zona'):
            qs = qs.filter(institucion__zona__iexact=params.get('zona').strip())
        if params.get('puntaje_min') and params.get('puntaje_min').isdigit():
            qs = qs.filter(puntaje_global__gte=int(params.get('puntaje_min')))
        if params.get('puntaje_max') and params.get('puntaje_max').isdigit():
            qs = qs.filter(puntaje_global__lte=int(params.get('puntaje_max')))

        
        metricas_globales = qs.aggregate(
            total_evaluados=Count('id'),
            promedio_global=Avg('puntaje_global'),
            maximo_global=Max('puntaje_global'),
            minimo_global=Min('puntaje_global'),
            promedio_matematicas=Avg('puntaje_matematicas'),
            promedio_lectura=Avg('puntaje_lectura'),
            promedio_ciencias=Avg('puntaje_ciencias'),
            promedio_ingles=Avg('puntaje_ingles'),
            promedio_sociales=Avg('puntaje_sociales'),
        )

        def _redondear(val):
            return round(val, 1) if val is not None else 0

        resumen_kpi = {
            'total_evaluados': metricas_globales['total_evaluados'] or 0,
            'promedio_global': _redondear(metricas_globales['promedio_global']),
            'maximo_global': metricas_globales['maximo_global'] or 0,
            'minimo_global': metricas_globales['minimo_global'] or 0,
            'promedio_matematicas': _redondear(metricas_globales['promedio_matematicas']),
            'promedio_lectura': _redondear(metricas_globales['promedio_lectura']),
            'promedio_ciencias': _redondear(metricas_globales['promedio_ciencias']),
            'promedio_ingles': _redondear(metricas_globales['promedio_ingles']),
            'promedio_sociales': _redondear(metricas_globales['promedio_sociales']),
        }

     
        filas_depto_nat = (
            qs.values('institucion__departamento', 'institucion__naturaleza')
            .annotate(
                conteo=Count('id'),
                promedio_global=Avg('puntaje_global'),
                promedio_mat=Avg('puntaje_matematicas'),
                promedio_lec=Avg('puntaje_lectura'),
                promedio_cie=Avg('puntaje_ciencias'),
                promedio_ing=Avg('puntaje_ingles'),
                max_global=Max('puntaje_global'),
            )
            .order_by('-promedio_global')[:20]
        )

        por_departamento_naturaleza = [
            {
                'departamento': fila['institucion__departamento'],
                'naturaleza': fila['institucion__naturaleza'],
                'conteo': fila['conteo'],
                'promedio_global': _redondear(fila['promedio_global']),
                'promedio_mat': _redondear(fila['promedio_mat']),
                'promedio_lec': _redondear(fila['promedio_lec']),
                'promedio_cie': _redondear(fila['promedio_cie']),
                'promedio_ing': _redondear(fila['promedio_ing']),
                'max_global': fila['max_global'],
            }
            for fila in filas_depto_nat
        ]

        
        filas_anio_zona = (
            qs.values('anio', 'institucion__zona')
            .annotate(
                conteo=Count('id'),
                promedio_global=Avg('puntaje_global'),
                max_global=Max('puntaje_global'),
            )
            .order_by('anio', 'institucion__zona')
        )

        por_anio_zona = [
            {
                'anio': fila['anio'],
                'zona': fila['institucion__zona'],
                'conteo': fila['conteo'],
                'promedio_global': _redondear(fila['promedio_global']),
                'max_global': fila['max_global'],
            }
            for fila in filas_anio_zona
        ]

        filas_nat = (
            qs.values('institucion__naturaleza')
            .annotate(
                conteo=Count('id'),
                promedio_global=Avg('puntaje_global'),
                promedio_mat=Avg('puntaje_matematicas'),
                promedio_lec=Avg('puntaje_lectura'),
                promedio_cie=Avg('puntaje_ciencias'),
                promedio_ing=Avg('puntaje_ingles'),
            )
            .order_by('institucion__naturaleza')
        )

        por_naturaleza = [
            {
                'naturaleza': fila['institucion__naturaleza'],
                'conteo': fila['conteo'],
                'promedio_global': _redondear(fila['promedio_global']),
                'promedio_mat': _redondear(fila['promedio_mat']),
                'promedio_lec': _redondear(fila['promedio_lec']),
                'promedio_cie': _redondear(fila['promedio_cie']),
                'promedio_ing': _redondear(fila['promedio_ing']),
            }
            for fila in filas_nat
        ]

        promedios_por_area = [
            {'area': 'Matemáticas', 'promedio': resumen_kpi['promedio_matematicas'], 'max_posible': 100},
            {'area': 'Lectura Crítica', 'promedio': resumen_kpi['promedio_lectura'], 'max_posible': 100},
            {'area': 'Ciencias Naturales', 'promedio': resumen_kpi['promedio_ciencias'], 'max_posible': 100},
            {'area': 'Inglés', 'promedio': resumen_kpi['promedio_ingles'], 'max_posible': 100},
            {'area': 'Sociales y Ciudadanas', 'promedio': resumen_kpi['promedio_sociales'], 'max_posible': 100},
        ]

        latencia_ms = round((time.perf_counter() - inicio) * 1000)

        return Response({
            'kpis': resumen_kpi,
            'por_departamento_naturaleza': por_departamento_naturaleza,
            'por_anio_zona': por_anio_zona,
            'por_naturaleza': por_naturaleza,
            'promedios_por_area': promedios_por_area,
            'filtros_aplicados': dict(params.items()),
            'tiempo_calculo_ms': latencia_ms,
        })


class InyeccionMasivaView(APIView):
    
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        cantidad_raw = request.data.get('cantidad', 5000) if hasattr(request.data, 'get') else 5000
        periodo_raw = request.data.get('periodo', '20224') if hasattr(request.data, 'get') else '20224'

        try:
            cantidad = int(cantidad_raw)
        except (TypeError, ValueError):
            return Response(
                {'error': 'El campo cantidad debe ser un número entero entre 1 y 50.000.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if cantidad < 1 or cantidad > 50000:
            return Response(
                {'error': 'La cantidad debe ubicarse en el rango de 1 a 50.000 registros.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            informe = descargar_e_importar_icfes(cantidad=cantidad, periodo=str(periodo_raw).strip())
            return Response(informe, status=status.HTTP_200_OK)
        except Exception as error:
            return Response(
                {'error': f'Error al consultar o almacenar microdatos del ICFES: {str(error)}'},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class LimpiezaMasivaView(APIView):
   

    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        confirmar = request.data.get('confirmar') if hasattr(request.data, 'get') else None
        if confirmar is not True:
            return Response(
                {'error': 'Para confirmar el borrado debes enviar {"confirmar": true}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        inicio = time.perf_counter()
        borrados, _ = ResultadoSaber.objects.all().delete()
        ms = round((time.perf_counter() - inicio) * 1000)

        return Response({
            'mensaje': 'Base de datos de resultados depurada exitosamente.',
            'resultados_eliminados': borrados,
            'ms': ms,
        })


class EstadoSistemaView(APIView):
   

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            connection.ensure_connection()
            db_activa = True
        except Exception:
            db_activa = False

        motor = connection.settings_dict.get('ENGINE', '')
        es_postgres = db_activa and 'postgresql' in motor

        tablas = connection.introspection.table_names()
        tabla_inst = 'observatorio_institucion' in tablas
        tabla_res = 'observatorio_resultado_saber' in tablas

        total_inst = InstitucionEducativa.objects.count() if tabla_inst else 0
        total_res = ResultadoSaber.objects.count() if tabla_res else 0

        return Response({
            'base_datos_activa': db_activa,
            'motor_postgresql': es_postgres,
            'motor': motor,
            'tabla_instituciones_existe': tabla_inst,
            'tabla_resultados_existe': tabla_res,
            'total_instituciones': total_inst,
            'total_resultados': total_res,
            'cumple_volumen_minimo': total_res >= 5000,
        })

class ResumenIngestionView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        def normalizar(texto):
            sin_tildes = ''.join(
                c for c in unicodedata.normalize('NFD', texto.upper())
                if unicodedata.category(c) != 'Mn'
            )
            return sin_tildes.replace(' ', '').strip()

        deptos_raw = (
            InstitucionEducativa.objects.exclude(departamento__isnull=True)
            .exclude(departamento__exact='')
            .order_by()
            .values_list('departamento', flat=True)
            .distinct()
        )
        departamentos_unicos = {
            normalizar(d) for d in deptos_raw if normalizar(d) != 'BOGOTA'
        }

        mcpios_raw = (
            InstitucionEducativa.objects.exclude(municipio__isnull=True)
            .exclude(municipio__exact='')
            .order_by()
            .values_list('municipio', 'departamento')
            .distinct()
        )
        municipios_unicos = {
            (normalizar(m), normalizar(d or '')) for m, d in mcpios_raw
        }

        return Response({
            'departamentos': len(departamentos_unicos),
            'municipios': len(municipios_unicos),
        })
