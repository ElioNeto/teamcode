# Issue 01

## Status: Pendente

## Anotações:
[para o agente]

## Objetivo
Substituir todas as referências de marca `opencode` por `teamcode` em arquivos de configuração, UI, documentação e metadata do projeto.

## Escopo
- [ ] `package.json` raiz e todos os `packages/*/package.json` — `name`, `description`
- [ ] `README.md` e todos os `README.*.md` — título, badges, links
- [ ] `packages/app/` — título da página, `<title>`, manifesto PWA, meta tags
- [ ] `packages/opencode/` — renomear o pacote para `packages/teamcode/` (ou manter internamente e só trocar o nome exposto)
- [ ] CLI: mensagem de boas-vindas, help text, banner
- [ ] TUI: header/logo exibido no terminal
- [ ] `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`
- [ ] Workflows do GitHub Actions (`.github/workflows/`) — nomes e referências
- [ ] Favicon, `site.webmanifest`, `apple-touch-icon`
- [ ] Variável de ambiente `OPENCODE_*` → `TEAMCODE_*` (manter alias para compatibilidade)

## Observações
- Manter credit no README: _"Based on [opencode](https://github.com/sst/opencode) (MIT)"_
- Não alterar nomes de funções/classes internas nesta issue — só identidade visual e metadata

## Critérios de aceite
- Nenhuma ocorrência visível de "opencode" na UI, CLI e documentação pública
- Build e testes continuam passando após o rebranding


# Issue 02

## Status: Pendente

## Anotações:
[para o agente]

## Objetivo
Criar um módulo `packages/opencode/src/swarm/` que gerencie o ciclo de vida de múltiplos agentes em paralelo, com roteamento de tarefas, handoffs e agregação de resultados.

## Escopo
- [ ] Criar `swarm/orchestrator.ts` — responsável por instanciar, monitorar e encerrar subagentes
- [ ] Definir interface `SwarmAgent` com campos: `id`, `role`, `status`, `model`, `tools`, `sessionId`
- [ ] Implementar roteamento de tarefas por `role` (planner, researcher, executor, reviewer)
- [ ] Suporte a execução paralela e sequencial de agentes
- [ ] Handoff: transferência de contexto entre agentes via `session/`
- [ ] Integrar com `bus/` para eventos do swarm (`swarm:started`, `swarm:agent:done`, `swarm:completed`)
- [ ] Adicionar config no `opencode.jsonc` para definir swarms customizados

## Referências
- `packages/opencode/src/agent/`
- `packages/opencode/src/session/`
- `packages/opencode/src/bus/`
- `packages/opencode/src/background/`

## Critérios de aceite
- Um swarm de 3 agentes (planner → executor → reviewer) executa uma tarefa end-to-end
- O resultado é agregado e apresentado na UI


# Issue 03

## Status: Pendente

## Anotações:
[para o agente]

## Objetivo
Definir e implementar os 4 roles principais de agentes especializados que compõem o swarm padrão do teamcode.

## Roles

### 🧠 Planner
- Recebe a tarefa do usuário
- Decomposta em subtarefas com dependências
- Produz um `TaskPlan` estruturado

### 🔍 Researcher
- Recebe subtarefas de busca/análise
- Acessa ferramentas: busca de código, leitura de arquivos, LSP
- Produz `ResearchResult` com contexto relevante

### ⚙️ Executor
- Recebe subtarefas de implementação
- Escreve/modifica código usando as ferramentas existentes
- Integra com `worktree/` para isolamento de branches

### ✅ Reviewer
- Recebe o output do Executor
- Valida qualidade, testes, cobertura
- Aprova ou devolve para o Executor com feedback

## Escopo
- [ ] Criar `swarm/roles/planner.ts`
- [ ] Criar `swarm/roles/researcher.ts`
- [ ] Criar `swarm/roles/executor.ts`
- [ ] Criar `swarm/roles/reviewer.ts`
- [ ] Cada role tem seu próprio system prompt e conjunto de ferramentas permitidas
- [ ] Suporte a modelo diferente por role (ex: Planner usa Claude Opus, Executor usa Sonnet)

## Critérios de aceite
- Cada role executa de forma isolada e passável de teste unitário
- Configurável via `opencode.jsonc`



# Issue 04

## Status: Pendente

## Anotações:
[para o agente]

## Objetivo
Criar um modo `sandbox` que execute agentes em ambiente completamente isolado do sistema do usuário, prevenindo side-effects indesejados durante desenvolvimento e testes.

## Escopo

### Sandbox leve (padrão)
- [ ] Executar agentes em um `git worktree` temporário isolado
- [ ] Bloquear ferramentas destrutivas (`rm`, `git push`, deploy) por padrão
- [ ] Modo dry-run: simular escrita de arquivos sem aplicar
- [ ] Permissões granulares: `read-only`, `write-local`, `full`

