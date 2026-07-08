"""
Validadores para CPF e CNPJ
"""
from django.core.exceptions import ValidationError


def validate_cpf(cpf: str) -> None:
    """
    Valida CPF conforme algoritmo oficial.
    
    Args:
        cpf: String com 11 dígitos (pode incluir pontos/travessão)
        
    Raises:
        ValidationError: Se CPF for inválido
        
    Examples:
        validate_cpf('11144477735')  # ✅ Válido
        validate_cpf('12345678901')  # ❌ Inválido
    """
    # Remover caracteres especiais
    cpf = cpf.replace('.', '').replace('-', '').replace(' ', '')
    
    # Verificar se tem 11 dígitos
    if not cpf.isdigit() or len(cpf) != 11:
        raise ValidationError('CPF deve conter 11 dígitos')
    
    # Verificar se todos os dígitos são iguais (CPF inválido)
    if cpf == cpf[0] * 11:
        raise ValidationError('CPF inválido: todos os dígitos são iguais')
    
    # Validar primeiro dígito verificador
    sum1 = sum(int(cpf[i]) * (10 - i) for i in range(9))
    digit1 = 11 - (sum1 % 11)
    digit1 = 0 if digit1 >= 10 else digit1
    
    if int(cpf[9]) != digit1:
        raise ValidationError('CPF inválido: primeiro dígito verificador incorreto')
    
    # Validar segundo dígito verificador
    sum2 = sum(int(cpf[i]) * (11 - i) for i in range(10))
    digit2 = 11 - (sum2 % 11)
    digit2 = 0 if digit2 >= 10 else digit2
    
    if int(cpf[10]) != digit2:
        raise ValidationError('CPF inválido: segundo dígito verificador incorreto')


def validate_cnpj(cnpj: str) -> None:
    """
    Valida CNPJ conforme algoritmo oficial.
    
    Args:
        cnpj: String com 14 dígitos (pode incluir pontos/travessão/barra)
        
    Raises:
        ValidationError: Se CNPJ for inválido
        
    Examples:
        validate_cnpj('11222333000181')  # ✅ Válido
        validate_cnpj('12345678901234')  # ❌ Inválido
    """
    # Remover caracteres especiais
    cnpj = cnpj.replace('.', '').replace('-', '').replace('/', '').replace(' ', '')
    
    # Verificar se tem 14 dígitos
    if not cnpj.isdigit() or len(cnpj) != 14:
        raise ValidationError('CNPJ deve conter 14 dígitos')
    
    # Verificar se todos os dígitos são iguais (CNPJ inválido)
    if cnpj == cnpj[0] * 14:
        raise ValidationError('CNPJ inválido: todos os dígitos são iguais')
    
    # Sequência de multiplicação para CNPJ
    sequence1 = "5432165432165"
    sequence2 = "6543216543210"
    
    # Validar primeiro dígito verificador
    sum1 = sum(int(cnpj[i]) * int(sequence1[i]) for i in range(12))
    digit1 = 11 - (sum1 % 11)
    digit1 = 0 if digit1 >= 10 else digit1
    
    if int(cnpj[12]) != digit1:
        raise ValidationError('CNPJ inválido: primeiro dígito verificador incorreto')
    
    # Validar segundo dígito verificador
    sum2 = sum(int(cnpj[i]) * int(sequence2[i]) for i in range(13))
    digit2 = 11 - (sum2 % 11)
    digit2 = 0 if digit2 >= 10 else digit2
    
    if int(cnpj[13]) != digit2:
        raise ValidationError('CNPJ inválido: segundo dígito verificador incorreto')


def format_cpf(cpf: str) -> str:
    """
    Formata CPF para o padrão: XXX.XXX.XXX-XX
    
    Args:
        cpf: String com 11 dígitos
        
    Returns:
        CPF formatado
        
    Example:
        format_cpf('11144477735')  # '111.444.777-35'
    """
    cpf = cpf.replace('.', '').replace('-', '')
    return f'{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}'


def format_cnpj(cnpj: str) -> str:
    """
    Formata CNPJ para o padrão: XX.XXX.XXX/XXXX-XX
    
    Args:
        cnpj: String com 14 dígitos
        
    Returns:
        CNPJ formatado
        
    Example:
        format_cnpj('34028316000152')  # '34.028.316/0001-52'
    """
    cnpj = cnpj.replace('.', '').replace('-', '').replace('/', '')
    return f'{cnpj[:2]}.{cnpj[2:5]}.{cnpj[5:8]}/{cnpj[8:12]}-{cnpj[12:]}'
