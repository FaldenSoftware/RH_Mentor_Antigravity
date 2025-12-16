# Regras Fundamentais para Desenvolvimento de SaaS na Plataforma Antigravity

**Versão**: 1.0
**Data**: 13 de dezembro de 2025

## Introdução

Este documento estabelece as regras e diretrizes obrigatórias para todo o desenvolvimento de software realizado na plataforma Antigravity. O objetivo é garantir a criação de um SaaS com código limpo, seguro, performático e de fácil manutenção, com foco em otimização para dispositivos móveis. Estas regras devem ser seguidas rigorosamente tanto por desenvolvedores humanos quanto pelos agentes de IA.

---

## 1. Arquitetura e Estrutura

1.  **Estrutura de Diretórios Padronizada**: Utilize uma estrutura de projeto que separe claramente a configuração da plataforma (`/.antigravity`), o código-fonte (`/src`), os servidores MCP (`/mcp_servers`), a documentação (`/docs`) e os testes (`/tests`).

2.  **Design Orientado a Domínio (DDD)**: Organize o código-fonte em `Bounded Contexts` (contextos delimitados), como `autenticação`, `faturamento` e `gerenciamento de usuários`. Cada contexto deve ser o mais independente possível.

3.  **Padrão de Repositório**: Abstraia todo o acesso ao banco de dados através do padrão Repository. A lógica de negócio nunca deve interagir diretamente com o cliente do Supabase; ela deve usar a interface do repositório.

4.  **Isolamento de Servidores MCP**: Crie servidores MCP com responsabilidades únicas e focadas. Por exemplo, um servidor para acesso a dados do Supabase e outro para integração com APIs de terceiros. Isso segue o princípio da ortogonalidade.

5.  **Registro de Decisões Arquiteturais (ADRs)**: Documente todas as decisões de arquitetura importantes em um diretório `/docs/adr`. Isso fornece contexto histórico para a evolução do projeto.

---

## 2. Qualidade e Padrões de Código

1.  **Nomenclatura Clara e Significativa**: Nomes de variáveis, funções e classes devem revelar sua intenção sem a necessidade de comentários. Siga rigorosamente as convenções de nomenclatura da linguagem (ex: `camelCase` para funções, `PascalCase` para classes em TypeScript).

2.  **Funções com Responsabilidade Única**: Cada função deve fazer apenas uma coisa e fazê-la bem. Funções devem ser pequenas e ter, no máximo, três argumentos.

3.  **Não Repita a Si Mesmo (DRY)**: Elimine a duplicação de código e lógica. Crie abstrações e funções utilitárias para comportamentos comuns.

4.  **Comentários Explicam o "Porquê", não o "O Quê"**: O código deve ser autoexplicativo. Use comentários apenas para esclarecer a razão por trás de uma decisão complexa de negócio ou uma otimização não óbvia.

5.  **Tratamento de Erros Explícito**: Nunca ignore erros. Utilize blocos `try/catch` e lance exceções específicas do domínio em vez de erros genéricos. Não exponha detalhes sensíveis da implementação nas mensagens de erro retornadas ao cliente.

---

## 3. Segurança

1.  **Row-Level Security (RLS) Obrigatório**: Todas as tabelas no Supabase devem ter políticas de RLS ativadas. O acesso a dados deve ser negado por padrão. **Esta regra é inegociável e não pode ser desativada em produção.**

2.  **Princípio do Menor Privilégio**: Contas de serviço e chaves de API, incluindo as usadas por servidores MCP, devem ter o conjunto mínimo de permissões necessárias para realizar suas tarefas. As operações em nome de um usuário devem sempre usar o token JWT do usuário para que as políticas de RLS sejam aplicadas.

3.  **Validação de Entrada em Múltiplas Camadas**: Valide todos os dados de entrada no cliente (para UX), no servidor MCP (para segurança) e, quando aplicável, no banco de dados (com constraints). Desconfie de qualquer dado proveniente de fontes externas.

4.  **Proibido Hardcoding de Segredos**: Nunca armazene chaves de API, senhas ou qualquer tipo de segredo diretamente no código-fonte. Utilize variáveis de ambiente gerenciadas pela plataforma Antigravity.

5.  **Codificação de Saída (Output Encoding)**: Sempre codifique os dados antes de exibi-los na interface do usuário para prevenir ataques de Cross-Site Scripting (XSS).

6.  **Logging Seguro**: Nunca registre informações sensíveis como senhas, tokens de sessão, chaves de API ou dados pessoais identificáveis em logs.

---

## 4. Performance e Otimização Mobile

1.  **Queries de Banco de Dados Otimizadas**: Especifique sempre as colunas necessárias em uma consulta (`select`). Evite o uso de `select *`.

2.  **Paginação Obrigatória**: Todas as APIs que retornam listas de dados devem implementar paginação para evitar a transferência de grandes volumes de informação.

3.  **Criação de Índices**: Crie índices no banco de dados para todas as colunas usadas em cláusulas `where`, `join` e `order by` em consultas frequentes.

4.  **Uso de Realtime para Dados Dinâmicos**: Utilize o serviço Supabase Realtime para funcionalidades que exigem atualizações instantâneas (notificações, chats, dashboards), em vez de polling contínuo.

5.  **Tamanho de Bundle Reduzido**: Monitore o tamanho dos pacotes da aplicação front-end. Otimize o carregamento de recursos e utilize técnicas como code-splitting.

---

## 5. Automação e Interação com IA (Antigravity)

1.  **Prompts Estruturados para o Agente**: Ao delegar tarefas ao agente de IA, forneça prompts claros e estruturados que incluam contexto, requisitos técnicos, formato de saída esperado e restrições.

2.  **Validação Humana do Código Gerado por IA**: Todo código gerado pelo agente Antigravity deve ser revisado por um desenvolvedor humano, especialmente no que diz respeito à lógica de negócio, segurança e casos de uso complexos.

3.  **Configuração de Workflows Automatizados**: Configure workflows na plataforma Antigravity para automatizar tarefas de CI/CD, como execução de linters, testes automatizados e verificação de segurança a cada Pull Request.

4.  **Manutenção da Qualidade do Código-Base**: A qualidade do código gerado pela IA é um reflexo da qualidade do código-base existente. Mantenha o repositório limpo e bem documentado para maximizar a eficácia do agente.

---

## Checklist de Conformidade (A ser verificado a cada entrega)

- [ ] A estrutura de diretórios está correta?
- [ ] O acesso a dados usa o padrão Repository?
- [ ] As funções têm responsabilidade única?
- [ ] Não há duplicação de código (DRY)?
- [ ] As políticas de RLS estão ativas e corretas?
- [ ] Nenhum segredo está hardcoded?
- [ ] Todas as entradas externas são validadas?
- [ ] As queries de banco de dados são específicas e paginadas?
- [ ] Os logs não contêm dados sensíveis?
- [ ] O código gerado por IA foi revisado por um humano?