### Sandbox container (opcional, avanado)
- [ ] Suporte a execução via Docker/Podman
- [ ] Montar apenas o diretório do projeto como volume
- [ ] Rede bloqueada por padrão no container
- [ ] Timeout configurável por tarefa

### Configuração
```jsonc
// opencode.jsonc
{
  "sandbox": {
    "enabled": true,
    "mode": "worktree", // ou "container"
    "permissions": "write-local",
    "timeout": 300
  }
}
```

- [ ] Flag CLI: `teamcode run --sandbox`
- [ ] Indicador visual na TUI quando sandbox ativo
- [ ] Log de todas as ações bloqueadas

## Critérios de aceite
- Agente em modo sandbox não consegue modificar arquivos fora do escopo definido
- Performance máxima de overhead de 10% vs modo normal



# Issue 05

## Status: Pendente

## Anotações:
[para o agente]

## Objetivo
Redesenhar a interface web (`packages/app/`) com uma UI moderna, incluindo um dashboard dedicado para visualizar e gerenciar o agent swarm em tempo real.

## Escopo

### Design System
- [ ] Tokens de design: cores, tipografia, espaçamento (seguindo Nexus palette)
- [ ] Modo claro e escuro com toggle
- [ ] Fonte principal: Geist ou Satoshi
- [ ] Componentes base: Button, Card, Badge, Input, Modal, Tabs, Toast

### Dashboard do Swarm
- [ ] Visualização do grafo de agentes em execução (nós + arestas)
- [ ] Status em tempo real de cada agente (idle / thinking / executing / done / error)
- [ ] Log de mensagens entre agentes
- [ ] Timeline de tarefas completadas
- [ ] Métricas: tokens usados, custo estimado, tempo por agente

### Melhorias gerais da UI
- [ ] Sidebar recolhível com lista de sessões e swarms
- [ ] Editor de prompt com suporte a `/commands` e `@mentions` de agentes
- [ ] Diff viewer integrado para visualizar mudanças de código propostas
- [ ] Painel de permissões e aprovação de ações sensíveis
- [ ] Suporte mobile-first (375px+)

### Tecnologia
- Manter React + TypeScript existente
- Adicionar `@xyflow/react` para o grafo de agentes
- Tailwind v4 para estilos

## Critérios de aceite
- Dashboard mostra agentes do swarm atualizando em tempo real via WebSocket
- UI passável em auditoria de acessibilidade WCAG AA
- Funciona em desktop (1280px) e mobile (375px)



# Issue 06

## Status: Pendente

## Anotações:
[para o agente]

## Objetivo
Implementar uma camada de memória compartilhada que permita agentes do swarm acessar e gravar contexto comum, evitando retrabalho e perda de informações entre handoffs.

## Escopo

### Tipos de memória
- [ ] **Working memory** — contexto da tarefa atual (volátil, vive durante o swarm)
- [ ] **Session memory** — contexto da sessão do usuário (persiste entre swarms)
- [ ] **Project memory** — conhecimento sobre o projeto (persiste no `.teamcode/memory/`)

### API
```typescript
// Exemplo de uso
const mem = SwarmMemory.get(swarmId)
await mem.write('architecture-decisions', content)
const ctx = await mem.read('architecture-decisions')
const relevant = await mem.search('como funciona o auth')
```

### Implementação
- [ ] Store em SQLite local (usando o `db/` existente)
- [ ] Índice vetorial simples para busca semântica (via embeddings)
- [ ] TTL configurável por tipo de memória
- [ ] Integrar com `session/` existente
- [ ] Expor como ferramenta para os agentes (`memory_read`, `memory_write`, `memory_search`)

## Critérios de aceite
- Agente B lê semântica escrita pelo Agente A na mesma sessão
- Project memory persiste entre reinicializações do teamcode



# Issue 07

## Status: Pendente

## Anotações:
[para o agente]

## Objetivo
Adicionar uma camada de observabilidade completa para o swarm, permitindo depuração, auditoria e otimização de desempenho de execuções multi-agente.

## Escopo

