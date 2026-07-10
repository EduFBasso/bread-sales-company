from rest_framework.permissions import BasePermission
from .models import UserRole


class IsOwner(BasePermission):
    """Permissão: usuário é um Owner"""
    
    message = 'Apenas donos têm acesso a este recurso'
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        try:
            return request.user.role.is_owner()
        except UserRole.DoesNotExist:
            return False


class IsManager(BasePermission):
    """Permissão: usuário é um Manager"""
    
    message = 'Apenas gerenciadores têm acesso a este recurso'
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_superuser:
            return True
        
        try:
            return request.user.role.is_manager()
        except UserRole.DoesNotExist:
            return False


class IsOwnerOrManager(BasePermission):
    """Permissão: usuário é Owner ou Manager"""
    
    message = 'Apenas administradores têm acesso a este recurso'
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if not request.user.is_staff:
            return False
        
        return True
