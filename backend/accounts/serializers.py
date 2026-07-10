from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserRole


class AdminLoginSerializer(serializers.Serializer):
    """Serializer para login de admin (Owner/Manager)"""
    
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        # Verificar se usuário existe
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError({'username': 'Usuário não encontrado'})
        
        # Verificar se é staff (admin)
        if not user.is_staff:
            raise serializers.ValidationError({'detail': 'Este usuário não tem permissão de administrador'})
        
        # Verificar senha
        if not user.check_password(password):
            raise serializers.ValidationError({'password': 'Senha incorreta'})
        
        # Buscar role se existir
        try:
            user_role = user.role
        except UserRole.DoesNotExist:
            # Se for superuser sem UserRole, definir como owner
            user_role = None
        
        data['user'] = user
        data['user_role'] = user_role
        return data


class UserRoleSerializer(serializers.ModelSerializer):
    """Serializer para UserRole"""
    
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = UserRole
        fields = ['id', 'username', 'email', 'role', 'created_at']
        read_only_fields = ['id', 'created_at']
