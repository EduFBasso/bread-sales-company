from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import AdminLoginSerializer, UserRoleSerializer
from .models import UserRole


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
