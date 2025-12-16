# ADR 0002: Fluxo de Autenticação e Provisionamento de Usuários

## Status
Aceito

## Contexto
Necessitamos de fluxos distintos para cadastro de **Managers** (que criam organizações) e **Leaders** (que entram via convite). O Supabase Auth lida com a identidade, mas precisamos automatizar a criação de registros em `public` (`profiles`, `organizations`) de forma atômica e segura.

## Decisão
Utilizaremos **Triggers do Banco de Dados** acoplados à tabela `auth.users` para orquestrar o provisionamento, baseando-se em metadados (`raw_user_meta_data`) enviados no momento do `signUp`.

### 1. Cadastro de Manager
*   **Input**: Email, Senha, `org_name` (metadata).
*   **Processo**:
    1.  `supabase.auth.signUp()` cria usuário em `auth.users`.
    2.  Trigger `on_auth_user_created` dispara.
    3.  Detecta `org_name`.
    4.  Cria nova linha em `organizations`.
    5.  Cria `profile` com `role='manager'` e `organization_id`.

### 2. Cadastro de Leader (Convite)
*   **Pré-requisito**: Manager cria um convite na tabela `invitations` (token único).
*   **Input**: Email, Senha, `invite_token` (metadata).
*   **Processo**:
    1.  `supabase.auth.signUp()` cria usuário.
    2.  Trigger `on_auth_user_created` dispara.
    3.  Detecta `invite_token`.
    4.  Valida token na tabela `invitations` (existe e não expirou?).
    5.  Se inválido: Aborta transação (bloqueia cadastro) ou cria sem org (a decidir - optamos por **bloquear** para manter consistência).
    6.  Se válido: Cria `profile` com `role='leader'` e `organization_id` do convite.
    7.  Marca convite como usado (deleta ou atualiza status).

### 3. Tabela Invitations
*   Colunas: `email` (opcional, para validação extra), `token`, `organization_id`, `role`, `expires_at`.
*   RLS: Managers veem/criam convites da sua org.

## Consequências
*   A lógica de negócio fica centralizada no Banco de Dados (PL/pgSQL), garantindo consistência mesmo se o cliente for modificado.
*   Erros no trigger retornam erro 500 para o cliente no `signUp`, que deve ser tratado para exibir mensagens amigáveis ("Token inválido", etc).
