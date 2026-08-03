# VitrineFlow

Plataforma multi-empresa (multi-tenant) de vitrines e vendas online, construída com Next.js 14
(App Router), Tailwind CSS, Prisma (Postgres) e NextAuth (Credentials).

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL (ex: Prisma Postgres / Neon / Supabase / Railway)
- NextAuth.js (login por e-mail e senha)

## Estrutura de acesso

- **super_admin**: gerencia todas as empresas em `/admin` (criar empresa, bloquear/ativar,
  mudar plano, ver faturamento).
- **company_admin**: gerencia a própria empresa em `/painel` (produtos, pedidos, links,
  configurações de pagamento/entrega).
- **Público**: vitrine da empresa em `/loja/[slug]`. Se o plano for `vendas`, a vitrine tem
  carrinho e checkout; se for `vitrine`, os produtos direcionam para o WhatsApp.
- Links encurtados/personalizados redirecionam via `/l/[slug]` e contam cliques.

## Passo a passo para rodar localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de variáveis de ambiente e preencha com sua string de conexão Postgres:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: string de conexão do seu banco Postgres (Prisma Postgres, Neon, Supabase, etc).
   - `NEXTAUTH_SECRET`: gere um valor aleatório, por exemplo com `openssl rand -base64 32`.
   - `NEXTAUTH_URL`: `http://localhost:3000` em desenvolvimento.

3. Rode as migrations do Prisma (isso cria as tabelas no banco):

   ```bash
   npx prisma migrate dev --name init
   ```

4. (Opcional, mas recomendado) Popule o banco com dados de exemplo:

   ```bash
   npm run seed
   ```

   Isso cria:
   - Super admin: `admin@vitrineflow.com` / `admin123`
   - Admin de uma empresa de exemplo: `loja@vitrineflow.com` / `empresa123`
   - Uma empresa "Loja Exemplo" (slug `loja-exemplo`) com 2 produtos.

5. Rode o projeto:

   ```bash
   npm run dev
   ```

6. Acesse:
   - `http://localhost:3000` — landing / login
   - `http://localhost:3000/admin` — painel super admin
   - `http://localhost:3000/painel` — painel da empresa
   - `http://localhost:3000/loja/loja-exemplo` — vitrine pública de exemplo

## Notas de implementação

- Multi-tenancy é feito por `slug` (rota `/loja/[slug]`), não por subdomínio — mais simples de
  rodar em qualquer ambiente sem configuração de DNS. Se quiser subdomínios reais
  (`empresa.vitrineflow.com`), dá para evoluir com um `middleware.ts` que reescreve o host para
  `/loja/[slug]`.
- Senhas são armazenadas com hash `bcryptjs`.
- Autorização por papel (`super_admin` / `company_admin`) é reforçada tanto no `middleware.ts`
  (proteção de rotas `/admin` e `/painel`) quanto em cada rota de API (dupla checagem).
- Pedidos (`Order`) são criados publicamente pelo checkout da vitrine (sem login), e o
  faturamento da empresa é incrementado automaticamente a cada pedido.
- `freteRules` é um campo `Json` livre — hoje a página de configurações usa o formato
  `{ tipo: "fixo", valor: number }`, mas o schema aceita qualquer estrutura futura (por CEP,
  por faixa de peso etc.).

## Próximos passos sugeridos

- Upload de imagens (hoje o campo `imageUrl`/`logo` é uma URL simples — dá pra integrar com
  UploadThing, S3 ou Cloudinary).
- Notificação de novos pedidos via WhatsApp/e-mail.
- Paginação nas listagens de produtos/pedidos/empresas.
- Testes automatizados (Vitest/Playwright).
