"""
Integração com a API ViaCEP para buscar endereços por CEP
https://viacep.com.br
"""

import requests
from django.core.exceptions import ValidationError


class ViaCEPError(Exception):
    """Erro na integração com ViaCEP"""
    pass


def lookup_cep(cep: str) -> dict:
    """
    Busca informações de endereço usando um CEP
    
    Args:
        cep: String com 8 dígitos (com ou sem formatação)
        
    Returns:
        {
            "street": "Avenida Paulista",
            "number": "",
            "neighborhood": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "zip_code": "01310100"
        }
        
    Raises:
        ValidationError: CEP inválido ou não encontrado
        ViaCEPError: Erro na chamada da API
    """
    
    # Validar CEP
    cep_digits = ''.join(c for c in cep if c.isdigit())
    
    if len(cep_digits) != 8:
        raise ValidationError("CEP deve conter 8 dígitos")
    
    # Fazer request para ViaCEP
    try:
        url = f"https://viacep.com.br/ws/{cep_digits}/json/"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        
        # Verificar se CEP foi encontrado
        if data.get('erro'):
            raise ValidationError("CEP não encontrado")
        
        # Retornar dados formatados
        return {
            'street': data.get('logradouro', ''),
            'number': '',  # ViaCEP não fornece número
            'neighborhood': data.get('bairro', ''),
            'city': data.get('localidade', ''),
            'state': data.get('uf', ''),
            'zip_code': cep_digits
        }
        
    except requests.Timeout:
        raise ViaCEPError("Timeout ao conectar com ViaCEP")
    except requests.RequestException as e:
        raise ViaCEPError(f"Erro ao chamar ViaCEP: {str(e)}")
    except Exception as e:
        raise ViaCEPError(f"Erro inesperado: {str(e)}")
