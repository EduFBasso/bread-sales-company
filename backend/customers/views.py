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

from .models import Customer, CustomerAuditLog
from .serializers import CustomerSerializer
from orders.models import Order
from orders.serializers import OrderSerializer, OrderCreateSerializer
from ledger.models import Transaction
from ledger.serializers import TransactionSerializer
from utils.permissions import IsCustomerOrAdmin
from utils.pagination import StandardResultsSetPagination
from utils.filters import CustomerFilterSet
from utils.viacep import lookup_cep, ViaCEPError
from utils.password_validator import validate_customer_password, validate_password_confirmation
from utils.password_generator import generate_random_password, is_valid_password
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.core.exceptions import ValidationError
from django.db.models.deletion import ProtectedError


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
    - POST   /api/customers/{id}/block/         → Bloqueia cliente
    - POST   /api/customers/{id}/unblock/       → Desbloqueia cliente
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

    def destroy(self, request, *args, **kwargs):
        """
        DELETE /api/customers/{id}

        Quando há histórico vinculado (pedidos/transações), devolve erro 409
        em vez de quebrar com 500.

        Para administradores, exige confirmação da senha do dono via
        campo `admin_password` no body da requisição.
        """
        if request.user.is_staff:
            admin_password = request.data.get('admin_password')
            if not admin_password:
                return Response(
                    {'detail': 'admin_password é obrigatória para apagar cliente'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not request.user.check_password(admin_password):
                return Response(
                    {'detail': 'Senha do administrador incorreta'},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            orders_count = instance.orders.count()
            transactions_count = instance.transactions.count()
            return Response(
                {
                    'detail': (
                        'Não é possível apagar este cliente porque ele possui histórico '
                        'vinculado. Use bloquear para inativar o cliente.'
                    ),
                    'orders_count': orders_count,
                    'transactions_count': transactions_count,
                },
                status=status.HTTP_409_CONFLICT,
            )

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
        
        Endpoint para admin aprovar um cliente pendente com limite de crédito e senha inicial.
        
        Request:
        {
            "credit_limit": "1000.00",
            "password": "Pwd123456",
            "confirm_password": "Pwd123456",
            "admin_password": "SenhaDono123"
        }
        
        Response (sucesso):
        {
            "id": 1,
            "nickname": "Padaria Central",
            "status": "APROVADO",
            "credit_limit": "1000.00",
            "approved_by": "admin",
            "approved_at": "2024-01-15T10:30:00Z",
            ...
        }
        """
        # Validar que é admin
        if not request.user.is_staff:
            return Response(
                {'detail': 'Apenas administradores podem aprovar clientes'},
                status=status.HTTP_403_FORBIDDEN
            )

        admin_password = request.data.get('admin_password')
        if not admin_password:
            return Response(
                {'detail': 'admin_password é obrigatória para confirmar aprovação'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.check_password(admin_password):
            return Response(
                {'detail': 'Senha do administrador incorreta'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        customer = self.get_object()
        
        # Verificar se já está aprovado
        if customer.is_approved:
            return Response(
                {'detail': 'Cliente já foi aprovado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar dados de entrada
        credit_limit = request.data.get('credit_limit')
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')
        
        if not credit_limit:
            return Response(
                {'detail': 'credit_limit é obrigatório'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # ✨ NOVO: Gerar senha automaticamente se não fornecida
        password_plain_text = password
        if not password:
            password_plain_text = generate_random_password(length=8)
            password = password_plain_text
            confirm_password = password_plain_text
        
        # Validar senha (mesmo se gerada)
        valid, msg = validate_customer_password(password)
        if not valid:
            return Response(
                {'detail': f'Senha inválida: {msg}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar confirmação
        match, msg = validate_password_confirmation(password, confirm_password)
        if not match:
            return Response(
                {'detail': msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar credit_limit é positivo
        try:
            limit_decimal = Decimal(credit_limit)
            if limit_decimal <= 0:
                return Response(
                    {'detail': 'credit_limit deve ser maior que 0'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except:
            return Response(
                {'detail': 'credit_limit deve ser um número válido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atualizar cliente
        customer.status = customer.ApprovalStatus.APPROVED
        customer.approved_by = request.user
        customer.approved_at = timezone.now()
        customer.credit_limit = limit_decimal
        customer.user.set_password(password)
        customer.user.save()
        customer.save()
        
        # Registrar auditoria
        CustomerAuditLog.objects.create(
            customer=customer,
            action='APPROVED',
            admin_user=request.user,
            details={
                'credit_limit': str(limit_decimal),
                'approved_by_user': request.user.username,
            }
        )
        
        # Serializar e retornar com senha em texto plano
        serializer = self.get_serializer(customer)
        response_data = serializer.data
        response_data['password_plain_text'] = password_plain_text  # ✨ NOVO
        return Response(response_data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='block', permission_classes=[IsAuthenticated])
    def block_customer(self, request, pk=None):
        """
        POST /api/customers/{id}/block/
        
        Endpoint para admin bloquear um cliente (suspender acesso).
        Requer confirmação de senha do admin para auditoria.
        
        Request:
        {
            "password": "senha_do_admin",
            "reason": "Motivo do bloqueio (opcional)"
        }
        
        Response:
        {
            "id": 1,
            "nickname": "Padaria Central",
            "status": "BLOQUEADO",
            "blocked_by": "admin",
            "blocked_at": "2024-01-15T10:30:00Z",
            ...
        }
        """
        # Validar que é admin
        if not request.user.is_staff:
            return Response(
                {'detail': 'Apenas administradores podem bloquear clientes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar password do admin
        password = request.data.get('password')
        if not password:
            return Response(
                {'detail': 'password (do admin) é obrigatória para confirmar bloqueio'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.user.check_password(password):
            return Response(
                {'detail': 'Senha do administrador incorreta'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        customer = self.get_object()
        reason = request.data.get('reason', 'Sem motivo especificado')
        
        # Atualizar status
        customer.status = customer.ApprovalStatus.BLOCKED
        customer.blocked_by = request.user
        customer.blocked_at = timezone.now()
        customer.save()
        
        # Registrar auditoria
        CustomerAuditLog.objects.create(
            customer=customer,
            action='BLOCKED',
            admin_user=request.user,
            details={
                'reason': reason,
                'blocked_by_user': request.user.username,
            }
        )
        
        # Serializar e retornar
        serializer = self.get_serializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='unblock', permission_classes=[IsAuthenticated])
    def unblock_customer(self, request, pk=None):
        """
        POST /api/customers/{id}/unblock/

        Endpoint para admin desbloquear um cliente e reativar acesso.
        Requer confirmação de senha do admin para auditoria.
        """
        # Validar que é admin
        if not request.user.is_staff:
            return Response(
                {'detail': 'Apenas administradores podem desbloquear clientes'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Validar password do admin
        password = request.data.get('password')
        if not password:
            return Response(
                {'detail': 'password (do admin) é obrigatória para confirmar desbloqueio'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not request.user.check_password(password):
            return Response(
                {'detail': 'Senha do administrador incorreta'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        customer = self.get_object()

        # Apenas clientes bloqueados podem ser desbloqueados
        if customer.status != customer.ApprovalStatus.BLOCKED:
            return Response(
                {'detail': 'Apenas clientes bloqueados podem ser desbloqueados'},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason', 'Sem motivo especificado')

        # Reativar cliente
        customer.status = customer.ApprovalStatus.APPROVED
        customer.blocked_by = None
        customer.blocked_at = None
        customer.save()

        # Registrar auditoria
        CustomerAuditLog.objects.create(
            customer=customer,
            action='UNBLOCKED',
            admin_user=request.user,
            details={
                'reason': reason,
                'unblocked_by_user': request.user.username,
            }
        )

        serializer = self.get_serializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='set-password', permission_classes=[IsAuthenticated])
    def set_password(self, request, pk=None):
        """
        POST /api/customers/{id}/set-password/
        
        Endpoint para admin definir ou alterar senha de um cliente.
        Requer senha do admin para confirmar.
        
        Request:
        {
            "password": "Nova_Senha123",
            "confirm_password": "Nova_Senha123",
            "admin_password": "senha_do_admin"
        }
        
        Response:
        {
            "detail": "Senha definida com sucesso"
        }
        """
        # Validar que é admin
        if not request.user.is_staff:
            return Response(
                {'detail': 'Apenas administradores podem definir senhas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Validar password do admin
        admin_password = request.data.get('admin_password')
        if not admin_password:
            return Response(
                {'detail': 'admin_password é obrigatória'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.user.check_password(admin_password):
            return Response(
                {'detail': 'Senha do administrador incorreta'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Validar nova senha
        password = request.data.get('password')
        confirm_password = request.data.get('confirm_password')
        
        if not password or not confirm_password:
            return Response(
                {'detail': 'password e confirm_password são obrigatórios'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar senha
        valid, msg = validate_customer_password(password)
        if not valid:
            return Response(
                {'detail': f'Senha inválida: {msg}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validar confirmação
        match, msg = validate_password_confirmation(password, confirm_password)
        if not match:
            return Response(
                {'detail': msg},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atualizar senha do cliente
        customer = self.get_object()
        customer.user.set_password(password)
        customer.user.save()
        
        # Registrar auditoria
        CustomerAuditLog.objects.create(
            customer=customer,
            action='PASSWORD_SET',
            admin_user=request.user,
            details={
                'set_by_user': request.user.username,
            }
        )
        
        return Response(
            {'detail': 'Senha definida com sucesso'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'], url_path='verify-admin-password', permission_classes=[IsAuthenticated])
    def verify_admin_password(self, request):
        """
        POST /api/customers/verify-admin-password/

        Valida a senha do administrador para ações sensíveis de interface
        (ex.: visualizar/copiar/compartilhar senha de cliente).

        Request:
        {
            "admin_password": "senha_do_admin"
        }
        """
        if not request.user.is_staff:
            return Response(
                {'detail': 'Apenas administradores podem validar esta ação'},
                status=status.HTTP_403_FORBIDDEN,
            )

        admin_password = request.data.get('admin_password')
        if not admin_password:
            return Response(
                {'detail': 'admin_password é obrigatória'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not request.user.check_password(admin_password):
            return Response(
                {'detail': 'Senha do administrador incorreta'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response({'detail': 'Senha confirmada'}, status=status.HTTP_200_OK)


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
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "customer": {
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
            "status": "PENDENTE"
        }
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
        
        # Gerar JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        # Serializar resposta
        serializer = CustomerSerializer(customer)
        
        return Response({
            'id': customer.id,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'customer': serializer.data,
        }, status=status.HTTP_201_CREATED)
        
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_orders_list(request):
    """
    GET /api/customers/orders/
    
    Endpoint para cliente autenticado listar seus próprios pedidos.
    Alternativa mais simples que GET /api/customers/{id}/orders/
    
    Headers:
    {
        "Authorization": "Bearer {customer_token}"
    }
    
    Query Parameters:
    - ?status=PENDING
    - ?status=CONFIRMED
    - ?status=DELIVERED
    - ?status=CANCELLED
    - ?page=1&page_size=10
    
    Response:
    {
        "count": 5,
        "next": "http://localhost:8000/api/customers/orders/?page=2",
        "previous": null,
        "results": [
            {
                "id": 1,
                "order_number": "ORD-001",
                "customer_id": 1,
                "status": "PENDING",
                "order_date": "2024-01-15T10:30:00Z",
                "total_value": "150.00",
                "delivery_date": "2024-01-18T14:00:00Z",
                "items": [
                    {
                        "id": 1,
                        "product_id": 5,
                        "product_name": "Pão Francês",
                        "quantity": 10,
                        "unit_price": "15.00",
                        "subtotal": "150.00"
                    }
                ],
                ...
            }
        ]
    }
    """
    try:
        # Buscar customer do usuário autenticado
        try:
            customer = request.user.customer_profile
        except Customer.DoesNotExist:
            return Response(
                {'detail': 'Cliente não encontrado para este usuário'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Buscar pedidos do cliente
        orders = customer.orders.all().order_by('-created_at')
        
        # Filtrar por status se fornecido
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = orders.filter(status=status_filter.upper())
        
        # Aplicar paginação
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get('page_size', 10)
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
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def customer_transactions_list(request):
    """
    GET /api/customers/transactions/
    
    Endpoint para cliente autenticado listar seu histórico de transações/pagamentos.
    Alternativa mais simples que GET /api/customers/{id}/transactions/
    
    Headers:
    {
        "Authorization": "Bearer {customer_token}"
    }
    
    Query Parameters:
    - ?transaction_type=CREDIT
    - ?transaction_type=DEBIT
    - ?page=1&page_size=10
    
    Response:
    {
        "count": 10,
        "next": "http://localhost:8000/api/customers/transactions/?page=2",
        "previous": null,
        "results": [
            {
                "id": 1,
                "customer_id": 1,
                "transaction_type": "DEBIT",
                "amount": "150.00",
                "description": "Pagamento do Pedido ORD-001",
                "reference_order_id": 1,
                "transaction_date": "2024-01-15T10:30:00Z",
                "created_at": "2024-01-15T10:30:00Z"
            }
        ]
    }
    """
    try:
        # Buscar customer do usuário autenticado
        try:
            customer = request.user.customer_profile
        except Customer.DoesNotExist:
            return Response(
                {'detail': 'Cliente não encontrado para este usuário'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Buscar transações do cliente
        transactions = customer.transactions.all().order_by('-created_at')
        
        # Filtrar por tipo se fornecido
        transaction_type_filter = request.query_params.get('transaction_type')
        if transaction_type_filter:
            transactions = transactions.filter(transaction_type=transaction_type_filter.upper())
        
        # Aplicar paginação
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = request.query_params.get('page_size', 10)
        page = paginator.paginate_queryset(transactions, request)
        
        if page is not None:
            serializer = TransactionSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = TransactionSerializer(transactions, many=True)
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def customer_create_order(request):
    """
    POST /api/customers/orders/create/
    
    Endpoint para cliente autenticado criar um novo pedido com items atomicamente.
    
    Headers:
    {
        "Authorization": "Bearer {customer_token}",
        "Content-Type": "application/json"
    }
    
    Request Body:
    {
        "delivery_date": "2024-01-20T14:00:00Z",
        "payment_method": "CREDIT",
        "notes": "Entregar na portaria",
        "items": [
            {
                "product_id": 1,
                "quantity": 10
            },
            {
                "product_id": 2,
                "quantity": 5
            }
        ],
        "shipping_zip_code": "01310-100",
        "shipping_street": "Avenida Paulista",
        "shipping_number": "1000",
        "shipping_neighborhood": "Bela Vista",
        "shipping_city": "São Paulo",
        "shipping_state": "SP"
    }
    
    Response (sucesso):
    {
        "id": 1,
        "order_number": "ORD-001",
        "customer_id": 1,
        "status": "PENDING",
        "order_date": "2024-01-15T10:30:00Z",
        "delivery_date": "2024-01-20T14:00:00Z",
        "payment_method": "CREDIT",
        "total_value": "150.00",
        "items": [
            {
                "product_id": 1,
                "product_name": "Pão Francês",
                "quantity": 10,
                "unit_price": "15.00",
                "subtotal": "150.00"
            }
        ]
    }
    """
    try:
        # Buscar customer do usuário autenticado
        try:
            customer = request.user.customer_profile
        except Customer.DoesNotExist:
            return Response(
                {'detail': 'Cliente não encontrado para este usuário'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Validar dados de entrada
        serializer = OrderCreateSerializer(data=request.data, context={'customer': customer})
        if not serializer.is_valid():
            return Response(
                {'detail': 'Dados inválidos', 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Criar o pedido (com items atomicamente)
        order = serializer.save(customer=customer)
        
        # Retornar pedido criado com items
        response_serializer = OrderSerializer(order)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )
        
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
