
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='InstitucionEducativa',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('codigo_dane', models.CharField(db_index=True, help_text='Identificador único de la institución educativa ante el DANE y MEN.', max_length=30, unique=True, verbose_name='Código DANE')),
                ('nombre', models.CharField(db_index=True, help_text='Nombre completo oficial del colegio o sede evaluada.', max_length=250, verbose_name='Nombre de la Institución')),
                ('departamento', models.CharField(db_index=True, help_text='Departamento de ubicación geográfica (ej. SANTANDER, BOGOTÁ, ANTIOQUIA).', max_length=100, verbose_name='Departamento')),
                ('municipio', models.CharField(db_index=True, help_text='Municipio de ubicación de la institución (ej. BUCARAMANGA, MEDELLÍN).', max_length=100, verbose_name='Municipio')),
                ('naturaleza', models.CharField(choices=[('OFICIAL', 'OFICIAL'), ('NO OFICIAL', 'NO OFICIAL')], db_index=True, default='OFICIAL', help_text='Tipo de administración del colegio: OFICIAL o NO OFICIAL.', max_length=20, verbose_name='Naturaleza Jurídica')),
                ('zona', models.CharField(choices=[('URBANA', 'URBANA'), ('RURAL', 'RURAL')], db_index=True, default='URBANA', help_text='Zona geográfica de la sede: URBANA o RURAL.', max_length=20, verbose_name='Zona Geográfica')),
                ('fecha_registro', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Registro en BD')),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True, verbose_name='Fecha de Última Modificación')),
            ],
            options={
                'verbose_name': 'Institución Educativa',
                'verbose_name_plural': 'Instituciones Educativas',
                'db_table': 'observatorio_institucion',
                'ordering': ['nombre'],
                'indexes': [models.Index(fields=['departamento', 'municipio'], name='idx_inst_depto_mcpio'), models.Index(fields=['naturaleza', 'zona'], name='idx_inst_nat_zona')],
            },
        ),
        migrations.CreateModel(
            name='ResultadoSaber',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('consecutivo', models.CharField(db_index=True, help_text='Identificador único de la prueba Saber 11 emitida por el ICFES.', max_length=60, unique=True, verbose_name='Consecutivo de Examen')),
                ('anio', models.PositiveIntegerField(db_index=True, help_text='Año calendario de presentación del examen (ej. 2022).', verbose_name='Año de Presentación')),
                ('periodo', models.CharField(db_index=True, help_text='Periodo lectivo del examen (ej. 20224 para calendario A).', max_length=20, verbose_name='Periodo ICFES')),
                ('puntaje_global', models.PositiveIntegerField(db_index=True, help_text='Puntaje global consolidado obtenido en el examen Saber 11.', verbose_name='Puntaje Global (0-500)')),
                ('puntaje_matematicas', models.PositiveIntegerField(default=0, help_text='Puntaje obtenido en el módulo de Matemáticas.', verbose_name='Puntaje Matemáticas (0-100)')),
                ('puntaje_lectura', models.PositiveIntegerField(default=0, help_text='Puntaje obtenido en el módulo de Lectura Crítica.', verbose_name='Puntaje Lectura Crítica (0-100)')),
                ('puntaje_ciencias', models.PositiveIntegerField(default=0, help_text='Puntaje obtenido en el módulo de Ciencias Naturales.', verbose_name='Puntaje Ciencias Naturales (0-100)')),
                ('puntaje_ingles', models.PositiveIntegerField(default=0, help_text='Puntaje obtenido en el módulo de Inglés.', verbose_name='Puntaje Inglés (0-100)')),
                ('puntaje_sociales', models.PositiveIntegerField(default=0, help_text='Puntaje obtenido en el módulo de Sociales y Competencias Ciudadanas.', verbose_name='Puntaje Sociales y Ciudadanas (0-100)')),
                ('observacion', models.TextField(blank=True, default='', help_text='Notas y justificación de modificaciones manuales realizadas vía API o CRUD.', verbose_name='Observación de Auditoría')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Inserción')),
                ('fecha_actualizacion', models.DateTimeField(auto_now=True, verbose_name='Fecha de Modificación')),
                ('institucion', models.ForeignKey(help_text='Institución a la que pertenece el estudiante o reporte de evaluación.', on_delete=django.db.models.deletion.CASCADE, related_name='resultados', to='observatorio.institucioneducativa', verbose_name='Institución Educativa')),
            ],
            options={
                'verbose_name': 'Resultado Saber 11',
                'verbose_name_plural': 'Resultados Saber 11',
                'db_table': 'observatorio_resultado_saber',
                'ordering': ['-anio', '-puntaje_global', 'consecutivo'],
                'indexes': [models.Index(fields=['anio', 'puntaje_global'], name='idx_res_anio_global'), models.Index(fields=['institucion', 'anio'], name='idx_res_inst_anio'), models.Index(fields=['periodo', 'puntaje_global'], name='idx_res_per_global')],
            },
        ),
    ]
