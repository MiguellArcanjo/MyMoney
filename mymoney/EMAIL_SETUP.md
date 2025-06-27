# Configuração de Email - MyMoney

## Variáveis de Ambiente Necessárias

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mymoney"

# JWT Secret
JWT_SECRET="seu_jwt_secret_muito_seguro_aqui"

# Email Configuration (Gmail)
EMAIL_USER="seu_email@gmail.com"
EMAIL_PASS="sua_senha_de_app_do_gmail"

# Base URL (para links de verificação)
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## Configuração do Gmail

### 1. Ativar Autenticação de 2 Fatores
- Vá para sua conta Google
- Ative a autenticação de 2 fatores

### 2. Gerar Senha de App
- Vá para "Segurança" > "Senhas de app"
- Gere uma nova senha de app para "Email"
- Use essa senha no campo `EMAIL_PASS`

### 3. Configurações Alternativas

#### Para Outlook/Hotmail:
```env
EMAIL_USER="seu_email@outlook.com"
EMAIL_PASS="sua_senha_de_app"
```

#### Para Yahoo:
```env
EMAIL_USER="seu_email@yahoo.com"
EMAIL_PASS="sua_senha_de_app"
```

## Funcionalidades Implementadas

### ✅ Verificação de Email
- Email enviado automaticamente após registro
- Link de verificação válido por 24 horas
- Página dedicada para verificação
- Reenvio de email de verificação

### ✅ Validação no Login
- Usuários não podem fazer login sem verificar email
- Mensagem clara sobre necessidade de verificação
- Opção de reenvio de verificação

### ✅ Segurança
- Tokens únicos e seguros
- Expiração automática
- Validação de tokens no backend

## Como Funciona

1. **Registro**: Usuário se cadastra → Email de verificação enviado
2. **Verificação**: Usuário clica no link → Email marcado como verificado
3. **Login**: Usuário pode fazer login normalmente
4. **Reenvio**: Se necessário, pode solicitar novo email de verificação

## Páginas Criadas

- `/verificar-email` - Página de verificação de email
- `/api/auth/verificar-email` - API para verificar email
- `/api/auth/reenviar-verificacao` - API para reenviar verificação

## Templates de Email

Os emails incluem:
- Design responsivo e profissional
- Logo da aplicação
- Botões de ação claros
- Links alternativos
- Informações de segurança 