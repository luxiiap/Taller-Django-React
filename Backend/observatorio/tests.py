
from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import InstitucionEducativa, ResultadoSaber


class ObservatorioModelosYApiTestCase(TestCase):
    

    def setUp(self):
        
        self.cliente = APIClient()

        self.usuario = User.objects.create_user(
            username='evaluador',
            password='password123',
            email='evaluador@icfes.gov.co'
        )
        self.token = Token.objects.create(user=self.usuario)

        self.colegio_oficial = InstitucionEducativa.objects.create(
            codigo_dane='168276000001',
            nombre='INSTITUTO NACIONAL FLORIDABLANCA',
            departamento='SANTANDER',
            municipio='FLORIDABLANCA',
            naturaleza='OFICIAL',
            zona='URBANA',
        )

        self.colegio_privado = InstitucionEducativa.objects.create(
            codigo_dane='168276000002',
            nombre='GIMNASIO CAMPESTRE BUCARAMANGA',
            departamento='SANTANDER',
            municipio='BUCARAMANGA',
            naturaleza='NO OFICIAL',
            zona='RURAL',
        )

        self.resultado_1 = ResultadoSaber.objects.create(
            institucion=self.colegio_oficial,
            consecutivo='SB112022400001',
            anio=2022,
            periodo='20224',
            puntaje_global=280,
            puntaje_matematicas=60,
            puntaje_lectura=62,
            puntaje_ciencias=58,
            puntaje_ingles=50,
            puntaje_sociales=50,
            observacion='Registro inicial de prueba',
        )

        self.resultado_2 = ResultadoSaber.objects.create(
            institucion=self.colegio_privado,
            consecutivo='SB112022400002',
            anio=2022,
            periodo='20224',
            puntaje_global=340,
            puntaje_matematicas=75,
            puntaje_lectura=72,
            puntaje_ciencias=68,
            puntaje_ingles=65,
            puntaje_sociales=60,
            observacion='Registro privado de prueba',
        )

    def test_01_creacion_modelos_e_integridad_relacional(self):
        
        self.assertEqual(InstitucionEducativa.objects.count(), 2)
        self.assertEqual(ResultadoSaber.objects.count(), 2)
        self.assertEqual(self.resultado_1.institucion.codigo_dane, '168276000001')
        self.assertEqual(self.colegio_oficial.resultados.count(), 1)
        self.assertEqual(self.colegio_privado.resultados.first().puntaje_global, 340)

    def test_02_lectura_publica_listado_resultados(self):
        
        respuesta = self.cliente.get('/api/resultados/')
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        datos = respuesta.json()

        self.assertIn('count', datos)
        self.assertIn('total_paginas', datos)
        self.assertIn('pagina_actual', datos)
        self.assertIn('results', datos)
        self.assertEqual(datos['count'], 2)
        self.assertEqual(len(datos['results']), 2)

    def test_03_filtros_sql_directos(self):
        
        resp_oficial = self.cliente.get('/api/resultados/?naturaleza=OFICIAL')
        self.assertEqual(resp_oficial.status_code, status.HTTP_200_OK)
        datos_oficial = resp_oficial.json()
        self.assertEqual(datos_oficial['count'], 1)
        self.assertEqual(datos_oficial['results'][0]['consecutivo'], 'SB112022400001')

        resp_puntaje = self.cliente.get('/api/resultados/?puntaje_min=300')
        self.assertEqual(resp_puntaje.status_code, status.HTTP_200_OK)
        datos_puntaje = resp_puntaje.json()
        self.assertEqual(datos_puntaje['count'], 1)
        self.assertEqual(datos_puntaje['results'][0]['puntaje_global'], 340)

    def test_04_agregaciones_analiticas_orm_estadisticas(self):
       
        respuesta = self.cliente.get('/api/resultados/estadisticas/')
        self.assertEqual(respuesta.status_code, status.HTTP_200_OK)
        datos = respuesta.json()

        self.assertIn('kpis', datos)
        kpis = datos['kpis']
        self.assertEqual(kpis['total_evaluados'], 2)
        self.assertEqual(kpis['promedio_global'], 310.0)
        self.assertEqual(kpis['maximo_global'], 340)

        self.assertIn('por_departamento_naturaleza', datos)
        self.assertIn('por_anio_zona', datos)
        self.assertIn('por_naturaleza', datos)
        self.assertIn('promedios_por_area', datos)

    def test_05_seguridad_rechazo_401_sin_token(self):
       
        payload_nuevo = {
            'institucion': self.colegio_oficial.id,
            'consecutivo': 'SB112022499999',
            'anio': 2022,
            'periodo': '20224',
            'puntaje_global': 310,
            'puntaje_matematicas': 65,
            'puntaje_lectura': 65,
            'puntaje_ciencias': 60,
            'puntaje_ingles': 60,
            'puntaje_sociales': 60,
            'observacion': 'Intento no autenticado',
        }

        resp_post = self.cliente.post('/api/resultados/', payload_nuevo, format='json')
        self.assertEqual(resp_post.status_code, status.HTTP_401_UNAUTHORIZED)

        resp_patch = self.cliente.patch(
            f'/api/resultados/{self.resultado_1.id}/',
            {'observacion': 'Modificación no autorizada'},
            format='json'
        )
        self.assertEqual(resp_patch.status_code, status.HTTP_401_UNAUTHORIZED)

        resp_delete = self.cliente.delete(f'/api/resultados/{self.resultado_1.id}/')
        self.assertEqual(resp_delete.status_code, status.HTTP_401_UNAUTHORIZED)

        resp_inyeccion = self.cliente.post(
            '/api/resultados/inyeccion/',
            {'cantidad': 100},
            format='json'
        )
        self.assertEqual(resp_inyeccion.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_06_operacion_escritura_exitosa_con_token(self):
        
        self.cliente.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        payload_nuevo = {
            'institucion': self.colegio_oficial.id,
            'consecutivo': 'SB112022488888',
            'anio': 2022,
            'periodo': '20224',
            'puntaje_global': 325,
            'puntaje_matematicas': 70,
            'puntaje_lectura': 68,
            'puntaje_ciencias': 62,
            'puntaje_ingles': 65,
            'puntaje_sociales': 60,
            'observacion': 'Auditoría autorizada con Token',
        }
        resp_crear = self.cliente.post('/api/resultados/', payload_nuevo, format='json')
        self.assertEqual(resp_crear.status_code, status.HTTP_201_CREATED)
        nuevo_id = resp_crear.json()['id']

        resp_editar = self.cliente.patch(
            f'/api/resultados/{nuevo_id}/',
            {'observacion': 'Observación corregida por administrador'},
            format='json'
        )
        self.assertEqual(resp_editar.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_editar.json()['observacion'], 'Observación corregida por administrador')

        resp_borrar = self.cliente.delete(f'/api/resultados/{nuevo_id}/')
        self.assertEqual(resp_borrar.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ResultadoSaber.objects.filter(id=nuevo_id).exists())

    def test_07_autenticacion_endpoint_token(self):
        
        resp_bad = self.cliente.post('/api/token/', {
            'username': 'evaluador',
            'password': 'password_incorrecta'
        })
        self.assertEqual(resp_bad.status_code, status.HTTP_400_BAD_REQUEST)

        resp_ok = self.cliente.post('/api/token/', {
            'username': 'evaluador',
            'password': 'password123'
        })
        self.assertEqual(resp_ok.status_code, status.HTTP_200_OK)
        self.assertIn('token', resp_ok.json())
        self.assertEqual(resp_ok.json()['token'], self.token.key)
