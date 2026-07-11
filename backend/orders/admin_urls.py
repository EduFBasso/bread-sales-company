"""
Admin URLs para gerenciamento de produtos
"""
from django.urls import path
from .admin_views import (
    admin_create_product,
    admin_product_detail,
    admin_products_list,
)

app_name = 'admin_products'

urlpatterns = [
    # Listar todos e criar
    path('', admin_products_list, name='products-list'),
    path('create/', admin_create_product, name='products-create'),
    
    # Detalhe, atualizar, deletar
    path('<int:product_id>/', admin_product_detail, name='product-detail'),
]
