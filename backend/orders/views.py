"""
ViewSets para Order e OrderItem
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404

from .models import Order, OrderItem, Product
from .serializers import OrderSerializer, OrderItemSerializer, ProductSerializer
from ledger.models import Transaction
from ledger.serializers import TransactionSerializer
from utils.permissions import IsRelatedCustomer
from utils.pagination import StandardResultsSetPagination
from utils.filters import OrderFilterSet, OrderItemFilterSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para Product (Leitura apenas - catálogo)
    
    Endpoints:
    - GET /api/products/                    → Lista todos os produtos
    - GET /api/products/{id}/               → Detalha produto
    
    ✅ Sem autenticação requerida (público)
    """
    
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']
    
    def get_permissions(self):
        """
        Override: Produtos são sempre públicos (sem autenticação)
        """
        return [AllowAny()]


class OrderItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet para OrderItem (Itens de um pedido)
    
    Endpoints:
    - GET    /api/orders/{order_id}/items/              → Lista itens
    - POST   /api/orders/{order_id}/items/              → Cria item
    - GET    /api/orders/{order_id}/items/{id}/         → Detalha item
    - PUT    /api/orders/{order_id}/items/{id}/         → Atualiza item
    - DELETE /api/orders/{order_id}/items/{id}/         → Deleta item
    """
    
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated, IsRelatedCustomer]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = OrderItemFilterSet
    ordering = ['id']

    def get_queryset(self):
        """
        Filtra OrderItem por Order
        """
        order_id = self.kwargs.get('order_pk')
        return OrderItem.objects.filter(order_id=order_id)

    def perform_create(self, serializer):
        """
        Ao criar novo item, vincula à Order especificada na URL
        """
        order_id = self.kwargs.get('order_pk')
        order = get_object_or_404(Order, pk=order_id)
        
        # Validar que o usuário é o cliente do pedido
        if order.customer.user != self.request.user and not self.request.user.is_staff:
            return Response(
                {'detail': 'Você não tem permissão para adicionar itens a este pedido.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save(order=order)

    def perform_update(self, serializer):
        """
        Atualizar item - apenas quantidade (preço é imutável)
        """
        serializer.save()


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Order (Pedidos completos + ações customizadas)
    
    Endpoints:
    - GET    /api/orders/                        → Lista pedidos
    - POST   /api/orders/                        → Cria pedido
    - GET    /api/orders/{id}/                   → Detalha pedido
    - PUT    /api/orders/{id}/                   → Atualiza pedido
    - DELETE /api/orders/{id}/                   → Cancela pedido
    - GET    /api/orders/{id}/items/             → Itens do pedido (aninhado)
    - POST   /api/orders/{id}/items/             → Adiciona item
    - GET    /api/orders/{id}/transactions/      → Transações do pedido
    """
    
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated, IsRelatedCustomer]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = OrderFilterSet
    search_fields = ['customer__nickname', 'customer__company_name']
    ordering_fields = ['created_at', 'delivery_date', 'total_value', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filtrar pedidos:
        - Admins: veem todos
        - Clientes: veem apenas seus pedidos
        """
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(customer__user=user)

    def perform_create(self, serializer):
        """
        Ao criar pedido, vincula ao cliente autenticado
        """
        customer = self.request.user.customer_profile
        serializer.save(customer=customer)

    @action(detail=True, methods=['get', 'post'], url_path='items')
    def order_items(self, request, pk=None):
        """
        GET  /api/orders/{id}/items/  → Lista itens
        POST /api/orders/{id}/items/  → Cria novo item
        """
        order = self.get_object()
        self.check_object_permissions(request, order)
        
        if request.method == 'POST':
            # Criar novo item
            serializer = OrderItemSerializer(
                data=request.data,
                context={'request': request, 'order': order}
            )
            if serializer.is_valid():
                serializer.save(order=order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # GET: listar itens
        items = order.items.all()
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(items, request)
        
        if page is not None:
            serializer = OrderItemSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = OrderItemSerializer(items, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='transactions')
    def order_transactions(self, request, pk=None):
        """
        GET /api/orders/{id}/transactions/
        
        Retorna transações relacionadas ao pedido
        """
        order = self.get_object()
        self.check_object_permissions(request, order)
        
        transactions = order.transactions.all().order_by('-created_at')
        
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(transactions, request)
        
        if page is not None:
            serializer = TransactionSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm_order(self, request, pk=None):
        """
        POST /api/orders/{id}/confirm/
        
        Confirma um pedido (muda status de PENDING para CONFIRMED)
        """
        order = self.get_object()
        self.check_object_permissions(request, order)
        
        if order.status != 'PENDING':
            return Response(
                {'detail': f'Pedido não está no status PENDING (atual: {order.status})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'CONFIRMED'
        order.save()
        
        return Response({
            'detail': 'Pedido confirmado com sucesso',
            'status': order.status
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_order(self, request, pk=None):
        """
        POST /api/orders/{id}/cancel/
        
        Cancela um pedido (muda status para CANCELLED)
        """
        order = self.get_object()
        self.check_object_permissions(request, order)
        
        if order.status == 'DELIVERED':
            return Response(
                {'detail': 'Pedido já foi entregue, não pode ser cancelado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if order.status == 'CANCELLED':
            return Response(
                {'detail': 'Pedido já foi cancelado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'CANCELLED'
        order.save()
        
        return Response({
            'detail': 'Pedido cancelado com sucesso',
            'status': order.status
        }, status=status.HTTP_200_OK)
