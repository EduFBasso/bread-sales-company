from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('customer', 'transaction_type', 'amount', 'created_at', 'description')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('customer__user__username', 'description')
