"""
URLs para Orders
"""
from django.urls import path
from rest_framework.routers import DefaultRouter, SimpleRouter
from rest_framework_nested import routers
from .views import OrderViewSet, OrderItemViewSet, ProductViewSet

app_name = 'orders'

# Router principal
router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'products', ProductViewSet, basename='product')

# Router aninhado para OrderItems dentro de Order
orders_router = routers.NestedSimpleRouter(router, r'orders', lookup='order')
orders_router.register(r'items', OrderItemViewSet, basename='order-items')

# Combinar URLs
urlpatterns = router.urls + orders_router.urls
