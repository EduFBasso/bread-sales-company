"""
Permissões customizadas para a API REST
"""
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permitir acesso apenas ao proprietário da entidade.
    Apenas leitura para others.
    """

    def has_object_permission(self, request, view, obj):
        # Leitura é permitida para qualquer request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Escrita apenas se o usuário é o proprietário
        return obj.user == request.user


class IsCustomerOrAdmin(permissions.BasePermission):
    """
    Permitir acesso apenas se o usuário é o cliente ou admin.
    """

    def has_object_permission(self, request, view, obj):
        # Admin tem acesso total
        if request.user and request.user.is_staff:
            return True

        # Cliente tem acesso ao seu próprio perfil
        return obj.user == request.user


class IsRelatedCustomer(permissions.BasePermission):
    """
    Permitir acesso apenas se o usuário é o cliente relacionado ao pedido/transação.
    """

    def has_object_permission(self, request, view, obj):
        # Admin tem acesso total
        if request.user and request.user.is_staff:
            return True

        # Cliente tem acesso apenas aos seus próprios pedidos/transações
        if hasattr(obj, 'customer'):
            return obj.customer.user == request.user
        
        return False
