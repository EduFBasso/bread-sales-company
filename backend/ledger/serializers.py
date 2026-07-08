from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    # CORRIGIDO: Vinculado ao campo correto 'transaction_type'
    transaction_type_display = serializers.CharField(
        source='get_transaction_type_display', 
        read_only=True
    )

    class Meta:
        model = Transaction
        fields = [
            'id', 'customer', 'transaction_type', 
            'transaction_type_display', 'amount', 
            'description', 'order', 'created_at'
        ]
        read_only_fields = ['created_at']
