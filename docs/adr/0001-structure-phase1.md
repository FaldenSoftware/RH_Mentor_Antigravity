# ADR 0001: Estrutura do Projeto e Arquitetura Fase 1

## Status
Aceito

## Contexto
Precisamos iniciar o projeto `leader-platform` (RH Mentor) com uma base sólida, focada em segurança (RLS), separação de responsabilidades (DDD) e desempenho. O projeto deve suportar uma aplicação Web e potencialmente Mobile (Client), compartilhando regras de negócio.

## Decisão
Adotaremos a seguinte estrutura:

1.  **Diretórios**:
    *   `/.antigravity`: Configurações da plataforma.
    *   `/src`: Código-fonte.
        *   `/src/contexts`: Bounded Contexts (DDD). Ex: `identity`, `assessment`, `organization`.
        *   `/src/web`: Aplicação Frontend (React/Vite).
        *   `/src/client`: Aplicação Mobile (React Native/Expo).
    *   `/mcp_servers`: Servidores MCP (ex: `supabase_adapter`).
    *   `/docs`: Documentação e ADRs.
    *   `/tests`: Testes automatizados.

2.  **Banco de Dados (Supabase)**:
    *   Tabelas: `organizations`, `profiles`, `tests`, `assignments`, `results`.
    *   **RLS (Row Level Security)**: Obrigatório em TODAS as tabelas.
        *   Managers acessam dados da `organization_id`.
        *   Leaders acessam apenas seus dados (`auth.uid()`).
    *   **Índices**: Nas colunas de chaves estrangeiras (`organization_id`, `user_id`, `test_id`) e datas (`created_at`).

3.  **Segurança**:
    *   Interfaces MCP devem validar inputs via Zod ou similar.
    *   Nenhum segredo no código.

## Consequências
*   A organização em contextos aumenta a complexidade inicial mas facilita a manutenção.
*   RLS estrito requer cuidado nas queries para evitar retornos vazios inesperados.
