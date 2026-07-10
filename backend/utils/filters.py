"""
Filtros customizados para busca e filtragem
"""
from rest_framework import filters
from django_filters.rest_framework import FilterSet, CharFilter, BooleanFilter, DateTimeFilter
from orders.models import Order, OrderItem
from customers.models import Customer


class CustomerFilterSet(FilterSet):
    """
    Filtros para Customer:
    - nickname: busca por nome/apelido
    - customer_type: filtra por tipo (PF/PJ)
    - status: filtra por status de aprovação (PENDENTE/APROVADO/BLOQUEADO)
    """
    nickname = CharFilter(field_name='nickname', lookup_expr='icontains')
    customer_type = CharFilter(field_name='customer_type', lookup_expr='exact')
    status = CharFilter(field_name='status', lookup_expr='exact')

    class Meta:
        model = Customer
        fields = ['customer_type', 'status']


class OrderFilterSet(FilterSet):
    """
    Filtros para Order:
    - status: filtra por status
    - payment_method: filtra por forma de pagamento
    - customer: filtra por cliente
    - delivery_date: filtra por data de entrega
    """
    status = CharFilter(field_name='status', lookup_expr='exact')
    payment_method = CharFilter(field_name='payment_method', lookup_expr='exact')
    customer = CharFilter(field_name='customer', lookup_expr='exact')

    class Meta:
        model = Order
        fields = ['status', 'payment_method', 'customer']


class OrderItemFilterSet(FilterSet):
    """
    Filtros para OrderItem:
    - order: filtra por pedido
    - product: filtra por produto
    """
    order = CharFilter(field_name='order', lookup_expr='exact')
    product = CharFilter(field_name='product', lookup_expr='exact')

    class Meta:
        model = OrderItem
        fields = ['order', 'product']
