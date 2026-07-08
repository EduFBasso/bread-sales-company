"""
URL configuration for bread-sales-company API

Estrutura de rotas:
- /api/customers/                  → ViewSet de clientes
- /api/orders/                      → ViewSet de pedidos
- /api/orders/{id}/items/          → ViewSet aninhado de itens
- /api/products/                    → ViewSet de produtos (catálogo)
- /api/transactions/                → ViewSet de transações (livro caixa)
- /admin/                           → Django Admin
- /api/docs/                        → Swagger UI
- /api/schema/                      → OpenAPI Schema
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# Import ViewSets
from customers.views import CustomerViewSet
from orders.views import OrderViewSet, OrderItemViewSet, ProductViewSet
from ledger.views import TransactionViewSet

# Criar router principal
router = DefaultRouter(trailing_slash=False)

# Registrar ViewSets principais
router.register(r'customers', CustomerViewSet, basename='customer')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'transactions', TransactionViewSet, basename='transaction')

# Nota: OrderItemViewSet é registrado como rota aninhada em orders/urls.py


@api_view(['GET'])
def api_root(request):
    """
    Documentação da API REST
    """
    return Response({
        'message': 'Bem-vindo à API bread-sales-company',
        'version': '1.0',
        'endpoints': {
            'customers': 'http://localhost:8000/api/customers/',
            'orders': 'http://localhost:8000/api/orders/',
            'products': 'http://localhost:8000/api/products/',
            'transactions': 'http://localhost:8000/api/transactions/',
            'admin': 'http://localhost:8000/admin/',
            'swagger': 'http://localhost:8000/api/docs/',
            'schema': 'http://localhost:8000/api/schema/',
        },
        'status': 'operational'
    })


urlpatterns = [
    # API Root
    path('', api_root, name='api-root'),
    
    # API Routes
    path('api/', include(router.urls)),
    path('api/', include('customers.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('ledger.urls')),
    
    # Swagger & OpenAPI Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Admin
    path('admin/', admin.site.urls),
]
