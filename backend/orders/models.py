from django.db import models
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
    delivery_date = models.DateTimeField()  # AJUSTADO: DateTimeField para incluir o horário de entrega
    address = models.TextField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES)
    notes = models.TextField(blank=True)
    total_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, blank=True)  # add blank true (teste)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def update_total_value(self):
        """Soma o subtotal de todos os itens vinculados e atualiza o total_value"""
        from decimal import Decimal
        # Faz a soma diretamente no banco de dados para máxima performance
        total = self.items.aggregate(total_sum=models.Sum('subtotal'))['total_sum'] or Decimal('0.00')
        
        # Atualiza o campo sem disparar um loop infinito de sinais
        Order.objects.filter(pk=self.pk).update(total_value=total)


    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', 'status']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"Order #{self.pk} - {self.customer.user.get_full_name()} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True)  # Snapshot obs. add blank true (teste)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, blank=True) # obs. add blank true (teste)

    class Meta:
        unique_together = [['order', 'product']]
        indexes = [
            models.Index(fields=['order']),
        ]

    def __str__(self):
        return f"{self.quantity}x {self.product.name} - Order #{self.order.pk}"

    def save(self, *args, **kwargs):
        # 1. Se for um item novo e não foi passado preço, busca o snapshot do catálogo de produtos
        if not self.unit_price and self.product:
            self.unit_price = self.product.price
            
        # 2. Calcula matematicamente o subtotal (sempre em Decimal)
        if self.unit_price and self.quantity:
            self.subtotal = self.unit_price * self.quantity
            
        super().save(*args, **kwargs)
        
        # 3. Atualiza o valor total do pedido pai após salvar o item
        self.order.update_total_value()
