"""
Admin views para gerenciamento de produtos
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from orders.models import Product
from orders.serializers import ProductSerializer


def is_admin(request):
    """Verificar se usuário é admin"""
    return request.user and request.user.is_staff and request.user.is_authenticated


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_create_product(request):
    """
    POST /api/admin/products/
    
    Endpoint para admin criar novo produto.
    Apenas admin pode acessar.
    
    Request Body:
    {
        "name": "Pão Francês",
        "description": "Pão fresco",
        "price": "0.50",
        "is_active": true
    }
    
    Response:
    {
        "id": 1,
        "name": "Pão Francês",
        "description": "Pão fresco",
        "price": "0.50",
        "is_active": true,
        "created_at": "2024-01-15T11:00:00Z"
    }
    """
    try:
        # Validar permissão de admin
        if not is_admin(request):
            return Response(
                {'detail': 'Apenas administradores podem criar produtos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Serializar e validar dados
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response(
            {'detail': f'Erro ao criar produto: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_product_detail(request, product_id):
    """
    GET    /api/admin/products/{id}/  → Detalha produto
    PATCH  /api/admin/products/{id}/  → Atualiza produto
    DELETE /api/admin/products/{id}/  → Deleta produto
    
    Apenas admin pode acessar.
    """
    try:
        # Validar permissão de admin
        if not is_admin(request):
            return Response(
                {'detail': 'Apenas administradores podem acessar este recurso'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Buscar produto
        product = get_object_or_404(Product, pk=product_id)
        
        if request.method == 'GET':
            # Retornar detalhe
            serializer = ProductSerializer(product)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            # Atualizar produto
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            # Deletar produto
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
    
    except Product.DoesNotExist:
        return Response(
            {'detail': 'Produto não encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'detail': f'Erro ao processar produto: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_products_list(request):
    """
    GET /api/admin/products/
    POST /api/admin/products/
    
    GET: Listar todos os produtos (incluindo inativos)
    POST: Criar novo produto
    
    Apenas admin pode acessar.
    
    Parâmetros opcionais:
    - ?is_active=true    → Apenas produtos ativos
    - ?is_active=false   → Apenas produtos inativos
    - ?search=termo      → Buscar por nome ou descrição
    - ?page=2            → Paginação
    - ?page_size=50      → Tamanho da página
    
    Response:
    {
        "count": 15,
        "next": "...",
        "previous": "...",
        "results": [
            {
                "id": 1,
                "name": "Pão Francês",
                ...
            }
        ]
    }
    """
    try:
        # Validar permissão de admin
        if not is_admin(request):
            return Response(
                {'detail': 'Apenas administradores podem acessar este endpoint'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Tratar POST (criar novo produto)
        if request.method == 'POST':
            serializer = ProductSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Tratar GET (listar produtos)
        # Começar com todos os produtos (admin vê até inativos)
        products = Product.objects.all()
        
        # Filtrar por status ativo/inativo
        is_active_filter = request.query_params.get('is_active')
        if is_active_filter is not None:
            is_active_filter = is_active_filter.lower() == 'true'
            products = products.filter(is_active=is_active_filter)
        
        # Filtrar por busca (nome ou descrição)
        search = request.query_params.get('search')
        if search:
            from django.db.models import Q
            products = products.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Aplicar paginação
        from rest_framework.pagination import PageNumberPagination
        paginator = PageNumberPagination()
        paginator.page_size = int(request.query_params.get('page_size', 20))
        
        page = paginator.paginate_queryset(products, request)
        if page is not None:
            serializer = ProductSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        
        serializer = ProductSerializer(products, many=True)
        return Response({
            'count': len(products),
            'next': None,
            'previous': None,
            'results': serializer.data
        })
    
    except Exception as e:
        return Response(
            {'detail': f'Erro ao listar produtos: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
