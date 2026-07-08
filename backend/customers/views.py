"""
ViewSets para Customer
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import Customer
from .serializers import CustomerSerializer
from orders.models import Order
from orders.serializers import OrderSerializer
from ledger.models import Transaction
from ledger.serializers import TransactionSerializer
from utils.permissions import IsCustomerOrAdmin
from utils.pagination import StandardResultsSetPagination
from utils.filters import CustomerFilterSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Customer (CRUD completo + ações customizadas)
    
    Endpoints:
    - GET    /api/customers/                    → Lista todos os clientes
    - POST   /api/customers/                    → Cria novo cliente
    - GET    /api/customers/{id}/               → Detalha cliente
    - PUT    /api/customers/{id}/               → Atualiza cliente
    - DELETE /api/customers/{id}/               → Deleta cliente
    - GET    /api/customers/{id}/orders/        → Pedidos do cliente
    - GET    /api/customers/{id}/transactions/  → Transações do cliente
    - GET    /api/customers/{id}/balance/       → Saldo atual
    """
    
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated, IsCustomerOrAdmin]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CustomerFilterSet
    search_fields = ['nickname', 'company_name', 'cnpj_cpf', 'phone']
    ordering_fields = ['created_at', 'nickname', 'credit_limit']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filtra clientes:
        - Admins: veem todos
        - Clientes: veem apenas seu próprio perfil
        """
        user = self.request.user
        if user.is_staff:
            return Customer.objects.all()
        return Customer.objects.filter(user=user)

    def perform_create(self, serializer):
        """
        Ao criar novo cliente, vincula ao usuário autenticado
        """
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'], url_path='orders')
    def customer_orders(self, request, pk=None):
        """
        GET /api/customers/{id}/orders/
        
        Retorna todos os pedidos do cliente com filtros opcionais:
        - ?status=PENDING
        - ?payment_method=CREDIT
        - ?page=1&page_size=10
        """
        customer = self.get_object()
        
        # Validar permissão
        self.check_object_permissions(request, customer)
        
        # Filtrar pedidos do cliente
        orders = customer.orders.all().order_by('-created_at')
        
        # Aplicar paginação
        page = self.paginate_queryset(orders)
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='transactions')
    def customer_transactions(self, request, pk=None):
        """
        GET /api/customers/{id}/transactions/
        
        Retorna todas as transações do cliente com filtros opcionais:
        - ?transaction_type=CREDIT
        - ?page=1&page_size=10
        """
        customer = self.get_object()
        
        # Validar permissão
        self.check_object_permissions(request, customer)
        
        # Filtrar transações do cliente
        transactions = customer.transactions.all().order_by('-created_at')
        
        # Aplicar paginação
        page = self.paginate_queryset(transactions)
        if page is not None:
            serializer = TransactionSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='balance')
    def customer_balance(self, request, pk=None):
        """
        GET /api/customers/{id}/balance/
        
        Retorna saldo atual do cliente:
        {
            "customer_id": 1,
            "nickname": "Supermercado Central",
            "balance": "1234.56",
            "credit_limit": "5000.00",
            "available_credit": "3765.44",
            "currency": "BRL"
        }
        """
        customer = self.get_object()
        
        # Validar permissão
        self.check_object_permissions(request, customer)
        
        balance = customer.get_balance()
        available_credit = customer.credit_limit - balance if customer.credit_limit else Decimal('0.00')
        
        return Response({
            'customer_id': customer.id,
            'nickname': customer.nickname,
            'balance': str(balance),
            'credit_limit': str(customer.credit_limit),
            'available_credit': str(available_credit),
            'currency': 'BRL'
        })
