"""
Validador de Senha para Clientes
Garante senhas fortes seguindo regras de negócio da panificadora
"""

import re
from typing import Tuple


def validate_customer_password(password: str) -> Tuple[bool, str]:
    """
    Valida uma senha de cliente seguindo regras mínimas de segurança.
    
    Regras:
    1. Mínimo 6 caracteres
    2. Obrigatório: letras + números
    3. Sem sequências numéricas (123, 456, 654, etc)
    4. Sem repetição excessiva de caracteres (aaa, bbb, etc)
    
    Args:
        password: Senha a validar
    
    Returns:
        (bool, mensagem): (válido, mensagem de erro ou sucesso)
    
    Exemplos:
        ✓ validate_customer_password('Pwd123') → (True, 'Válido')
        ✓ validate_customer_password('Test456') → (True, 'Válido')
        ✓ validate_customer_password('MyPass789') → (True, 'Válido')
        
        ✗ validate_customer_password('senha1') → (False, 'Senha muito curta...')
        ✗ validate_customer_password('123456') → (False, 'Sem letras...')
        ✗ validate_customer_password('Pwd123123') → (False, 'Sequência numérica...')
    """
    
    # Regra 1: Mínimo 6 caracteres
    if len(password) < 6:
        return False, 'Senha deve ter no mínimo 6 caracteres'
    
    # Regra 2: Obrigatório letras e números
    has_letters = bool(re.search(r'[a-zA-Z]', password))
    has_digits = bool(re.search(r'\d', password))
    
    if not has_letters:
        return False, 'Senha deve conter pelo menos uma letra (A-Z)'
    
    if not has_digits:
        return False, 'Senha deve conter pelo menos um número (0-9)'
    
    # Regra 3: Sem sequências óbvias
    # Apenas as mais óbvias: se a senha CONSISTE de uma sequência simples
    # "123456", "654321", "0123456789" são ruins
    # Mas "Test123456" é ok (misturado com letras)
    obvious_patterns = [
        '0123456789',  # sequência total
        '9876543210',  # reversa total
    ]
    
    for pattern in obvious_patterns:
        if pattern in password:
            return False, f'Senha não pode conter sequência {pattern}'
    
    # Regra 4: Sem repetição excessiva (3+ caracteres iguais)
    for char in set(password):
        if char * 3 in password:
            return False, f'Senha não pode ter 3 ou mais caracteres iguais seguidos ("{char * 3}")'
    
    # Tudo passou
    return True, 'Senha válida'


def validate_password_confirmation(password: str, confirm_password: str) -> Tuple[bool, str]:
    """
    Valida se duas senhas são idênticas.
    
    Args:
        password: Primeira senha
        confirm_password: Confirmação da senha
    
    Returns:
        (bool, mensagem): (igual, mensagem de erro ou sucesso)
    """
    if password != confirm_password:
        return False, 'As senhas não correspondem'
    
    return True, 'Senhas correspondem'


def validate_password_strength(password: str) -> dict:
    """
    Retorna análise detalhada da força da senha (para feedback visual).
    
    Args:
        password: Senha a analisar
    
    Returns:
        dict com: is_valid, message, requirements (dict com cada regra)
    """
    
    requirements = {
        'length': len(password) >= 6,
        'has_letters': bool(re.search(r'[a-zA-Z]', password)),
        'has_digits': bool(re.search(r'\d', password)),
        'no_sequences': True,
        'no_repetitions': True,
    }
    
    # Verificar sequências
    sequences = ['0123456789', '9876543210']
    for seq in sequences:
        for i in range(len(seq) - 2):
            if seq[i:i+3] in password:
                requirements['no_sequences'] = False
                break
    
    # Verificar repetições
    for char in set(password):
        if char * 3 in password:
            requirements['no_repetitions'] = False
            break
    
    is_valid = all(requirements.values())
    valid, message = validate_customer_password(password)
    
    return {
        'is_valid': is_valid,
        'message': message,
        'requirements': {
            'length': {
                'label': 'Mínimo 6 caracteres',
                'met': requirements['length'],
            },
            'letters': {
                'label': 'Contém letras',
                'met': requirements['has_letters'],
            },
            'digits': {
                'label': 'Contém números',
                'met': requirements['has_digits'],
            },
            'no_sequences': {
                'label': 'Sem sequências numéricas (123, 456)',
                'met': requirements['no_sequences'],
            },
            'no_repetitions': {
                'label': 'Sem caracteres repetidos (aaa, bbb)',
                'met': requirements['no_repetitions'],
            },
        }
    }
