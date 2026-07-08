# 🥖 Regras de Negócio - bread-sales-company

Este documento mapeia o funcionamento real da panificação B2B e como as regras foram soldadas no código do Back-end.

## 👥 1. Entidade Cliente (Customer)
* **Identificação Prática:** Os clientes (supermercados e lanchonetes) são organizados pelo campo `nickname` (Apelido/Nome Fantasia), facilitando a busca rápida pelo comerciante no notebook.
* **Flexibilidade Cadastral:** O sistema suporta Pessoa Física (`PF`) e Pessoa Jurídica (`PJ`). Campos como `company_name` e `cnpj_cpf` são opcionais para se adaptar ao nível de formalização do cliente.
* **Segurança Monetária:** Todos os saldos e limites utilizam precisão absoluta de duas casas decimais (`DecimalField`).

## 📦 2. Catálogo de Produtos e Pedidos
* **Unidade de Medida:** Os produtos representam *pacotes fechados de fábrica* (ex: sacos com 4 pães de hambúrguer) e não pães avulsos, refletindo a distribuição em atacado.
* **Snapshot de Preço:** O preço unitário do produto é copiado para o `OrderItem` no momento em que o item é salvo (`unit_price`). Se o preço do catálogo mudar futuramente, os pedidos passados permanecem intactos.
* **Automação Matemática:** O subtotal de cada item (`unit_price * quantity`) e o valor total do pedido (`total_value`) são calculados diretamente pelas funções internas do Django no momento da gravação.

## 🚚 3. Logística Inteligente de Endereço
* **Preenchimento por CEP:** A interface utiliza o CEP como gatilho para preencher os dados de endereço padrão no Brasil (Rua, Bairro, Cidade, Estado).
* **Independência de Entrega:** O pedido (`Order`) possui campos próprios de entrega (`shipping_*`). Por padrão, se forem deixados em branco no painel, o sistema clona automaticamente o endereço do cadastro do cliente. Caso o cliente queira receber em uma filial ou galpão diferente naquele dia, os campos podem ser editados individualmente.

## 💰 4. O Fluxo de Saldo (Livro Caixa)
* **Imutabilidade Financeira:** O saldo do cliente nunca é um número estático editável. Ele é o resultado dinâmico da soma histórica da tabela `Transaction` (Créditos/Depósitos menos Débitos/Vendas).
