from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Sum
from decimal import Decimal
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
    financial_limit = serializers.SerializerMethodField()
    financial_used = serializers.SerializerMethodField()
    financial_available = serializers.SerializerMethodField()

    def _get_financial_snapshot(self, obj):
        cached = getattr(obj, '_financial_snapshot_cache', None)
        if cached is not None:
            return cached

        from orders.models import Order

        used = (
            Order.objects.filter(customer=obj, payment_method='CREDIT')
            .exclude(status='CANCELLED')
            .aggregate(total=Sum('total_value'))['total']
            or Decimal('0.00')
        )
        limit = obj.credit_limit or Decimal('0.00')
        available = limit - used
        if available < Decimal('0.00'):
            available = Decimal('0.00')

        snapshot = {
            'limit': limit,
            'used': used,
            'available': available,
        }
        setattr(obj, '_financial_snapshot_cache', snapshot)
        return snapshot

    def get_financial_limit(self, obj):
        return self._get_financial_snapshot(obj)['limit']

    def get_financial_used(self, obj):
        return self._get_financial_snapshot(obj)['used']

    def get_financial_available(self, obj):
        return self._get_financial_snapshot(obj)['available']

    class Meta:
        model = Customer
        # ATUALIZADO: Inclui auditoria (approved_by, approved_at, blocked_by, blocked_at)
        fields = [
            'id', 'user', 'customer_type', 'nickname', 'status',
            'company_name', 'cpf', 'cnpj', 'cnpj_cpf', 'phone', 
            'zip_code', 'street', 'number', 'complement', 
            'neighborhood', 'city', 'state',
            'credit_limit', 'current_balance', 'available_credit',
            'financial_limit', 'financial_used', 'financial_available',
            'approved_by', 'approved_by_user', 'approved_at',
            'blocked_by', 'blocked_by_user', 'blocked_at',
            'created_at', 'updated_at'
        ]
