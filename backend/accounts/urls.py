from django.urls import path
from .views import admin_login, admin_stats

urlpatterns = [
    path('login/', admin_login, name='admin-login'),
    path('stats/', admin_stats, name='admin-stats'),
]
