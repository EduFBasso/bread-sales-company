from django.contrib import admin
from .models import Customer

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    # Campos que vão aparecer nas colunas da tabela de listagem
    list_display = ('nickname', 'customer_type', 'phone', 'credit_limit', 'display_balance', 'zip_code', 'street', 'number', 'complement', 'neighborhood', 'city', 'state')
    
    # Filtros rápidos na barra lateral direita
    list_filter = ('customer_type', 'created_at')
    
    # Barra de busca por apelido, telefone ou usuário do Django
    search_fields = ('nickname', 'company_name', 'phone', 'user__username')

    def display_balance(self, obj):
        return f"R$ {obj.get_balance():.2f}"
    display_balance.short_description = 'Saldo Atual'
