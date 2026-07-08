#!/usr/bin/env python3
"""
Script de teste para todos os endpoints da API de clientes
Testa: registro, login, aprovação, ViaCEP, perfil autenticado
"""

import urllib.request
import json
import sys
from urllib.error import HTTPError

BASE_URL = "http://localhost:8000/api"

def make_request(method, endpoint, data=None, token=None):
    """Fazer requisição HTTP"""
    url = f"{BASE_URL}{endpoint}"
    
    if data:
        data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Content-Type', 'application/json')
    
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())
            return response.status, result
    except HTTPError as e:
        try:
            error = json.loads(e.read().decode())
            return e.code, error
        except:
            return e.code, {'detail': str(e)}

def test_endpoint(name, method, endpoint, data=None, token=None, expected_status=200):
    """Testar um endpoint"""
    print(f"\n📍 {name}")
    print(f"   {method} {endpoint}")
    
    status, response = make_request(method, endpoint, data, token)
    
    if status == expected_status:
        print(f"   ✅ Status {status}")
        return True, response
    else:
        print(f"   ❌ Status {status} (esperado {expected_status})")
        print(f"      Erro: {response.get('detail', response)}")
        return False, response

def main():
    print("=" * 60)
    print("TESTE DE ENDPOINTS - PHASE 5 AUTHENTICATION")
    print("=" * 60)
    
    results = []
    
    # Test 1: ViaCEP Lookup
    print("\n--- 1️⃣  VIACEP LOOKUP (Público) ---")
    success, resp = test_endpoint(
        "Buscar CEP",
        "POST",
        "/customers/lookup-cep/",
        {"zip_code": "01310100"},
        expected_status=200
    )
    results.append(("ViaCEP", success))
    
    if success:
        print(f"      Rua: {resp.get('street')}")
        print(f"      Bairro: {resp.get('neighborhood')}")
        print(f"      Cidade: {resp.get('city')}")
    
    # Test 2: Login (cliente aprovado)
    print("\n--- 2️⃣  LOGIN (Cliente Aprovado) ---")
    success, resp = test_endpoint(
        "Login com credenciais válidas",
        "POST",
        "/customers/login/",
        {
            "nickname": "Padaria Test Login",
            "password": "senhatest123"
        },
        expected_status=200
    )
    results.append(("Login", success))
    
    access_token = resp.get('access_token') if success else None
    if success:
        print(f"      Token obtido: {access_token[:30]}...")
        print(f"      Customer: {resp.get('customer', {}).get('nickname')}")
    
    # Test 3: Get current user
    if access_token:
        print("\n--- 3️⃣  PERFIL AUTENTICADO ---")
        success, resp = test_endpoint(
            "Obter perfil autenticado",
            "GET",
            "/customers/me/",
            token=access_token,
            expected_status=200
        )
        results.append(("Perfil Autenticado", success))
        
        if success:
            print(f"      Apelido: {resp.get('nickname')}")
            print(f"      Status: {resp.get('status')}")
            print(f"      Tipo: {resp.get('customer_type')}")
    
    # Test 4: Login pendente (deve falhar com 403)
    print("\n--- 4️⃣  LOGIN (Cliente Pendente - deve falhar) ---")
    success, resp = test_endpoint(
        "Login cliente PENDENTE",
        "POST",
        "/customers/login/",
        {
            "nickname": "Padaria Pendente",
            "password": "senha123"
        },
        expected_status=403
    )
    results.append(("Login Pendente (esperado falhar)", success))
    
    if success:
        print(f"      ✅ Corretamente bloqueado: {resp.get('detail')}")
    
    # Print Summary
    print("\n" + "=" * 60)
    print("RESUMO DOS TESTES")
    print("=" * 60)
    
    passed = sum(1 for _, s in results if s)
    total = len(results)
    
    for test_name, success in results:
        status_icon = "✅" if success else "❌"
        print(f"{status_icon} {test_name}")
    
    print(f"\n{passed}/{total} testes passaram")
    
    if passed == total:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} teste(s) falharam")
        return 1

if __name__ == '__main__':
    sys.exit(main())
