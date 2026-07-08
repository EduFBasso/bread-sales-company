"""
ViewSets para Transaction (Ledger - Livro Caixa)
"""
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Transaction
from .serializers import TransactionSerializer
from utils.permissions import IsRelatedCustomer
from utils.pagination import StandardResultsSetPagination
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para Transaction (Livro Caixa - Leitura apenas)
    
    Endpoints:
    - GET /api/transactions/                → Lista todas as transações
    - GET /api/transactions/{id}/           → Detalha transação
    - GET /api/transactions/?customer=X     → Filtra por cliente
    - GET /api/transactions/?type=CREDIT    → Filtra por tipo
    """
    
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['description', 'customer__nickname']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filtrar transações:
        - Admins: veem todas
        - Clientes: veem apenas suas transações
        """
        user = self.request.user
        if user.is_staff:
            return Transaction.objects.all()
        return Transaction.objects.filter(customer__user=user)
