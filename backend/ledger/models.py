from django.db import models
from customers.models import Customer
from django.db.models import TextChoices

class Transaction(models.Model):
    class TransactionType(TextChoices):
        CREDIT = 'CREDIT', 'Crédito/Depósito'
        DEBIT = 'DEBIT', 'Débito/Venda'

    customer = models.ForeignKey(Customer, on_delete=models.PROTECT, related_name='transactions')
    transaction_type = models.CharField(
        max_length=10, 
        choices=TransactionType.choices
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    order = models.ForeignKey(
        'orders.Order', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='transactions'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer', '-created_at']),
        ]

    def __str__(self):
        return f"{self.customer} - {self.transaction_type} R$ {self.amount:.2f} ({self.created_at.date()})"
