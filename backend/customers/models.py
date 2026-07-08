from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from decimal import Decimal

class Customer(models.Model):
    # Opções para tipo de cliente
    class CustomerType(models.TextChoices):
        PHYSICAL = 'PF', 'Pessoa Física'
        JURIDICAL = 'PJ', 'Pessoa Jurídica'

    user = models.OneToOneField(User, on_delete=models.PROTECT, related_name='customer_profile')
    
    # Identificação do cliente conforme a realidade do negócio
    customer_type = models.CharField(
        max_length=2, 
        choices=CustomerType.choices, 
        default=CustomerType.JURIDICAL
    )
    nickname = models.CharField(max_length=100, help_text="Apelido ou Nome Fantasia")
    company_name = models.CharField(max_length=150, blank=True, null=True, help_text="Razão Social (Opcional)")
    
    # Aceita de 11 (CPF) a 14 (CNPJ) dígitos puros
    cnpj_cpf = models.CharField(
        max_length=14,
        blank=True,
        null=True,
        validators=[RegexValidator(r'^\d{11,14}$', 'Documento deve conter apenas números (11 a 14 dígitos)')]
    )
    
    phone = models.CharField(
        max_length=11,
        validators=[RegexValidator(r'^\d{10,11}$', 'Telefone deve ter 10 ou 11 dígitos puros')]
    )
    
    # Campos de endereço: (ex delivery_address)
    zip_code = models.CharField(max_length=8, help_text="CEP apenas números")
    street = models.CharField(max_length=150, help_text="Rua, Avenida, etc.")
    number = models.CharField(max_length=20, help_text="Número ou S/N")
    complement = models.CharField(max_length=100, blank=True, null=True, help_text="Apartamento, Bloco, etc.")
    neighborhood = models.CharField(max_length=100, help_text="Bairro")
    city = models.CharField(max_length=100, help_text="Cidade")
    state = models.CharField(max_length=2, help_text="UF (ex: SP)")


    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nickname']  # Ordena no painel pelo apelido do mercado
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['nickname']),
        ]

    def __str__(self):
        return f"{self.nickname} ({self.get_customer_type_display()})"

    def get_balance(self):
        """Calcula o saldo atual baseado no histórico do livro caixa (CREDIT - DEBIT)"""
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
