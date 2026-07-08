from rest_framework import serializers
from .models import Product, Order, OrderItem

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'is_active', 'created_at']

class OrderItemSerializer(serializers.ModelSerializer):
    # Mostra os detalhes legíveis do pão (nome, etc) na resposta da API
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_details', 'quantity', 'unit_price', 'subtotal']
        # Bloqueia a edição manual de preços e subtotais, mantendo as automações ativas
        read_only_fields = ['unit_price', 'subtotal']

class OrderSerializer(serializers.ModelSerializer):
    # Faz o aninhamento dos itens do pedido (um para muitos)
    items = OrderItemSerializer(many=True, read_only=True)
    customer_nickname = serializers.CharField(source='customer.nickname', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_nickname', 'status', 'status_display',
            'delivery_date', 'payment_method', 'payment_method_display', 'notes', 
            'shipping_zip_code', 'shipping_street', 'shipping_number', 
            'shipping_complement', 'shipping_neighborhood', 'shipping_city', 'shipping_state',
            'total_value', 'items', 'created_at', 'updated_at'
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
        
        return data
