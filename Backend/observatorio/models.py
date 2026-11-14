
from django.db import models


class InstitucionEducativa(models.Model):
    
    NATURALEZA_CHOICES = [
        ('OFICIAL', 'OFICIAL'),
        ('NO OFICIAL', 'NO OFICIAL'),
    ]

    ZONA_CHOICES = [
        ('URBANA', 'URBANA'),
        ('RURAL', 'RURAL'),
    ]

    codigo_dane = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        verbose_name='Código DANE',
        help_text='Identificador único de la institución educativa ante el DANE y MEN.'
    )

    nombre = models.CharField(
        max_length=250,
        db_index=True,
        verbose_name='Nombre de la Institución',
        help_text='Nombre completo oficial del colegio o sede evaluada.'
    )

    departamento = models.CharField(
        max_length=100,
        db_index=True,
        verbose_name='Departamento',
        help_text='Departamento de ubicación geográfica (ej. SANTANDER, BOGOTÁ, ANTIOQUIA).'
    )

    municipio = models.CharField(
        max_length=100,
        db_index=True,
        verbose_name='Municipio',
        help_text='Municipio de ubicación de la institución (ej. BUCARAMANGA, MEDELLÍN).'
    )

    naturaleza = models.CharField(
        max_length=20,
        choices=NATURALEZA_CHOICES,
        default='OFICIAL',
        db_index=True,
        verbose_name='Naturaleza Jurídica',
        help_text='Tipo de administración del colegio: OFICIAL o NO OFICIAL.'
    )

    zona = models.CharField(
        max_length=20,
        choices=ZONA_CHOICES,
        default='URBANA',
        db_index=True,
        verbose_name='Zona Geográfica',
        help_text='Zona geográfica de la sede: URBANA o RURAL.'
    )

    fecha_registro = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Registro en BD'
    )

    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de Última Modificación'
    )

    class Meta:
        db_table = 'observatorio_institucion'
        verbose_name = 'Institución Educativa'
        verbose_name_plural = 'Instituciones Educativas'
        ordering = ['nombre']
        indexes = [
            models.Index(fields=['departamento', 'municipio'], name='idx_inst_depto_mcpio'),
            models.Index(fields=['naturaleza', 'zona'], name='idx_inst_nat_zona'),
        ]

    def __str__(self):
        return f"{self.nombre} (DANE: {self.codigo_dane}) - {self.municipio}, {self.departamento}"


class ResultadoSaber(models.Model):
   
    institucion = models.ForeignKey(
        InstitucionEducativa,
        on_delete=models.CASCADE,
        related_name='resultados',
        db_index=True,
        verbose_name='Institución Educativa',
        help_text='Institución a la que pertenece el estudiante o reporte de evaluación.'
    )

    consecutivo = models.CharField(
        max_length=60,
        unique=True,
        db_index=True,
        verbose_name='Consecutivo de Examen',
        help_text='Identificador único de la prueba Saber 11 emitida por el ICFES.'
    )

    anio = models.PositiveIntegerField(
        db_index=True,
        verbose_name='Año de Presentación',
        help_text='Año calendario de presentación del examen (ej. 2022).'
    )

    periodo = models.CharField(
        max_length=20,
        db_index=True,
        verbose_name='Periodo ICFES',
        help_text='Periodo lectivo del examen (ej. 20224 para calendario A).'
    )

    puntaje_global = models.PositiveIntegerField(
        db_index=True,
        verbose_name='Puntaje Global (0-500)',
        help_text='Puntaje global consolidado obtenido en el examen Saber 11.'
    )

    puntaje_matematicas = models.PositiveIntegerField(
        default=0,
        verbose_name='Puntaje Matemáticas (0-100)',
        help_text='Puntaje obtenido en el módulo de Matemáticas.'
    )

    puntaje_lectura = models.PositiveIntegerField(
        default=0,
        verbose_name='Puntaje Lectura Crítica (0-100)',
        help_text='Puntaje obtenido en el módulo de Lectura Crítica.'
    )

    puntaje_ciencias = models.PositiveIntegerField(
        default=0,
        verbose_name='Puntaje Ciencias Naturales (0-100)',
        help_text='Puntaje obtenido en el módulo de Ciencias Naturales.'
    )

    puntaje_ingles = models.PositiveIntegerField(
        default=0,
        verbose_name='Puntaje Inglés (0-100)',
        help_text='Puntaje obtenido en el módulo de Inglés.'
    )

    puntaje_sociales = models.PositiveIntegerField(
        default=0,
        verbose_name='Puntaje Sociales y Ciudadanas (0-100)',
        help_text='Puntaje obtenido en el módulo de Sociales y Competencias Ciudadanas.'
    )

    observacion = models.TextField(
        blank=True,
        default='',
        verbose_name='Observación de Auditoría',
        help_text='Notas y justificación de modificaciones manuales realizadas vía API o CRUD.'
    )

    fecha_creacion = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Fecha de Inserción'
    )

    fecha_actualizacion = models.DateTimeField(
        auto_now=True,
        verbose_name='Fecha de Modificación'
    )

    class Meta:
        db_table = 'observatorio_resultado_saber'
        verbose_name = 'Resultado Saber 11'
        verbose_name_plural = 'Resultados Saber 11'
        ordering = ['-anio', '-puntaje_global', 'consecutivo']
        indexes = [
            models.Index(fields=['anio', 'puntaje_global'], name='idx_res_anio_global'),
            models.Index(fields=['institucion', 'anio'], name='idx_res_inst_anio'),
            models.Index(fields=['periodo', 'puntaje_global'], name='idx_res_per_global'),
        ]

    def __str__(self):
        return f"Examen {self.consecutivo} - Global: {self.puntaje_global} ({self.institucion.nombre})"
