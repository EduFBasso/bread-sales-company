from django.db import models
from django.core.validators import RegexValidator
from decimal import Decimal
from customers.models import Customer

class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pendente'),
        ('CONFIRMED', 'Confirmado'),
        ('DELIVERED', 'Entregue'),
        ('CANCELLED', 'Cancelado'),
    ]
    PAYMENT_CHOICES = [
        ('CREDIT', 'Fiado'),
        ('CASH', 'Dinheiro'),
        ('PIX', 'PIX'),
        ('TRANSFER', 'Transferência'),
    ]

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    delivery_date = models.DateTimeField()  # Data e hora de entrega
    
    # Endereço de entrega (obrigatório)
    # Por padrão, clona do cadastro do cliente. Se o cliente marcar a opção no frontend,
    # pode preencher um endereço alternativo (ex: filial, galpão diferente)
    shipping_zip_code = models.CharField(
        max_length=8, 
        help_text="CEP de entrega (8 dígitos)",
        validators=[RegexValidator(r'^\d{8}$', 'CEP deve conter exatamente 8 dígitos')]
    )
    shipping_street = models.CharField(max_length=150, help_text="Rua de entrega")
    shipping_number = models.CharField(max_length=20, help_text="Número")
    shipping_complement = models.CharField(max_length=100, blank=True, null=True, help_text="Complemento (opcional)")
    shipping_neighborhood = models.CharField(max_length=100, help_text="Bairro")
    shipping_city = models.CharField(max_length=100, help_text="Cidade")
    shipping_state = models.CharField(max_length=2, help_text="UF (ex: SP)")

    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    notes = models.TextField(blank=True)
    total_value = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    cancellation_reason = models.TextField(blank=True, null=True, help_text="Motivo do cancelamento")
    cancelled_at = models.DateTimeField(blank=True, null=True, help_text="Data/hora do cancelamento")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def update_total_value(self):
        """Soma o subtotal de todos os itens vinculados e atualiza o total_value"""
        total = self.items.aggregate(total_sum=models.Sum('subtotal'))['total_sum'] or Decimal('0.00')
        Order.objects.filter(pk=self.pk).update(total_value=total)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"Order #{self.pk} - {self.customer.nickname} ({self.status})"

    def save(self, *args, **kwargs):
        """
        Automação de Endereço de Entrega:
        Se o endereço está vazio, clona automaticamente do cadastro do cliente.
        Isso garante que sempre existe um endereço de entrega válido.
        O cliente pode sobrescrever este endereço via frontend (flag de "entrega em outro local").
        """
        if not self.shipping_zip_code and self.customer:
            self.shipping_zip_code = self.customer.zip_code
            self.shipping_street = self.customer.street
            self.shipping_number = self.customer.number
            self.shipping_complement = self.customer.complement
            self.shipping_neighborhood = self.customer.neighborhood
            self.shipping_city = self.customer.city
            self.shipping_state = self.customer.state
            
        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    class Meta:
        unique_together = [['order', 'product']]
        indexes = [
            models.Index(fields=['order']),
        ]

    def __str__(self):
        return f"{self.quantity}x {self.product.name} - Order #{self.order.pk}"

    def save(self, *args, **kwargs):
        """
        Automação de Preços (Snapshot):
        1. Se unit_price está vazio (novo item), copia do catálogo (Product.price)
        2. Calcula o subtotal: unit_price × quantity
        3. Salva o item no BD
        4. Atualiza o total do Order pai
        
        Isso garante imutabilidade: se o preço do produto mudar depois,
        o pedido histórico mantém o preço que foi efetivamente cobrado.
        """
        # 1. Snapshot do preço do catálogo (apenas se novo)
        if self.unit_price == Decimal('0.00') and self.product:
            self.unit_price = self.product.price
            
        # 2. Calcula o subtotal
        if self.unit_price and self.quantity:
            self.subtotal = self.unit_price * self.quantity
        
        # 3. Salva o item fisicamente no banco de dados primeiro
        super().save(*args, **kwargs)
        
        # 4. Atualiza o valor total do pedido pai com o item já salvo
        self.order.update_total_value()

