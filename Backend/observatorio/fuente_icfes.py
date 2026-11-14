import json
import os
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .models import InstitucionEducativa, ResultadoSaber

URL_API_ICFES = 'https://www.datos.gov.co/resource/kgxf-xxbe.json'

TAMANO_LOTE_API = 1000

CAMPOS_CONSULTA = ','.join([
    'estu_consecutivo',
    'periodo',
    'cole_cod_dane_establecimiento',
    'cole_nombre_establecimiento',
    'cole_depto_ubicacion',
    'cole_mcpio_ubicacion',
    'cole_naturaleza',
    'cole_area_ubicacion',
    'punt_global',
    'punt_matematicas',
    'punt_lectura_critica',
    'punt_c_naturales',
    'punt_ingles',
    'punt_sociales_ciudadanas',
])

EQUIVALENCIAS_DEPARTAMENTO = {
    'BOGOTA': 'BOGOTÁ',
    'BOGOTA D.C.': 'BOGOTÁ',
    'BOGOTÁ D.C.': 'BOGOTÁ',
    'NORTESANTANDER': 'NORTE SANTANDER',
}


def consultar_pagina_icfes(limite, desplazamiento, periodo=None):
    parametros = {
        '$select': CAMPOS_CONSULTA,
        '$limit': limite,
        '$offset': desplazamiento,
    }

    if periodo:
        parametros['$where'] = f"periodo = '{periodo}'"

    url_completa = f"{URL_API_ICFES}?{urlencode(parametros)}"

    encabezados = {
        'Accept': 'application/json',
        'User-Agent': 'observatorio-saber11-django-react/1.0',
    }

    token_socrata = os.getenv('SOCRATA_APP_TOKEN')
    if token_socrata:
        encabezados['X-App-Token'] = token_socrata

    peticion = Request(url_completa, headers=encabezados)
    with urlopen(peticion, timeout=60) as respuesta:
        cuerpo_bytes = respuesta.read()
        filas = json.loads(cuerpo_bytes.decode('utf-8'))

    if not isinstance(filas, list):
        raise ValueError('La respuesta de datos.gov.co no es una lista válida de registros JSON.')

    return filas


def limpiar_entero(valor, minimo=0, maximo=500, predeterminado=0):
    if valor is None:
        return predeterminado
    try:
        entero = int(float(str(valor).strip()))
        if entero < minimo:
            return minimo
        if entero > maximo:
            return maximo
        return entero
    except (ValueError, TypeError):
        return predeterminado


def normalizar_zona(zona_cruda):
    texto = str(zona_cruda or '').strip().upper()
    if 'RURAL' in texto:
        return 'RURAL'
    return 'URBANA'


def normalizar_naturaleza(naturaleza_cruda):
    texto = str(naturaleza_cruda or '').strip().upper()
    if 'NO OFICIAL' in texto or 'NO_OFICIAL' in texto or 'PRIVAD' in texto:
        return 'NO OFICIAL'
    return 'OFICIAL'


def normalizar_departamento(depto_crudo):
    texto = ' '.join(str(depto_crudo or 'DESCONOCIDO').strip().upper().split())
    if not texto:
        return 'DESCONOCIDO'
    return EQUIVALENCIAS_DEPARTAMENTO.get(texto, texto)[:100]


