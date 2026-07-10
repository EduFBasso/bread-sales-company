"""
URLs para Customer

IMPORTANTE: O CustomerViewSet é registrado no core/urls.py via DefaultRouter.
Este arquivo mantém apenas padrão, mas as rotas CRUD são gerenciadas centralmente.
"""
from django.urls import path

app_name = 'customers'

# Rotas customizadas específicas da app customers (se necessário no futuro)
urlpatterns = [
    # Todas as rotas CRUD são gerenciadas em core/urls.py
]
