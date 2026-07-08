from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from decimal import Decimal

class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.PROTECT, related_name='customer_profile')
    phone = models.CharField(
        max_length=11,
        validators=[RegexValidator(r'^\d{10,11}$', 'Phone must have 10-11 digits')]
    )
    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['user__first_name']
        indexes = [
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.phone})"

    def get_balance(self):
        """Calculate current balance: CREDIT - DEBIT (Sempre usando Decimal)"""
        from ledger.models import Transaction
        credits = Transaction.objects.filter(
            customer=self, 
            transaction_type='CREDIT'
        ).aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
        debits = Transaction.objects.filter(
            customer=self, 
            transaction_type='DEBIT'
        ).aggregate(total=models.Sum('amount'))['total'] or Decimal('0.00')
        return credits - debits
