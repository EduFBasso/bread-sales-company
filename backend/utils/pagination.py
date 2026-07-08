"""
Paginação customizada para a API REST
"""
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginação padrão: 20 itens por página
    Cliente pode pedir até 100 itens por página via ?page_size=100
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class LargeResultsSetPagination(PageNumberPagination):
    """
    Paginação para listagens grandes: 100 itens por página
    """
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 500
