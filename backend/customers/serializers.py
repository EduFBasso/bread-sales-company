from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Customer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    current_balance = serializers.DecimalField(
        source='get_balance', 
        max_digits=10, 
        decimal_places=2, 
        read_only=True
    )
    available_credit = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    approved_by_user = serializers.CharField(
        source='approved_by.username',
        read_only=True,
        allow_null=True
    )
    blocked_by_user = serializers.CharField(
        source='blocked_by.username',
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Customer
        # ATUALIZADO: Inclui auditoria (approved_by, approved_at, blocked_by, blocked_at)
        fields = [
            'id', 'user', 'customer_type', 'nickname', 'status',
            'company_name', 'cnpj_cpf', 'phone', 
            'zip_code', 'street', 'number', 'complement', 
            'neighborhood', 'city', 'state',
            'credit_limit', 'current_balance', 'available_credit',
            'approved_by', 'approved_by_user', 'approved_at',
            'blocked_by', 'blocked_by_user', 'blocked_at',
            'created_at', 'updated_at'
        ]
