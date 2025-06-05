# Painel Administrativo ADR Token

Este é o painel administrativo para gerenciar e monitorar as atividades do ADR Token.

## Configuração

### 1. Configuração do Banco de Dados

Para que o painel administrativo funcione corretamente, é necessário configurar o banco de dados Supabase com as tabelas e funções necessárias:

1. Acesse o painel do Supabase
2. Vá para a seção SQL Editor
3. Copie e cole o conteúdo do arquivo `scripts/setup_prize_stock.sql`
4. Execute o script

### 2. Variáveis de Ambiente

Certifique-se de que as seguintes variáveis de ambiente estão configuradas:

```
SUPABASE_URL=sua_url_do_supabase
SUPABASE_KEY=sua_chave_service_role
```

> ⚠️ Importante: Use a chave `service_role` e não a `anon` key para operações administrativas.

## Acesso ao Painel

O acesso ao painel administrativo é protegido por senha. A senha padrão é `admin123`, mas recomendamos alterá-la para um ambiente de produção.

Para alterar a senha, modifique a constante `correctPassword` no arquivo `src/app/admin/page.tsx`.

### Recursos do Painel Administrativo

1. **Compras**: Visualização de todas as transações realizadas no sistema
2. **Estoque**: Monitoramento do estoque de prêmios físicos
3. **Estatísticas**: Dados sobre usuários, volumes de transações e distribuição de prêmios

### Configuração Inicial do Banco de Dados

Ao acessar o painel pela primeira vez, clique no botão "Setup Database" para inicializar a tabela de estoque se ela ainda não existir.

## Personalização

### Traduções

As strings do painel administrativo estão preparadas para tradução. Para adicionar traduções:

1. Adicione as chaves do painel administrativo no seu arquivo de traduções:

```json
{
  "admin": {
    "title": "Painel Administrativo",
    "description": "Acesse os controles administrativos do ADR Token",
    "login": "Login",
    "password": "Senha de Administrador",
    "loginButton": "Entrar",
    "dashboard": "Painel de Controle",
    "welcomeMessage": "Monitore e gerencie sua aplicação",
    "setupDatabase": "Configurar Banco de Dados",
    "settingUp": "Configurando...",
    "logout": "Sair",
    "purchases": "Compras",
    "stock": "Estoque",
    "statistics": "Estatísticas",
    "loading": "Carregando dados...",
    "retry": "Tentar novamente",
    "recentPurchases": "Compras Recentes",
    "wallet": "Carteira",
    "prize": "Prêmio",
    "amount": "Quantidade",
    "status": "Status",
    "date": "Data",
    "noPurchases": "Nenhuma compra encontrada",
    "prizeStock": "Estoque de Prêmios",
    "currentStock": "Estoque Atual",
    "sold": "vendido",
    "noStock": "Não há dados de estoque disponíveis",
    "setupDatabaseToViewStock": "Configure o banco de dados para visualizar o estoque",
    "totalPurchases": "Total de Compras",
    "totalValue": "Valor Total",
    "uniqueUsers": "Usuários Únicos",
    "prizeDistribution": "Distribuição de Prêmios",
    "purchasesCount": "compras",
    "noPurchasesForStats": "Não há dados de compras disponíveis para estatísticas"
  }
}
```

## Segurança

Este painel usa uma autenticação básica baseada em localStorage e senha no lado do cliente. Para ambientes de produção, recomendamos:

1. Implementar autenticação baseada em JWT com o Supabase Auth
2. Configurar Row Level Security (RLS) adequadamente nas tabelas do Supabase
3. Usar NextAuth.js ou similar para gerenciar a autenticação de administradores
4. Mover a senha para variáveis de ambiente ao invés de codificá-la diretamente 