from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    # CORRIGIDO: Vinculado ao campo correto 'transaction_type'
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display', 
        read_only=True
    )
    # Frontend expects reference_order_id instead of order
    reference_order_id = serializers.IntegerField(source='order.id', read_only=True, allow_null=True)
    # Map created_at to transaction_date for frontend
    transaction_date = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'customer', 'transaction_type', 
            'transaction_type_display', 'amount', 
            'description', 'order', 'reference_order_id', 'transaction_date', 'created_at'
        ]
        read_only_fields = ['created_at']
