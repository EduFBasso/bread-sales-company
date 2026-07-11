"""
Admin views para gerenciamento de pedidos e clientes
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from orders.models import Order
from orders.serializers import OrderSerializer
from ledger.models import Transaction
from ledger.serializers import TransactionSerializer


def is_admin(request):
    """Verificar se usuário é admin"""
    return request.user and request.user.is_staff and request.user.is_authenticated


class IsAdminUser:
    """Permission class to check if user is admin"""
    def __call__(self, request):
        return request.user and request.user.is_staff



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_orders_list(request):
    """
    GET /api/admin/orders/
    
    Endpoint para admin listar todos os pedidos com filtros.
    Apenas admin (is_staff=True) pode acessar.
    
    Query Parameters:
    - ?status=PENDING,CONFIRMED,DELIVERED,CANCELLED (default: all)
    - ?customer_nickname=Padaria (search por apelido do cliente)
    - ?date_from=2024-01-01
    - ?date_to=2024-01-31
    - ?page=1&page_size=20
    
    Response:
    {
        "count": 25,
        "next": "http://localhost:8000/api/admin/orders/?page=2",
        "previous": null,
        "results": [
            {
                "id": 2,
                "order_number": "ORD-002",
                "customer_id": 1,
                "customer_nickname": "Padaria Central",
                "status": "PENDING",
                "order_date": "2024-01-15T10:30:00Z",
                "delivery_date": "2024-01-18T14:00:00Z",
                "total_value": "150.00",
                "payment_method": "CREDIT",
                "items": [...]
            }
        ]
    }
    """
    try:
        # Validar permissão de admin
        if not is_admin(request):
            return Response(
                {'detail': 'Apenas administradores podem acessar este endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Buscar todos os pedidos
        orders = Order.objects.all().order_by('-created_at')
        
        # Filtrar por status se fornecido
        status_filter = request.query_params.get('status')
        if status_filter:
            # Aceitar múltiplos valores: ?status=PENDING,CONFIRMED
            statuses = [s.strip().upper() for s in status_filter.split(',')]
            orders = orders.filter(status__in=statuses)
        
        # Filtrar por apelido do cliente
        customer_filter = request.query_params.get('customer_nickname')
        if customer_filter:
            orders = orders.filter(customer__nickname__icontains=customer_filter)
        
        # Filtrar por data (range)
        date_from = request.query_params.get('date_from')
        if date_from:
            orders = orders.filter(created_at__gte=date_from)
        
        date_to = request.query_params.get('date_to')
        if date_to:
            orders = orders.filter(created_at__lte=date_to)
        
        # Aplicar paginação
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get('page_size', 20)
        page = paginator.paginate_queryset(orders, request)
        
        if page is not None:
            serializer = OrderSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = OrderSerializer(orders, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'detail': f'Erro ao listar pedidos: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_order_status(request, order_id):
    """
    PATCH /api/admin/orders/{id}/status/
    
    Endpoint para admin atualizar o status de um pedido.
    Apenas admin pode acessar.
    
    Request Body:
    {
        "status": "CONFIRMED"
    }
    
    Valid statuses: PENDING, CONFIRMED, DELIVERED, CANCELLED
    
    Response:
    {
        "id": 2,
        "order_number": "ORD-002",
        "customer_id": 1,
        "status": "CONFIRMED",
        "status_display": "Confirmado",
        "updated_at": "2024-01-15T11:00:00Z",
        ...
    }
    """
    try:
        # Validar permissão de admin
        if not is_admin(request):
            return Response(
                {'detail': 'Apenas administradores podem atualizar pedidos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Buscar pedido
        order = get_object_or_404(Order, pk=order_id)
        
        # Validar novo status
        new_status = request.data.get('status', '').upper()
        valid_statuses = [choice[0] for choice in Order.STATUS_CHOICES]
        
        if not new_status:
            return Response(
                {'detail': 'Campo "status" é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_status not in valid_statuses:
            return Response(
                {'detail': f'Status inválido. Válidos: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atualizar status
        old_status = order.status
        order.status = new_status
        order.save()
        
        # Registrar log/transação se necessário
        # (pode adicionar aqui lógica para gerar transações automáticas, etc.)
        
        # Retornar pedido atualizado
        serializer = OrderSerializer(order)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {'detail': f'Erro ao atualizar pedido: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_cancel_order(request, order_id):
    """
    POST /api/admin/orders/{id}/cancel/
    
    Endpoint para admin cancelar um pedido com motivo.
    Apenas admin pode acessar.
    
    Request Body:
    {
        "reason": "Cliente solicitou cancelamento",
        "refund_method": "CREDIT" (optional: CREDIT, TRANSFER)
    }
    
    Response:
    {
        "id": 2,
        "order_number": "ORD-002",
        "status": "CANCELLED",
        "cancelled_at": "2024-01-15T11:00:00Z",
        "cancellation_reason": "Cliente solicitou cancelamento",
        ...
    }
    """
    try:
        # Validar permissão de admin
        if not is_admin(request):
            return Response(
                {'detail': 'Apenas administradores podem cancelar pedidos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Buscar pedido
        order = get_object_or_404(Order, pk=order_id)
        
        # Validar se pedido pode ser cancelado
        if order.status == 'CANCELLED':
            return Response(
                {'detail': 'Pedido já foi cancelado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if order.status == 'DELIVERED':
            return Response(
                {'detail': 'Não é possível cancelar pedido já entregue'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obter motivo do cancelamento
        reason = request.data.get('reason', 'Cancelado pelo administrador')
        refund_method = request.data.get('refund_method', 'CREDIT')
        
        # Atualizar status do pedido
        order.status = 'CANCELLED'
        order.cancellation_reason = reason
        order.cancelled_at = timezone.now()
        order.save()
        
        # Se deve fazer reembolso (opcional)
        if refund_method == 'CREDIT':
            # Criar transação de crédito para o cliente
            Transaction.objects.create(
                customer=order.customer,
                transaction_type=Transaction.TransactionType.CREDIT,
                amount=order.total_value,
                description=f'Reembolso - Pedido ORD-{order.id:03d} cancelado. Motivo: {reason}',
                order=order
            )
        
        # Retornar pedido atualizado
        serializer = OrderSerializer(order)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
        
    except Exception as e:
        return Response(
            {'detail': f'Erro ao cancelar pedido: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
