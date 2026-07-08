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

    class Meta:
        model = Customer
        # ATUALIZADO: Inclui os campos granulares de endereço padrão brasileiro
        fields = [
            'id', 'user', 'customer_type', 'nickname', 
            'company_name', 'cnpj_cpf', 'phone', 
            'zip_code', 'street', 'number', 'complement', 
            'neighborhood', 'city', 'state',
            'credit_limit', 'current_balance'
        ]
