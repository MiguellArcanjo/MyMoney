# Organizze

Sistema completo de controle financeiro pessoal, desenvolvido em Next.js, com backend integrado via API RESTful e interface responsiva para desktop e mobile.

## **Funcionalidades Principais**

- **Dashboard**: Visão geral dos saldos, receitas, despesas e metas.
- **Contas**: Cadastro, edição, exclusão e visualização de contas bancárias, carteiras digitais, etc.
- **Lançamentos**: Registro de receitas, despesas, lançamentos parcelados, recorrentes e detalhamento por conta/categoria.
- **Categorias**: Gerenciamento de categorias de receitas e despesas.
- **Metas**: Criação e acompanhamento de objetivos financeiros.
- **Simulador Financeiro**: Projeção de saldo futuro com base em dados reais ou simulados.
- **Minha Conta**: Gerenciamento de dados do usuário, alteração de senha, salário, logout.
- **Autenticação**: Registro, login, recuperação e redefinição de senha, verificação e reenvio de e-mail.
- **Responsividade**: Layout adaptado para mobile e desktop, com menu lateral (hambúrguer) e botões de ação destacados.
- **API RESTful**: Endpoints para todas as entidades do sistema, com autenticação JWT.

---

## **Como rodar o projeto**

1. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

2. **Configure o banco de dados:**
   - Edite o arquivo `.env` com as variáveis de conexão do banco (exemplo: PostgreSQL).
   - Rode as migrations do Prisma:
     ```bash
     npx prisma migrate deploy
     ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. **Acesse:**
   - [http://localhost:3000](http://localhost:3000)

---

## **Principais Telas e Fluxos**

### **Dashboard**
- Visão geral dos saldos, receitas, despesas, metas e gráficos.

### **Contas**
- Listagem de contas cadastradas.
- Adicionar, editar e excluir contas.
- Visualizar detalhes de cada conta, incluindo lançamentos associados.

### **Lançamentos**
- Listagem de todos os lançamentos (receitas, despesas, parcelados, recorrentes).
- Filtros por conta, categoria, tipo, mês e ano.
- Adicionar, editar e excluir lançamentos.
- Visualização mobile em cards.

### **Categorias**
- Listagem, adição, edição e exclusão de categorias de receitas e despesas.

### **Metas**
- Cadastro de metas financeiras.
- Acompanhamento do progresso de cada meta.

### **Simulador Financeiro**
- Projeção de saldo futuro com base em saldo atual, receita, gasto médio e período.
- Gráfico de evolução e detalhamento mês a mês.

### **Minha Conta**
- Visualização e edição dos dados do usuário (nome, e-mail, salário).
- Alteração de senha.
- Logout.

### **Autenticação**
- Registro de novo usuário.
- Login.
- Recuperação e redefinição de senha.
- Verificação e reenvio de e-mail.

---

## **Layout e Responsividade**

- **Mobile:**  
  - Header com botão hambúrguer e título alinhados à esquerda.
  - Botão de ação destacado logo abaixo do header.
  - Menu lateral sobreposto com overlay escuro.
- **Desktop:**  
  - Menu lateral fixo à esquerda.
  - Conteúdo com espaçamento lateral para não ficar atrás do menu.
  - Botões de ação alinhados à direita do título.

---

## **Principais Endpoints da API**

### **Autenticação**
- `POST /api/auth/register` — Cadastro de usuário
- `POST /api/auth/login` — Login
- `POST /api/auth/esqueci-senha` — Solicitar recuperação de senha
- `POST /api/auth/redefinir-senha` — Redefinir senha
- `POST /api/auth/verificar-email` — Verificar e-mail
- `POST /api/auth/reenviar-verificacao` — Reenviar e-mail de verificação
- `GET /api/auth/me` — Dados do usuário autenticado

### **Usuário**
- `GET /api/user` — Dados do usuário logado
- `PATCH /api/user` — Atualizar dados do usuário

### **Contas**
- `GET /api/contas` — Listar contas
- `POST /api/contas` — Criar conta
- `PATCH /api/contas` — Editar conta
- `DELETE /api/contas/:id` — Excluir conta
- `GET /api/contas/:id` — Detalhes da conta

### **Categorias**
- `GET /api/categorias` — Listar categorias
- `POST /api/categorias` — Criar categoria
- `PATCH /api/categorias/:id` — Editar categoria
- `DELETE /api/categorias/:id` — Excluir categoria

### **Metas**
- `GET /api/metas` — Listar metas
- `POST /api/metas` — Criar meta
- `PATCH /api/metas/:id` — Editar meta
- `DELETE /api/metas/:id` — Excluir meta

### **Lançamentos**
- `GET /api/lancamentos` — Listar lançamentos (filtros por conta, categoria, tipo, mês, ano)
- `POST /api/lancamentos` — Criar lançamento
- `PATCH /api/lancamentos` — Editar lançamento
- `DELETE /api/lancamentos/:id` — Excluir lançamento

### **Parcelas**
- `GET /api/parcelas/:id` — Detalhes de uma parcela

### **Simulador**
- `GET /api/simulador/dados` — Buscar dados financeiros para simulação

---

## **Tecnologias Utilizadas**

- **Next.js** (React)
- **Prisma ORM**
- **PostgreSQL** (ou outro banco relacional)
- **JWT** para autenticação
- **CSS Modules** para estilização
- **Chart.js** para gráficos
- **API RESTful** (padrão REST)

---

## **Sugestão de Fluxo para Testes**

1. Cadastre um novo usuário.
2. Faça login.
3. Cadastre contas, categorias e lançamentos.
4. Crie metas financeiras.
5. Use o simulador para projeção de saldo.
6. Teste a responsividade no mobile e desktop.
7. Teste a recuperação e redefinição de senha.

---

