from django.db import models
from django.contrib.auth.models import User


class UserRole(models.Model):
    """
    Modelo para distinguir roles de usuários (Owner vs Manager)
    
    Superuser: criado em terminal (não tem UserRole)
    Owner: criado por Superuser, aprova clientes
    Manager: criado por Owner, aprova clientes sob delegação
    """
    
    ROLE_CHOICES = [
        ('owner', 'Dono do Negócio'),
        ('manager', 'Gerenciador'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='role')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_users',
        help_text="Superuser ou Owner que criou este usuário"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"
    
    def is_owner(self):
        return self.role == 'owner'
    
    def is_manager(self):
        return self.role == 'manager'
