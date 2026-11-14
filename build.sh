#!/usr/bin/env bash
set -o errexit

echo ">>> [1/5] Instalando dependencias del Backend..."
pip install -r Backend/requirements.txt

echo ">>> [2/5] Compilando el Frontend React con Vite..."
cd Frontend
npm install
npm run build
cd ..

echo ">>> [3/5] Recolectando archivos estáticos..."
python Backend/manage.py collectstatic --no-input

echo ">>> [4/5] Aplicando migraciones..."
python Backend/manage.py migrate

echo ">>> [5/5] Preparando datos..."
python Backend/manage.py shell -c "
import os
from observatorio.models import ResultadoSaber
from observatorio.fuente_icfes import descargar_e_importar_icfes
from django.contrib.auth.models import User

password = os.environ.get('ADMIN_PASSWORD')
if password:
    u, _ = User.objects.get_or_create(username='admin', defaults={'email': 'admin@observatorio.edu.co', 'is_staff': True, 'is_superuser': True})
    u.set_password(password)
    u.save()
    print('>>> Usuario admin asegurado.')
else:
    print('>>> ADMIN_PASSWORD no definida: se omite el usuario admin.')

total = ResultadoSaber.objects.count()
print('>>> Total de resultados actuales en BD:', total)
if total < 5000:
    print('>>> Ingestando microdatos Saber 11 desde datos.gov.co...')
    inf = descargar_e_importar_icfes(cantidad=5500, periodo='20224')
    print('>>> Ingestión completada:', inf)
"

echo ">>> Construcción finalizada con éxito."