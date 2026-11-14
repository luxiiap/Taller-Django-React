
from urllib.error import URLError

from django.core.management.base import BaseCommand, CommandError

from observatorio.fuente_icfes import descargar_e_importar_icfes
from observatorio.models import InstitucionEducativa, ResultadoSaber


class Command(BaseCommand):

    help = (
        'Descarga registros reales del dataset oficial de Saber 11 desde datos.gov.co, '
        'normaliza valores nulos/NaN e inserta en bloque (bulk_create) en PostgreSQL.'
    )

    def add_arguments(self, parser):
        
        parser.add_argument(
            'cantidad',
            nargs='?',
            type=int,
            default=5000,
            help='Cantidad de registros a descargar de datos.gov.co (por defecto: 5000).',
        )

        parser.add_argument(
            '--periodo',
            type=str,
            default='20224',
            help='Periodo lectivo del ICFES a consultar (ej. 20224, 20212).',
        )

        parser.add_argument(
            '--limpiar',
            action='store_true',
            help='Si se especifica, vacía previamente los registros existentes en BD.',
        )

    def handle(self, *args, **options):
        
        cantidad = options['cantidad']
        periodo = options['periodo']
        limpiar = options['limpiar']

        if cantidad < 1 or cantidad > 100000:
            raise CommandError('La cantidad solicitada debe ubicarse entre 1 y 100.000 registros.')

        if limpiar:
            self.stdout.write(self.style.WARNING('Vaciando registros anteriores de resultados...'))
            res_borrados, _ = ResultadoSaber.objects.all().delete()
            self.stdout.write(self.style.SUCCESS(f'Se eliminaron {res_borrados:,} resultados anteriores.'))

        self.stdout.write(self.style.NOTICE(
            f'Iniciando descarga masiva de {cantidad:,} registros desde datos.gov.co (Periodo: {periodo})...'
        ))

        try:
            informe = descargar_e_importar_icfes(cantidad=cantidad, periodo=periodo)
        except URLError as error:
            raise CommandError(f'Fallo de conexión hacia el portal datos.gov.co: {error}')
        except Exception as error:
            raise CommandError(f'Ocurrió un error inesperado durante la importación: {error}')

        self.stdout.write(self.style.SUCCESS('\n========================================'))
        self.stdout.write(self.style.SUCCESS('   INFORME DE INGESTIÓN MASIVA ICFES    '))
        self.stdout.write(self.style.SUCCESS('========================================'))
        self.stdout.write(f"Filas crudas recibidas desde la API : {informe['recibidos']:,}")
        self.stdout.write(f"Instituciones nuevas creadas        : {informe['creados_instituciones']:,}")
        self.stdout.write(f"Resultados Saber 11 nuevos creados  : {informe['creados_resultados']:,}")
        self.stdout.write(f"Filas omitidas o duplicadas         : {informe['omitidos_duplicados']:,}")
        self.stdout.write(f"Total de Instituciones en BD        : {informe['total_instituciones']:,}")
        self.stdout.write(f"Total de Resultados en BD           : {informe['total_resultados']:,}")
        self.stdout.write(f"Tiempo total de procesamiento       : {informe['ms'] / 1000:.2f} segundos")
        self.stdout.write(f"Velocidad de procesamiento          : {informe['por_segundo']:,} filas/segundo")
        self.stdout.write(self.style.SUCCESS('========================================\n'))
