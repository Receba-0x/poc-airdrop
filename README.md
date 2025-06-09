# ADR Token - Sistema de Gestão de Estoque

Este repositório contém o código para o sistema de gestão de estoque de prêmios físicos do projeto ADR Token.

## Funcionalidades Implementadas

### Gestão de Estoque para Prêmios Físicos

- **Verificação de Estoque**: O sistema verifica automaticamente se há estoque disponível antes de processar o resgate de prêmios físicos.
- **Atualização Automática**: O estoque é decrementado automaticamente quando um usuário resgata um prêmio físico.
- **Painel Administrativo**: Interface para os administradores gerenciarem o estoque dos prêmios físicos.

### Funções de Banco de Dados

- Tabela `prize_stock` para armazenar informações de estoque
- Funções SQL para incrementar, decrementar e resetar o estoque
- Sistema seguro de atualização de estoque através de RLS (Row Level Security)

### API REST

- `/api/admin/update-stock`: Endpoint para visualizar e atualizar o estoque
- `/api/admin/initialize-stock`: Endpoint para inicializar a tabela de estoque
- Validação de estoque integrada ao endpoint de processamento de compras (`/api/save-purchase`)

## Configuração

1. Configure as variáveis de ambiente:
   ```
   SUPABASE_URL=https://your-supabase-project.supabase.co
   SUPABASE_KEY=your-supabase-key
   ADMIN_SECRET=admin-secret-key-for-api
   NEXT_PUBLIC_ADMIN_SECRET=admin123
   ```

2. Execute o script SQL `scripts/setup_prize_stock.sql` no seu banco de dados Supabase para configurar a tabela e funções.

3. Inicialize o estoque acessando o painel administrativo e usando a função "Inicializar Estoque".

## Uso do Painel Administrativo

1. Acesse `/admin/login` e entre com a senha definida em `NEXT_PUBLIC_ADMIN_SECRET`.
2. Na aba "Estoque", você poderá:
   - Visualizar o estoque atual de todos os prêmios físicos
   - Incrementar ou decrementar o estoque manualmente
   - Resetar o estoque para o valor inicial
   - Inicializar a tabela de estoque caso seja necessário

## Prêmios Físicos

Os seguintes prêmios são considerados físicos e têm seu estoque gerenciado:

- ID 5: Team Jersey (90 unidades)
- ID 6: Official Ball (40 unidades)
- ID 7: Soccer Cleats (30 unidades)
- ID 8: MacBook M3 (1 unidades)
- ID 9: iPhone 16 Pro Max (2 unidades)
- ID 10: Golden Ticket (10 unidades)

## Desenvolvimento

Para executar o projeto localmente:

```bash
npm install
npm run dev
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources :

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Shipping Address Feature

### Overview
The application now includes a shipping address feature that allows users to claim physical items they've won. When a user wins a non-cryptocurrency prize, they can click the "Claim" button on the transaction history page to provide their shipping information.

### Setup
To set up the shipping address functionality:

1. Execute the SQL script in `scripts/setup_shipping_addresses.sql` in your Supabase project's SQL Editor. This script:
   - Creates the `shipping_addresses` table to store shipping information
   - Adds `claimed` and `claimed_at` columns to the `purchases` table
   - Sets up Row Level Security (RLS) policies for the shipping_addresses table
   - Configures triggers for timestamp updates

2. Make sure your environment variables include the Supabase configuration:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Features
- Claim button appears only for physical (non-SOL) prizes that haven't been claimed yet
- Shipping form includes all necessary fields for delivery
- Addresses are stored securely in Supabase with appropriate access controls
- Transaction status updates to "Claimed" after successful submission
