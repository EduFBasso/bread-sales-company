from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import AdminLoginSerializer, UserRoleSerializer
from .models import UserRole
from customers.models import Customer
from orders.models import Order
from django.db.models import Sum
from decimal import Decimal


@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """
    POST /api/admin/login/
    
    Endpoint público para autenticar admin (Owner/Manager) usando username + senha.
    
    Request:
    {
        "username": "joão",
        "password": "SenhaForte!123"
    }
    
    Response:
    {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "role": "owner",
        "user": {
            "id": 1,
            "username": "joão",
            "email": "joao@email.com"
        }
    }
    
    Error:
    - 400: Dados inválidos
    - 401: Credenciais inválidas
    - 403: Usuário não é administrador
    """
    serializer = AdminLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        user_role = serializer.validated_data['user_role']
        
        # Determinar role (Owner/Manager ou Superuser)
        if user_role:
            role = user_role.get_role_display()
        else:
            # Superuser sem UserRole definido
            role = 'Administrador'
        
        # Gerar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'role': role,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_superuser': user.is_superuser
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    """
    GET /api/admin/stats/
    
    Retorna KPIs do painel admin (apenas para usuários autenticados como staff).
    
    Response:
    {
        "total_customers": 42,
        "pending_customers": 3,
        "approved_customers": 39,
        "balance_receivable": "1234.56",
        "currency": "BRL"
    }
    
    Permissions:
    - Requer token JWT válido
    - Validação adicional: se for customer (não staff), retorna 403
    
    Error:
    - 401: Token inválido ou expirado
    - 403: Usuário não é administrador (staff)
    """
    # Validar que é admin/staff
    if not request.user.is_staff:
        return Response(
            {'detail': 'Apenas administradores podem acessar estatísticas'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Contar clientes por status
    total_customers = Customer.objects.count()
    pending_customers = Customer.objects.filter(
        status=Customer.ApprovalStatus.PENDING
    ).count()
    approved_customers = Customer.objects.filter(
        status=Customer.ApprovalStatus.APPROVED
    ).count()
    
    # Saldo a receber atual: soma dos pedidos em crédito ainda em aberto.
    # Nesta fase do produto, o limite do cliente é consumido no ato da criação do pedido.
    # Pedidos cancelados deixam de compor o valor pendente.
    balance_receivable = (
        Order.objects.filter(payment_method='CREDIT')
        .exclude(status='CANCELLED')
        .aggregate(total=Sum('total_value'))['total']
        or Decimal('0.00')
    )
    
    return Response({
        'total_customers': total_customers,
        'pending_customers': pending_customers,
        'approved_customers': approved_customers,
        'balance_receivable': str(balance_receivable),
        'currency': 'BRL'
    }, status=status.HTTP_200_OK)
