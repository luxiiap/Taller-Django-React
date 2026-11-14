
import os
from pathlib import Path

from django.contrib import admin
from django.http import FileResponse, HttpResponse
from django.urls import include, path, re_path
from rest_framework.authtoken import views as authtoken_views

BASE_DIR = Path(__file__).resolve().parent.parent


def servir_react_app(request):
    
    ruta_index = BASE_DIR / 'staticfiles' / 'index.html'

    if ruta_index.exists():
        return FileResponse(open(ruta_index, 'rb'), content_type='text/html')

    return HttpResponse(
        """
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Observatorio Saber 11 (ICFES)</title>
            <style>
                body { font-family: system-ui, sans-serif; background: #edf2f3; color: #192d38; padding: 40px; }
                .card { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
                h1 { color: #244b60; margin-top: 0; }
                a { color: #286982; text-decoration: none; font-weight: bold; }
                code { background: #e5edf0; padding: 2px 6px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Observatorio de Calidad Educativa · ICFES Saber 11</h1>
                <p>El backend Django + DRF se encuentra en ejecucion exitosa.</p>
                <p>Para cargar el panel en React, ejecuta el comando de build o inicia el servidor de desarrollo:</p>
                <ul>
                    <li><a href="/admin/">Panel de Administracion (/admin/)</a></li>
                    <li><a href="/api/resultados/">API de Resultados (/api/resultados/)</a></li>
                    <li><a href="/api/instituciones/">API de Instituciones (/api/instituciones/)</a></li>
                    <li><a href="/api/resultados/estadisticas/">Estadisticas Analiticas (/api/resultados/estadisticas/)</a></li>
                </ul>
            </div>
        </body>
        </html>
        """,
        content_type='text/html',
    )


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include('observatorio.urls')),

    path('api/token/', authtoken_views.obtain_auth_token, name='api-token-auth'),

    path('', servir_react_app, name='react-index'),

 
    re_path(r'^(?!admin|api|static).*$', servir_react_app, name='react-spa-fallback'),
]
