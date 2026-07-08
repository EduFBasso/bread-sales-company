"""
URLs para Ledger (Transactions)
"""
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import TransactionViewSet

app_name = 'ledger'

# Router automático para transações
router = DefaultRouter()
router.register(r'', TransactionViewSet, basename='transaction')

urlpatterns = router.urls
