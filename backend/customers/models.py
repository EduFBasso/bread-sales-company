from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from decimal import Decimal

class Customer(models.Model):
    # Opções para tipo de cliente
    class CustomerType(models.TextChoices):
        PHYSICAL = 'PF', 'Pessoa Física'
        JURIDICAL = 'PJ', 'Pessoa Jurídica'
    
    # Opções para status de aprovação
    class ApprovalStatus(models.TextChoices):
        PENDING = 'PENDENTE', 'Pendente de Aprovação'
        APPROVED = 'APROVADO', 'Aprovado'
        BLOCKED = 'BLOQUEADO', 'Bloqueado'

    user = models.OneToOneField(User, on_delete=models.PROTECT, related_name='customer_profile')
    
    # Status de aprovação
    status = models.CharField(
        max_length=10,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        help_text="Status de aprovação do cliente"
    )
    
    # Identificação do cliente conforme a realidade do negócio
    customer_type = models.CharField(
        max_length=2, 
        choices=CustomerType.choices, 
        default=CustomerType.JURIDICAL
    )
    nickname = models.CharField(max_length=100, help_text="Apelido ou Nome Fantasia")
    company_name = models.CharField(max_length=150, blank=True, null=True, help_text="Razão Social (Opcional)")
    
    # CPF (para Pessoa Física)
    cpf = models.CharField(
        max_length=11,
        blank=True,
        null=True,
        unique=True,
        validators=[RegexValidator(r'^\d{11}$', 'CPF deve conter 11 dígitos')]
    )
    
    # CNPJ (para Pessoa Jurídica)
    cnpj = models.CharField(
        max_length=14,
        blank=True,
        null=True,
        unique=True,
        validators=[RegexValidator(r'^\d{14}$', 'CNPJ deve conter 14 dígitos')]
    )
    
    # Campo legado (manter compatibilidade)
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

    # Campos de aprovação
    approved_at = models.DateTimeField(null=True, blank=True, help_text="Data/hora da aprovação")
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_customers',
        help_text="Admin que aprovou o cliente"
    )

    # Campos de bloqueio (auditoria)
    blocked_at = models.DateTimeField(null=True, blank=True, help_text="Data/hora do bloqueio")
    blocked_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='blocked_customers',
        help_text="Admin que bloqueou o cliente"
    )

    credit_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nickname']  # Ordena no painel pelo apelido do mercado
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['nickname']),
            models.Index(fields=['status']),
            models.Index(fields=['cpf']),
            models.Index(fields=['cnpj']),
        ]

    def __str__(self):
        return f"{self.nickname} ({self.get_customer_type_display()}) - {self.get_status_display()}"
    
    @property
    def is_approved(self):
        """Verifica se o cliente foi aprovado"""
        return self.status == self.ApprovalStatus.APPROVED

    def can_make_orders(self):
        """
        Verifica se o cliente pode fazer pedidos:
        - Deve estar APROVADO
        - Não deve estar BLOQUEADO
        - Deve ter crédito disponível
        """
        return (
            self.status == self.ApprovalStatus.APPROVED
            and self.credit_limit > Decimal('0.00')
            and self.available_credit() > Decimal('0.00')
        )

    def available_credit(self):
        """
        Calcula o crédito disponível para uso:
        available_credit = credit_limit - current_balance
        """
        from decimal import Decimal
        current_balance = self.get_balance()
        limit = Decimal(str(self.credit_limit))  # Converter para Decimal
        available = limit - current_balance
        return max(available, Decimal('0.00'))  # Nunca retorna negativo

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


class CustomerAuditLog(models.Model):
    """
    Registro de auditoria para ações administrativas em clientes.
    Rastreia: quem aprovou, quem bloqueou, quando, e detalhes da ação.
    """
    
    ACTION_CHOICES = [
        ('APPROVED', 'Cliente Aprovado'),
        ('BLOCKED', 'Cliente Bloqueado'),
        ('PASSWORD_SET', 'Senha Definida/Alterada'),
        ('CREDIT_LIMIT_UPDATED', 'Limite de Crédito Atualizado'),
        ('UNBLOCKED', 'Cliente Desbloqueado'),
    ]
    
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name='audit_logs',
        help_text="Cliente afetado pela ação"
    )
    
    action = models.CharField(
        max_length=30,
        choices=ACTION_CHOICES,
        help_text="Tipo de ação realizada"
    )
    
    admin_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_actions',
        help_text="Admin que realizou a ação"
    )
    
    timestamp = models.DateTimeField(
        auto_now_add=True,
        help_text="Data e hora da ação"
    )
    
    details = models.JSONField(
        default=dict,
        blank=True,
        help_text="Detalhes adicionais (ex: credit_limit anterior/novo)"
    )
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['customer', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['admin_user', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.customer.nickname} - {self.get_action_display()} - {self.timestamp.strftime('%d/%m/%Y %H:%M')}"
