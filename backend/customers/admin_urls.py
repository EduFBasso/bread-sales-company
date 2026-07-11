"""
URL configuration para Admin API endpoints

Estrutura:
- /api/admin/orders/                    → Lista todos os pedidos
- /api/admin/orders/{id}/status/        → Atualizar status
- /api/admin/orders/{id}/cancel/        → Cancelar pedido
"""
from django.urls import path
from .admin_views import admin_orders_list, admin_update_order_status, admin_cancel_order

app_name = 'admin_api'

urlpatterns = [
    # Orders management
    path('orders/', admin_orders_list, name='admin-orders-list'),
    path('orders/<int:order_id>/status/', admin_update_order_status, name='admin-order-update-status'),
    path('orders/<int:order_id>/cancel/', admin_cancel_order, name='admin-order-cancel'),
]
