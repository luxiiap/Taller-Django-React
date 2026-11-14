
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class PaginacionSaber(PageNumberPagination):
    """
    Clase de paginación para resultados de pruebas Saber 11 e instituciones.

    Entrega una estructura estándar:
    {
        "count": 5200,
        "total_paginas": 104,
        "pagina_actual": 1,
        "page_size": 50,
        "next": "http://.../?page=2",
        "previous": null,
        "results": [ ... ]
    }
    """

    page_size = 50

    page_size_query_param = 'page_size'

    max_page_size = 200

    def get_paginated_response(self, data):
        
        return Response({
            'count': self.page.paginator.count,
            'total_paginas': self.page.paginator.num_pages,
            'pagina_actual': self.page.number,
            'page_size': self.get_page_size(self.request),
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data,
        })