### Tracing
- [ ] Span por agente com: `agent_id`, `role`, `task`, `start`, `end`, `status`
- [ ] Trace completo do swarm mostrando a árvore de execução
- [ ] Exportar para formato OpenTelemetry (OTLP)
- [ ] Visualizador local via UI web (issue #5)

### Métricas
- [ ] Tokens consumidos por agente e por swarm
- [ ] Custo estimado por modelo/provider
- [ ] Tempo de execução por etapa
- [ ] Taxa de sucesso/falha por role
- [ ] Histórico de swarms (persistência local)

### Logs
- [ ] Logs estruturados em JSON por agente
- [ ] Níveis: `debug`, `info`, `warn`, `error`
- [ ] Stream de logs em tempo real na TUI e UI web
- [ ] Arquivo de log por sessão em `~/.teamcode/logs/`

### Alertas
- [ ] Notificação quando agente trava por mais de N segundos
- [ ] Alerta de custo: avisar quando swarm ultrapassar limite configurado

## Critérios de aceite
- É possível reproduzir exatamente o que cada agente fez em uma execução
- Métricas de custo são precisas com margem de 5%



# Issue 08

## Status: Pendente

## Anotações:
[para o agente]

## Objetivo
Criar um sistema de templates de swarm que permitam ao usuário iniciar fluxos multi-agente com um comando simples, sem precisar configurar cada agente manualmente.

## Templates incluídos

### `feature` — implementar uma feature completa
```
Planner → Researcher → Executor → Reviewer
```

### `bugfix` — corrigir um bug
```
Researcher (reproduzir) → Executor (corrigir) → Reviewer (validar)
```

### `refactor` — refatorar código existente
```
Researcher (mapear) → Planner (estratégia) → Executor (refatorar) → Reviewer
```

### `review-pr` — revisar um pull request
```
Researcher (ler diff) → Reviewer (analisar) → [output: comentários estruturados]
```

### `research` — investigar uma tecnologia ou codebase
```
Researcher (paralelo: múltiplos subagentes) → Planner (consolidar)
```

## Escopo
- [ ] Criar `swarm/templates/` com cada template como arquivo YAML/TS
- [ ] Comando CLI: `teamcode swarm --template feature "adicionar login com Google"`
- [ ] Suporte a templates customizados pelo usuário em `.teamcode/swarms/`
- [ ] Listagem de templates: `teamcode swarm --list`

## Critérios de aceite
- `teamcode swarm --template feature` executa sem configuração adicional
- Usuário consegue criar e compartilhar templates customizados



# Issue 09

## Status: Pendente

## Anotações:
[para o agente]

## Objetivo
Permitir que o usuário intervenha, aprove ou redirecione agentes durante a execução do swarm, garantindo controle humano em pontos críticos.

## Escopo

### Pontos de pausa (checkpoints)
- [ ] O Planner apresenta o plano e aguarda aprovação antes de executar
- [ ] O Executor solicita confirmação antes de ações destrutivas (deletar arquivo, rodar migrations)
- [ ] O Reviewer pode escalar para humano quando inseguro

### Intervenções disponíveis
- [ ] `approve` — continuar
- [ ] `reject` + feedback — refazer etapa
- [ ] `redirect` — dar nova instrução ao agente atual
- [ ] `stop` — encerrar o swarm
- [ ] `takeover` — assumir controle manual e depois devolver ao swarm

### UX
- [ ] Notificação na TUI e UI web quando aguardando input
- [ ] Timeout configurável: se não há resposta em N minutos, pausar e notificar
- [ ] Histórico de todas as decisões humanas na sessão

### Config
```jsonc
{
  "swarm": {
    "humanInTheLoop": {
      "requirePlanApproval": true,
      "requireDestructiveApproval": true,
      "timeoutMinutes": 10
    }
  }
}
```

## Critérios de aceite
- Swarm pausa e notifica corretamente em checkpoints configurados
- Usuário consegue redirecionar um agente sem reiniciar o swarm inteiro



# Issue 10

## Status: Pendente

## Anotações:
[para o agente]

## Objetivo
Adaptar e limpar os workflows do GitHub Actions herdados do opencode, removendo referências externas e criando um pipeline adequado para o teamcode.

## Escopo

### Limpar workflows herdados
- [ ] Remover workflows que dependem de infra do opencode original (deploy SST, Discord notify, etc.)
- [ ] Remover `.github/TEAM_MEMBERS` e ajustar CODEOWNERS

### Criar novos workflows
- [ ] `ci.yml` — lint + typecheck + testes em cada PR
- [ ] `build.yml` — build do pacote principal e da UI web
- [ ] `release.yml` — gera release notes e publica no npm ao fazer tag `v*`
- [ ] `pr-check.yml` — valida título de PR (Conventional Commits)

### Qualidade
- [ ] Cobertura mínima de testes: 60%
- [ ] Typecheck deve passar sem erros
- [ ] Lint com oxlint (já configurado no projeto)

### Ambientes
- [ ] Configuração de secrets necessários documentada no README
- [ ] Suporte a Bun como runtime no CI

## Critérios de aceite
- PRs só são mergeados se CI passar
- Release automático funciona com tag semver