def descargar_e_importar_icfes(cantidad=5000, periodo='20224'):
    inicio = time.perf_counter()

    filas_recibidas = 0
    desplazamiento = 0
    filas_crudas = []

    while filas_recibidas < cantidad:
        lote_actual = min(TAMANO_LOTE_API, cantidad - filas_recibidas)
        filas = consultar_pagina_icfes(lote_actual, desplazamiento, periodo=periodo)
        if not filas:
            if periodo and desplazamiento == 0:
                filas = consultar_pagina_icfes(lote_actual, desplazamiento, periodo=None)
            if not filas:
                break

        filas_crudas.extend(filas)
        filas_recibidas += len(filas)
        desplazamiento += len(filas)

        if len(filas) < lote_actual:
            break

    instituciones_dict = {}

    for fila in filas_crudas:
        dane = str(fila.get('cole_cod_dane_establecimiento') or '').strip()
        if not dane or dane == 'None' or len(dane) < 3:
            continue

        if dane not in instituciones_dict:
            nombre = str(fila.get('cole_nombre_establecimiento') or 'COLEGIO NO REPORTADO').strip()[:250]
            depto = normalizar_departamento(fila.get('cole_depto_ubicacion'))
            mcpio = str(fila.get('cole_mcpio_ubicacion') or 'DESCONOCIDO').strip().upper()[:100]
            naturaleza = normalizar_naturaleza(fila.get('cole_naturaleza'))
            zona = normalizar_zona(fila.get('cole_area_ubicacion'))

            instituciones_dict[dane] = InstitucionEducativa(
                codigo_dane=dane,
                nombre=nombre,
                departamento=depto,
                municipio=mcpio,
                naturaleza=naturaleza,
                zona=zona,
            )

    inst_antes = InstitucionEducativa.objects.count()
    if instituciones_dict:
        InstitucionEducativa.objects.bulk_create(
            list(instituciones_dict.values()),
            batch_size=1000,
            ignore_conflicts=True,
        )
    inst_despues = InstitucionEducativa.objects.count()
    instituciones_creadas = inst_despues - inst_antes

    mapa_instituciones = {
        inst.codigo_dane: inst
        for inst in InstitucionEducativa.objects.filter(codigo_dane__in=instituciones_dict.keys())
    }

    consecutivos_existentes = set(
        ResultadoSaber.objects.values_list('consecutivo', flat=True)
    )

    resultados_a_crear = []
    consecutivos_vistos_en_lote = set()

    for fila in filas_crudas:
        consecutivo = str(fila.get('estu_consecutivo') or '').strip().upper()
        if not consecutivo or consecutivo in consecutivos_existentes or consecutivo in consecutivos_vistos_en_lote:
            continue

        dane = str(fila.get('cole_cod_dane_establecimiento') or '').strip()
        institucion = mapa_instituciones.get(dane)
        if not institucion:
            continue

        periodo_txt = str(fila.get('periodo') or '20224').strip()
        try:
            anio_val = int(periodo_txt[:4])
        except (ValueError, IndexError):
            anio_val = 2022

        punt_global = limpiar_entero(fila.get('punt_global'), minimo=0, maximo=500, predeterminado=0)
        punt_mat = limpiar_entero(fila.get('punt_matematicas'), minimo=0, maximo=100, predeterminado=0)
        punt_lec = limpiar_entero(fila.get('punt_lectura_critica'), minimo=0, maximo=100, predeterminado=0)
        punt_cie = limpiar_entero(fila.get('punt_c_naturales'), minimo=0, maximo=100, predeterminado=0)
        punt_ing = limpiar_entero(fila.get('punt_ingles'), minimo=0, maximo=100, predeterminado=0)
        punt_soc = limpiar_entero(fila.get('punt_sociales_ciudadanas'), minimo=0, maximo=100, predeterminado=0)

        if punt_global == 0 and (punt_mat > 0 or punt_lec > 0):
            punt_global = int((punt_mat + punt_lec + punt_cie + punt_ing + punt_soc) * 1.0)

        resultado_obj = ResultadoSaber(
            institucion=institucion,
            consecutivo=consecutivo,
            anio=anio_val,
            periodo=periodo_txt,
            puntaje_global=punt_global,
            puntaje_matematicas=punt_mat,
            puntaje_lectura=punt_lec,
            puntaje_ciencias=punt_cie,
            puntaje_ingles=punt_ing,
            puntaje_sociales=punt_soc,
            observacion='Ingestión automatizada vía API SODA datos.gov.co',
        )

        resultados_a_crear.append(resultado_obj)
        consecutivos_vistos_en_lote.add(consecutivo)

    res_antes = ResultadoSaber.objects.count()
    if resultados_a_crear:
        ResultadoSaber.objects.bulk_create(
            resultados_a_crear,
            batch_size=1000,
            ignore_conflicts=True,
        )
    res_despues = ResultadoSaber.objects.count()
    resultados_creados = res_despues - res_antes

    ms_totales = (time.perf_counter() - inicio) * 1000
    segundos = ms_totales / 1000 if ms_totales > 0 else 0.001
    por_segundo = round(len(filas_crudas) / segundos, 2)

    return {
        'recibidos': len(filas_crudas),
        'creados_instituciones': instituciones_creadas,
        'creados_resultados': resultados_creados,
        'omitidos_duplicados': len(filas_crudas) - resultados_creados,
        'total_instituciones': inst_despues,
        'total_resultados': res_despues,
        'ms': round(ms_totales),
        'por_segundo': por_segundo,
    }