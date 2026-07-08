"""
ViewSets para Customer
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from decimal import Decimal
import uuid
from django.utils import timezone

from .models import Customer
from .serializers import CustomerSerializer
from orders.models import Order
from orders.serializers import OrderSerializer
from ledger.models import Transaction
from ledger.serializers import TransactionSerializer
from utils.permissions import IsCustomerOrAdmin
from utils.pagination import StandardResultsSetPagination
from utils.filters import CustomerFilterSet
from utils.viacep import lookup_cep, ViaCEPError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.core.exceptions import ValidationError


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

    @action(detail=True, methods=['post'], url_path='approve', permission_classes=[IsAuthenticated])
    def approve_customer(self, request, pk=None):
        """
        POST /api/customers/{id}/approve/
        
        Endpoint para admin aprovar um cliente pendente.
        
        Headers:
        {
            "Authorization": "Bearer {admin_token}"
        }
        
        Response (sucesso):
        {
            "id": 1,
            "nickname": "Padaria Central",
            "status": "APROVADO",
            "approved_at": "2024-01-15T10:30:00Z",
            ...
        }
        
        Response (erro):
        - 403 Forbidden: Usuário não é admin
        - 400 Bad Request: Cliente já foi aprovado
        """
        # Validar que é admin
        if not request.user.is_staff:
            return Response(
                {'detail': 'Apenas administradores podem aprovar clientes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        customer = self.get_object()
        
        # Verificar se já está aprovado
        if customer.is_approved:
            return Response(
                {'detail': 'Cliente já foi aprovado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atualizar status
        customer.status = customer.ApprovalStatus.APPROVED
        customer.approved_by = request.user
        customer.approved_at = timezone.now()
        customer.save()
        
        # Serializar e retornar
        serializer = self.get_serializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='block', permission_classes=[IsAuthenticated])
    def block_customer(self, request, pk=None):
        """
        POST /api/customers/{id}/block/
        
        Endpoint para admin bloquear um cliente (suspender acesso).
        
        Request:
        {
            "reason": "Motivo do bloqueio (opcional)"
        }
        
        Response:
        {
            "id": 1,
            "nickname": "Padaria Central",
            "status": "BLOQUEADO",
            ...
        }
        """
        # Validar que é admin
        if not request.user.is_staff:
            return Response(
                {'detail': 'Apenas administradores podem bloquear clientes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        customer = self.get_object()
        
        # Atualizar status
        customer.status = customer.ApprovalStatus.BLOCKED
        customer.save()
        
        # Serializar e retornar
        serializer = self.get_serializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_customer(request):
    """
    POST /api/customers/register/
    
    Endpoint público para registrar novo cliente sem autenticação prévia.
    Cria um usuário Django e um perfil de cliente automaticamente.
    
    Request:
    {
        "nickname": "Padaria Central",
        "customer_type": "PF",
        "phone": "11987654321",
        "zip_code": "01310100",
        "street": "Avenida Paulista",
        "number": "1000",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP"
    }
    
    Response:
    {
        "id": 1,
        "nickname": "Padaria Central",
        "customer_type": "PF",
        "phone": "11987654321",
        "zip_code": "01310100",
        "street": "Avenida Paulista",
        "number": "1000",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "credit_limit": "5000.00",
        "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
    """
    try:
        data = request.data
        
        # Validar campos obrigatórios
        required_fields = ['nickname', 'customer_type', 'phone', 'zip_code', 
                          'street', 'number', 'neighborhood', 'city', 'state']
        for field in required_fields:
            if field not in data or not data[field]:
                return Response(
                    {'detail': f'Campo obrigatório: {field}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Criar usuário Django com username aleatório
        username = f"customer_{uuid.uuid4().hex[:10]}"
        user = User.objects.create_user(username=username, password=str(uuid.uuid4()))
        
        # Criar perfil de cliente
        customer_data = {
            'nickname': data['nickname'],
            'customer_type': data['customer_type'],
            'phone': data.get('phone', ''),
            'zip_code': data.get('zip_code', ''),
            'street': data.get('street', ''),
            'number': data.get('number', ''),
            'neighborhood': data.get('neighborhood', ''),
            'city': data.get('city', ''),
            'state': data.get('state', 'SP'),
            'user': user,
        }
        
        customer = Customer.objects.create(**customer_data)
        
        # Gerar JWT token
        refresh = RefreshToken.for_user(user)
        
        # Serializar resposta
        serializer = CustomerSerializer(customer)
        response_data = serializer.data
        response_data['token'] = str(refresh.access_token)
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_customer(request):
    """
    POST /api/customers/login/
    
    Endpoint público para autenticar cliente usando apelido (nickname) + senha.
    
    Request:
    {
        "nickname": "Padaria Central",
        "password": "senha123"
    }
    
    Response:
    {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "customer": {
            "id": 1,
            "nickname": "Padaria Central",
            "customer_type": "PF",
            "phone": "11987654321",
            "status": "APROVADO",
            ...
        }
    }
    """
    try:
        nickname = request.data.get('nickname')
        password = request.data.get('password')
        
        # Validar campos
        if not nickname or not password:
            return Response(
                {'detail': 'nickname e password são obrigatórios'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar cliente por apelido
        try:
            customer = Customer.objects.get(nickname=nickname)
        except Customer.DoesNotExist:
            return Response(
                {'detail': 'Cliente não encontrado'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Verificar se está aprovado
        if not customer.is_approved:
            return Response(
                {'detail': 'Cliente ainda não foi aprovado pelo administrador'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Verificar se está bloqueado
        if customer.status == customer.ApprovalStatus.BLOCKED:
            return Response(
                {'detail': 'Cliente está bloqueado'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Autenticar usuário
        user = customer.user
        if not user.check_password(password):
            return Response(
                {'detail': 'Senha incorreta'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Gerar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        # Serializar cliente
        serializer = CustomerSerializer(customer)
        
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'customer': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_customer(request):
    """
    GET /api/customers/me/
    
    Endpoint autenticado que retorna dados do cliente autenticado.
    
    Headers:
    {
        "Authorization": "Bearer {access_token}"
    }
    
    Response:
    {
        "id": 1,
        "nickname": "Padaria Central",
        "customer_type": "PF",
        "phone": "11987654321",
        "status": "APROVADO",
        "balance": "1234.56",
        "credit_limit": "5000.00",
        ...
    }
    """
    try:
        user = request.user
        
        # Buscar customer do usuário autenticado
        try:
            customer = user.customer_profile
        except Customer.DoesNotExist:
            return Response(
                {'detail': 'Cliente não encontrado para este usuário'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = CustomerSerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def lookup_cep_address(request):
    """
    POST /api/customers/lookup-cep/
    
    Endpoint público que busca endereço usando ViaCEP API
    
    Request:
    {
        "zip_code": "01310100"  ou  "01310-100"
    }
    
    Response (sucesso):
    {
        "street": "Avenida Paulista",
        "number": "",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zip_code": "01310100"
    }
    
    Response (erro):
    {
        "detail": "CEP não encontrado"  ou  "CEP deve conter 8 dígitos"
    }
    """
    try:
        zip_code = request.data.get('zip_code')
        
        if not zip_code:
            return Response(
                {'detail': 'zip_code é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Buscar endereço via ViaCEP
        address_data = lookup_cep(zip_code)
        
        return Response(address_data, status=status.HTTP_200_OK)
        
    except ValidationError as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except ViaCEPError as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_customers(request):
    """
    GET /api/customers/pending/
    
    Endpoint para admin listar clientes pendentes de aprovação.
    
    Headers:
    {
        "Authorization": "Bearer {admin_token}"
    }
    
    Query Parameters:
    - ?page=1&page_size=10
    
    Response:
    {
        "count": 5,
        "next": "http://localhost:8000/api/customers/pending/?page=2",
        "previous": null,
        "results": [
            {
                "id": 1,
                "nickname": "Padaria Nova",
                "customer_type": "PF",
                "phone": "11987654321",
                "status": "PENDENTE",
                "created_at": "2024-01-15T10:30:00Z",
                ...
            }
        ]
    }
    """
    # Validar que é admin
    if not request.user.is_staff:
        return Response(
            {'detail': 'Apenas administradores podem acessar essa lista'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Buscar clientes com status PENDENTE
    pending = Customer.objects.filter(
        status=Customer.ApprovalStatus.PENDING
    ).order_by('created_at')
    
    # Aplicar paginação (reutilizar lógica do ViewSet)
    from rest_framework.pagination import PageNumberPagination
    paginator = PageNumberPagination()
    paginator.page_size = 10
    page = paginator.paginate_queryset(pending, request)
    
    if page is not None:
        serializer = CustomerSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    serializer = CustomerSerializer(pending, many=True)
    return Response({
        'count': len(serializer.data),
        'results': serializer.data
    })
