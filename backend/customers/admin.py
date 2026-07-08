from django.contrib import admin
from .models import Customer

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('get_name', 'phone', 'credit_limit', 'display_balance', 'created_at')
    search_fields = ('user__username', 'user__first_name', 'phone')

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_name.short_description = 'Cliente'

    def display_balance(self, obj):
        return f"R$ {obj.get_balance():.2f}"
    display_balance.short_description = 'Saldo Atual'
