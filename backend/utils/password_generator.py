"""
Gerador de Senhas Aleatórias para Clientes
Cria senhas que atendem aos critérios de validação
"""

import random
import string
from typing import Tuple


def generate_random_password(length: int = 8) -> str:
    """
    Gera uma senha aleatória com requisitos de segurança.
    
    Requisitos:
    - Mínimo 8 caracteres (customizável)
    - Pelo menos 1 letra maiúscula
    - Pelo menos 1 letra minúscula
    - Pelo menos 1 número
    - Sem caracteres especiais (apenas letras + números para simplicidade)
    
    Args:
        length: Tamanho da senha (padrão 8, mínimo 6)
    
    Returns:
        str: Senha aleatória em texto plano (letras maiúsculas, minúsculas, números)
    
    Exemplos:
        >>> pwd = generate_random_password()
        >>> len(pwd) >= 8
        True
        >>> any(c.isupper() for c in pwd)
        True
        >>> any(c.islower() for c in pwd)
        True
        >>> any(c.isdigit() for c in pwd)
        True
    """
    if length < 6:
        length = 6
    
    # Garantir pelo menos 1 de cada tipo
    characters = [
        random.choice(string.ascii_uppercase),      # 1 maiúscula obrigatória
        random.choice(string.ascii_lowercase),      # 1 minúscula obrigatória
        random.choice(string.digits),                # 1 número obrigatório
    ]
    
    # Preencher o resto aleatoriamente
    all_chars = string.ascii_uppercase + string.ascii_lowercase + string.digits
    characters.extend(random.choice(all_chars) for _ in range(length - 3))
    
    # Embaralhar para não seguir padrão previsível
    random.shuffle(characters)
    
    return ''.join(characters)


def is_valid_password(password: str) -> Tuple[bool, str]:
    """
    Valida se a senha atende aos critérios mínimos.
    
    Args:
        password: Senha a validar
    
    Returns:
        (bool, mensagem): (válido, mensagem de erro ou sucesso)
    """
    if not password:
        return False, "Senha não pode estar vazia"
    
    if len(password) < 6:
        return False, "Senha deve ter no mínimo 6 caracteres"
    
    if not any(c.isupper() for c in password):
        return False, "Senha deve conter pelo menos 1 letra maiúscula"
    
    if not any(c.islower() for c in password):
        return False, "Senha deve conter pelo menos 1 letra minúscula"
    
    if not any(c.isdigit() for c in password):
        return False, "Senha deve conter pelo menos 1 número"
    
    return True, "Senha válida"
