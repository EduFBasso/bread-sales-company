from rest_framework import serializers
from decimal import Decimal
from django.db.models import Sum
from .models import Product, Order, OrderItem

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'is_active', 'created_at']

class OrderItemSerializer(serializers.ModelSerializer):
    # Mostra os detalhes legíveis do pão (nome, etc) na resposta da API
    product_details = ProductSerializer(source='product', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_id = serializers.IntegerField(source='product.id', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'product_name', 'product_details', 'quantity', 'unit_price', 'subtotal']
        # Bloqueia a edição manual de preços e subtotais, mantendo as automações ativas
        read_only_fields = ['unit_price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    # Faz o aninhamento dos itens do pedido (um para muitos)
    items = OrderItemSerializer(many=True, read_only=True)
    customer_nickname = serializers.CharField(source='customer.nickname', read_only=True)
    customer_id = serializers.IntegerField(source='customer.id', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    # Campos mapeados para o frontend
    order_number = serializers.SerializerMethodField(read_only=True)
    order_date = serializers.DateTimeField(source='created_at', read_only=True)
    
    def get_order_number(self, obj):
        """Gera número de pedido formatado: ORD-001"""
        return f"ORD-{obj.id:03d}"

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'customer_id', 'customer_nickname', 'status', 'status_display',
            'order_date', 'delivery_date', 'payment_method', 'payment_method_display', 'notes', 
            'shipping_zip_code', 'shipping_street', 'shipping_number', 
            'shipping_complement', 'shipping_neighborhood', 'shipping_city', 'shipping_state',
            'total_value', 'items', 'paid_at', 'cancelled_at', 'cancellation_reason', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_value', 'created_at', 'updated_at']

    def validate(self, data):
        """
        Validacao de Endereco Obrigatorio:
        
        - Se o pedido sera entregue no endereco padrao do cliente,
          nao eh necessario preencher os campos shipping_*.
          A automacao no Order.save() vai clonar do cadastro do cliente.
          
        - Se o cliente quer entrega em outro local (filial/galpao),
          os campos shipping_* DEVEM estar preenchidos.
          
        Verificacao: se ha dados de shipping parciais, gera erro.
        """
        customer = data.get('customer') or (self.instance.customer if self.instance else None)
        
        # Campos que definem um endereco de entrega alternativo
        shipping_fields = [
            'shipping_zip_code', 'shipping_street', 'shipping_number',
            'shipping_neighborhood', 'shipping_city', 'shipping_state'
        ]
        
        # Verifica quantos campos de shipping foram preenchidos
        provided_fields = [f for f in shipping_fields if data.get(f)]
        
        # Se ALGUNS campos estao preenchidos mas nao TODOS, eh erro
        if provided_fields and len(provided_fields) < len(shipping_fields) - 1:  # -1 porque complement eh opcional
            raise serializers.ValidationError(
                "Se voce deseja entrega em outro endereco, todos os campos obrigatorios devem ser preenchidos: "
                "CEP, rua, numero, bairro, cidade e estado."
            )
        
        # Se NENHUM campo de shipping foi preenchido, valida que o cliente tem endereco cadastrado
        if not provided_fields:
            if not customer or not customer.zip_code:
                raise serializers.ValidationError(
                    "Endereco obrigatorio: O cliente deve ter um endereco cadastrado "
                    "ou voce deve fornecer um endereco alternativo de entrega."
                )
        
        # Validação de Crédito Disponível (Phase 7)
        # Verifica se o cliente tem crédito disponível para fazer novos pedidos
        if customer:
            # Verifica se o cliente está aprovado
            if customer.status != customer.ApprovalStatus.APPROVED:
                raise serializers.ValidationError(
                    f"Cliente não está aprovado para fazer pedidos. Status atual: {customer.get_status_display()}"
                )
            
            # Verifica se tem crédito disponível
            available_credit = customer.available_credit()
            if available_credit <= 0:
                current_balance = customer.get_balance()
                raise serializers.ValidationError(
                    f"Cliente sem crédito disponível. Limite: R$ {customer.credit_limit:.2f}, "
                    f"Saldo: R$ {current_balance:.2f}, Disponível: R$ {available_credit:.2f}"
                )
        
        return data


class OrderItemCreateSerializer(serializers.Serializer):
    """Serializer para criar OrderItem com product_id e quantidade"""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

    def validate_product_id(self, value):
        """Verifica se o produto existe e está ativo"""
        try:
            product = Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError(f"Produto com ID {value} não encontrado ou inativo.")
        return value


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer para criar Order com items atomicamente"""
    items = OrderItemCreateSerializer(many=True, required=True)
    shipping_zip_code = serializers.CharField(required=False, allow_blank=True)
    shipping_street = serializers.CharField(required=False, allow_blank=True)
    shipping_number = serializers.CharField(required=False, allow_blank=True)
    shipping_complement = serializers.CharField(required=False, allow_blank=True)
    shipping_neighborhood = serializers.CharField(required=False, allow_blank=True)
    shipping_city = serializers.CharField(required=False, allow_blank=True)
    shipping_state = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Order
        fields = [
            'delivery_date', 'payment_method', 'notes',
            'shipping_zip_code', 'shipping_street', 'shipping_number',
            'shipping_complement', 'shipping_neighborhood', 'shipping_city', 'shipping_state',
            'items'
        ]

    def validate_items(self, value):
        """Valida que há pelo menos um item"""
        if not value:
            raise serializers.ValidationError("O pedido deve conter pelo menos um item.")
        return value

    def validate(self, data):
        """
        Regras de crédito para criação de pedido:
        - Cliente precisa estar aprovado.
        - Para pagamento CREDIT, o total do pedido não pode exceder o crédito disponível.
        - O crédito disponível considera pedidos CREDIT ainda em aberto (não cancelados).
        """
        customer = self.context.get('customer')
        if not customer:
            return data

        if customer.status != customer.ApprovalStatus.APPROVED:
            raise serializers.ValidationError(
                f"Cliente não está aprovado para fazer pedidos. Status atual: {customer.get_status_display()}"
            )

        if data.get('payment_method') != 'CREDIT':
            return data

        items_data = data.get('items', [])
        if not items_data:
            return data

        product_ids = [item['product_id'] for item in items_data]
        products = Product.objects.filter(id__in=product_ids, is_active=True)
        products_map = {product.id: product for product in products}

        missing_ids = [pid for pid in product_ids if pid not in products_map]
        if missing_ids:
            raise serializers.ValidationError(
                f"Produtos inválidos ou inativos no pedido: {', '.join(str(pid) for pid in sorted(set(missing_ids)))}"
            )

        order_total = Decimal('0.00')
        for item in items_data:
            product = products_map[item['product_id']]
            order_total += product.price * item['quantity']

        used_credit = (
            Order.objects.filter(customer=customer, payment_method='CREDIT')
            .exclude(status='CANCELLED')
            .aggregate(total=Sum('total_value'))['total']
            or Decimal('0.00')
        )
        credit_limit = Decimal(str(customer.credit_limit or '0.00'))
        available_credit = credit_limit - used_credit
        if available_credit < Decimal('0.00'):
            available_credit = Decimal('0.00')

        if order_total > available_credit:
            raise serializers.ValidationError(
                (
                    f"Pedido excede o limite disponível. Total do pedido: R$ {order_total:.2f}, "
                    f"Disponível: R$ {available_credit:.2f}."
                )
            )

        return data

    def create(self, validated_data):
        """Cria Order e OrderItems atomicamente"""
        from django.db import transaction
        
        items_data = validated_data.pop('items')
        
        # Usar transação para garantir atomicidade
        with transaction.atomic():
            # Criar o pedido
            order = Order.objects.create(**validated_data)
            
            # Adicionar items ao pedido
            for item_data in items_data:
                product = Product.objects.get(id=item_data['product_id'])
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item_data['quantity'],
                    unit_price=product.price
                )
            
            # Atualizar total_value
            order.update_total_value()
        
        return order
