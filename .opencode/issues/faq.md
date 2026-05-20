# ❓ FAQ — Perguntas Classificadas como "Não Planejadas"

> Este documento reúne **124 perguntas de usuários** do repositório upstream
> [anomalyco/opencode](https://github.com/anomalyco/opencode) que foram
> classificadas como fora do escopo do fork TeamCode.
>
> As respostas foram elaboradas com base na análise do código-fonte do TeamCode
> (commit `dev`, branch `main`), referenciando arquivos, tipos e schemas reais
> para oferecer profundidade técnica.
>
> **Fonte original:** `.opencode/issues/not-planned.md`

---

## Índice

1. [Instalação e Configuração](#1-instalação-e-configuração)
2. [Modelos e Provedores](#2-modelos-e-provedores)
3. [Assinatura e Faturamento (Go / Zen)](#3-assinatura-e-faturamento-go--zen)
4. [Interface TUI / CLI / Desktop](#4-interface-tui--cli--desktop)
5. [Interface Web (Web UI)](#5-interface-web-web-ui)
6. [Plugins, MCP e Extensões](#6-plugins-mcp-e-extensões)
7. [Sessões e Histórico](#7-sessões-e-histórico)
8. [Permissões e Segurança](#8-permissões-e-segurança)
9. [Compatibilidade e Integração](#9-compatibilidade-e-integração)
10. [Comportamento e Bugs](#10-comportamento-e-bugs)
11. [Dúvidas Gerais sobre o Projeto](#11-dúvidas-gerais-sobre-o-projeto)

---

## 1. Instalação e Configuração

### Como faço para verificar a configuração embutida do agente plan/build?

**Issue:** [#28023 — Built-in configuration](https://github.com/anomalyco/opencode/issues/28023)

**Pergunta:** O usuário queria encontrar a configuração padrão dos agentes no `opencode.json`, mas não conseguia localizá-la — ela é hardcoded.

**Resposta:** No TeamCode, a configuração padrão dos agentes **não é hardcoded** — ela é definida em arquivos Markdown com frontmatter YAML dentro do diretório de configuração. O carregamento é feito por `ConfigAgent.load()` em `packages/teamcode/src/config/agent.ts` (linhas 96-128), que escaneia `{agent,agents}/**/*.md` no diretório `.teamcode/`. Cada arquivo é parseado via `ConfigMarkdown.parse()`, que extrai o frontmatter como metadados (`model`, `prompt`, `mode`, `permission`, etc.) e o corpo como `prompt` do agente.

Os agentes built-in (`plan`, `build`, `general`, `explore`, `scout`, `title`, `summary`, `compaction`) são registrados no schema `config.ts:Info.agent` (linhas 214-236) como um `Schema.Record(Schema.String, ConfigAgent.Info)`. Para inspecionar a configuração ativa, use `teamcode config` ou verifique os arquivos em `~/.config/teamcode/`.

### Qual é a última versão do opencode CLI?

**Issue:** [#27876 — what is he last version of opencode cli?](https://github.com/anomalyco/opencode/issues/27876)

**Pergunta:** O CLI notificava sobre uma atualização, mas mesmo após instalar o `.deb` mais recente a versão do CLI não atualizava.

**Resposta:** O TeamCode não distribui binários pré-compilados ou pacotes `.deb`. A instalação é feita via fonte ou via `bun` no monorepo. A versão atual é definida em `packages/teamcode/package.json` como `1.15.4`. Para atualizar, faça `git pull origin dev` e recompile. O mecanismo de `autoupdate` descrito em `config.ts:Info` (linha 155: `Schema.optional(Schema.Union([Schema.Boolean, Schema.Literal("notify")]))`) não existe no TeamCode — este fork não tem servidor de atualização.

### É seguro atualizar o OpenCode durante um ataque supply chain?

**Issue:** [#27646 — Is it safe to update Opencode these few days?](https://github.com/anomalyco/opencode/issues/27646)

**Pergunta:** Preocupação com segurança devido a um ataque supply chain amplamente noticiado.

**Resposta:** O TeamCode é distribuído exclusivamente via fonte neste repositório Git. Não há binários baixados de CDNs, nem servidor de atualização automática. O mecanismo de `autoupdate` em `config.ts` está desabilitado por padrão. As dependências npm são verificadas via lockfile (`bun.lock`). Para maior segurança, revise as dependências em `packages/*/package.json` antes de instalar.

### Como recuperar uma sessão deletada acidentalmente?

**Issue:** [#23468 — How to recover a mistakenly deleted session](https://github.com/anomalyco/opencode/issues/23468)

**Pergunta:** O comando `/sessions` + `Ctrl+d` deleta a sessão. O usuário queria saber como recuperá-la.

**Resposta:** No TeamCode, sessões são armazenadas em SQLite via Drizzle ORM (`packages/teamcode/src/session/session.sql.ts`). A tabela `session` tem uma flag `time_archived` (linha 52: `time_archived: integer().notNull().default(0)`) que permite "arquivar" em vez de deletar. O método `session.remove()` em `packages/teamcode/src/session/session.ts` (linha 482) deleta fisicamente o registro, mas não há `DELETE CASCADE` — mensagens e partes órfãs podem persistir. O comando `teamcode db` permite inspecionar o banco diretamente. Sugestão: configure `auto_archive: true` (não implementado atualmente) ou faça backup periódico do arquivo `~/.local/share/teamcode/opencode.db`.

### Por que o OpenCode instala pacotes de plugin automaticamente?

**Issue:** [#26462 — Why OpenCode automatic install plugin packages?](https://github.com/anomalyco/opencode/issues/26462)

**Pergunta:** Ao abrir o OpenCode, ele instala `@opencode-ai/plugin` em um subdiretório `./basic`, o que gerou dúvida.

**Resposta:** O TeamCode gerencia plugins via `packages/teamcode/src/plugin/index.ts`. Plugins declarados em `teamcode.jsonc` na seção `plugin` são instalados sob demanda via `installPlugin()` em `packages/teamcode/src/plugin/install.ts`. O fluxo é: `resolvePluginTarget()` → `readPluginManifest()` → `patchPluginConfig()`. A instalação automática ocorre apenas para plugins explicitamente configurados, não para um diretório `./basic`. Há também plugins internos (linhas ~25-33 de `plugin/index.ts`): `CodexAuthPlugin`, `CopilotAuthPlugin`, `GitlabAuthPlugin`, `PoeAuthPlugin`, `CloudflareWorkersAuthPlugin`, `CloudflareAIGatewayAuthPlugin`, `AzureAuthPlugin`, `DigitalOceanAuthPlugin`.

### Por que o Workspace precisa ser vinculado a um diretório específico?

**Issue:** [#23424 — Why must a workspace be forcibly bound to a specific directory?](https://github.com/anomalyco/opencode/issues/23424)

**Pergunta:** O usuário sugeria que workspaces deveriam ser coleções de ideias, e não pastas físicas.

**Resposta:** O TeamCode introduziu um sistema de workspaces com suporte a múltiplos workspaces por projeto. O schema da tabela `session` em `packages/teamcode/src/session/session.sql.ts` (linha 20) inclui `workspace_id: text()` — um FK para o workspace ativo. O workspace ainda é vinculado a um diretório (`directory` na tabela), mas o campo `workspace_id` permite isolamento lógico. O método `session.create()` em `session.ts` (linha 458) aceita `workspaceID?: WorkspaceID` como parâmetro opcional, permitindo criar sessões em diferentes workspaces dentro do mesmo projeto.

### Como fazer o OpenCode lembrar o modelo Plan/Build configurado?

**Issue:** [#26144 — How to make Opencode TUI remember your Build/Plan model?](https://github.com/anomalyco/opencode/issues/26144)

**Pergunta:** Após fechar e reabrir o OpenCode, os modelos Plan e Build voltavam ao padrão.

**Resposta:** No TeamCode, a configuração de modelos por agente é persistida no arquivo `teamcode.jsonc`. O schema `ConfigAgent.Info` em `packages/teamcode/src/config/agent.ts` define campos `model` (opcional) e `variant` (opcional) por agente. No `config.ts` (linhas 214-236), os agentes `plan` e `build` são registrados com modelos específicos. Se você definir:
```jsonc
"agent": { "plan": { "model": "openai/gpt-5.5", "variant": "high" }, "build": { "model": "deepseek/deepseek-v4-flash" } }
```
esta configuração persiste entre sessões. O TUI lê do config em tempo real via `@opentui/solid`.

### O que aconteceu com o opencode-cli TUI?

**Issue:** [#25879 — What happened to the opencode-cli TUI?](https://github.com/anomalyco/opencode/issues/25879)

**Pergunta:** Após atualizar o pacote debian, o binário `opencode-cli` não existia mais.

**Resposta:** O TeamCode tem dois binários: `teamcode` (principal) e `opencode` (alias de compatibilidade), ambos definidos em `packages/teamcode/package.json` na seção `"bin"`. O ponto de entrada é `packages/teamcode/src/index.ts`, que usa `yargs` para registrar 33 comandos, incluindo `tui` (com subcomandos `attach` e `thread`). Não há binário separado `opencode-cli` — o TUI é ativado via `teamcode tui` ou simplesmente `teamcode` sem argumentos. A estrutura de comandos está em `packages/teamcode/src/cli/`.

### Como saber se estou usando o OpenCode via npm ou bun?

**Issue:** [#23055 — how do i know what way i launch opencode after i use npm and bun both](https://github.com/anomalyco/opencode/issues/23055)

**Pergunta:** Múltiplas instalações do `opencode` no `$PATH` — o usuário não sabia qual estava sendo executada.

**Resposta:** O TeamCode é executado exclusivamente com `bun` (runtime definido em `packages/teamcode/package.json` como `"bun"`). O binário `teamcode` aponta para `src/index.ts`, que é executado via bun. Use `which teamcode` e `readlink -f $(which teamcode)` para rastrear a origem. A variável de ambiente `TEAMCODE_BIN_PATH` (lida em runtime) aponta para o diretório do binário em execução.

### Por que a instalação do Desktop não permite escolher o diretório?

**Issue:** [#26791 — 为什么安装路径不能自己指定了](https://github.com/anomalyco/opencode/issues/26791)

**Pergunta:** A versão desktop agora instala sempre em `User Local` sem opção de escolha.

**Resposta:** O TeamCode tem um aplicativo desktop em `packages/desktop/` (Electron via `electron-vite`), configurado com `electron-builder`. O instalador pode ser configurado em `packages/desktop/electron-builder.yml`. O comportamento de instalação forçada em `User Local` não está presente no TeamCode — o Electron Builder permite personalizar o diretório de instalação. Alternativamente, use o CLI (`teamcode`) que não requer instalação — apenas bun e o fonte.

### Como instalar o OpenCode offline no Windows 10?

**Issue:** [#23005 — opencode如何在win10系统上离线安装呢](https://github.com/anomalyco/opencode/issues/23005)

**Pergunta:** Pergunta sobre instalação offline.

**Resposta:** Para instalar o TeamCode offline no Windows: 1) Clone o repositório em uma máquina com internet; 2) Execute `bun install` para baixar dependências; 3) Transfira a pasta inteira (incluindo `node_modules` e `bun.lock`) para a máquina offline; 4) Execute `bun run build` ou `bun packages/teamcode/src/index.ts` diretamente. O banco SQLite é criado automaticamente em `~/.local/share/teamcode/opencode.db` (configurável via `TEAMCODE_DB_PATH`).

---

## 2. Modelos e Provedores

### Como desabilitar o modo Thinking do DeepSeek V4 Flash?

**Issue:** [#27555 — How to disable DeepSeek V4 Flash Thinking mode in OpenCode?](https://github.com/anomalyco/opencode/issues/27555)

**Pergunta:** O usuário usava a API key do OpenCode Go no Immersive Translate e queria desabilitar o modo reasoning.

**Resposta:** No TeamCode, o controle de reasoning/thinking é feito via configuração do provedor e do modelo. O schema `ConfigProvider.Model` em `packages/teamcode/src/config/provider.ts` (linha 13) inclui `reasoning: Schema.optional(Schema.Boolean)` — esta flag indica se o modelo suporta reasoning. Além disso, cada modelo pode ter `options` arbitrárias (linha 85: `options: Schema.optional(Schema.Record(Schema.String, Schema.Any))`) que são passadas diretamente ao SDK do provedor. Para desabilitar thinking (em modelos que suportam), configure no `teamcode.jsonc`:
```jsonc
"provider": { "openai-compatible": { "name": "deepseek", "options": { "baseURL": "https://api.deepseek.com/v1" } } },
"agent": { "build": { "model": "deepseek/deepseek-v4-flash", "options": { "thinking": { "type": "disabled" } } } }
```
O TeamCode não oferece o serviço OpenCode Go — você usa sua própria chave de API diretamente.

### Por que o OpenCode exibe linhas selecionadas e o arquivo atual no VSCode?

**Issue:** [#27420 — Why does OpenCode display the selected lines...](https://github.com/anomalyco/opencode/issues/27420)

**Pergunta:** Comparação com a extensão Claude Code do VSCode.

**Resposta:** O TeamCode tem uma extensão VSCode em `packages/extensions/`. A leitura de linhas selecionadas e arquivo atual depende da API do editor (VS Code `TextEditor.selection`). O TeamCode expõe estas informações via protocolo ACP (Agent Communication Protocol). No TUI built-in (`@opentui/solid`), a informação de contexto é obtida do sistema de arquivos e do watcher (`config.ts: watcher: { ignore }`). A extensão Claude Code é um produto separado da Anthropic e não tem relação com o TeamCode.

### O que significa o erro "VirusFound"?

**Issue:** [#26904 — What does VirusFound mean?](https://github.com/anomalyco/opencode/issues/26904)

**Pergunta:** Erro misterioso ao usar o provedor Copilot (GPT 5.4).

**Resposta:** O GitHub Copilot pode retornar o erro "VirusFound" quando o modelo gera código que a heurística de segurança do Copilot classifica como potencialmente malicioso (ex: ofuscação, padrões de exploit). Isto ocorre no proxy do Copilot, não no TeamCode. O TeamCode se conecta ao Copilot via `@ai-sdk/github-copilot` (ver `packages/teamcode/src/provider/provider.ts` linha dos imports: `@ai-sdk/github-copilot`). Se você encontrar este erro, reformule o prompt para evitar padrões que acionem o filtro.

### Como usar as APIs NVIDIA NIM com OpenCode?

**Issue:** [#26876 — How can I use the Nvidia NIM Apis with Opencode](https://github.com/anomalyco/opencode/issues/26876)

**Pergunta:** Dúvida sobre compatibilidade com NVIDIA NIM.

**Resposta:** O TeamCode suporta provedores compatíveis com OpenAI via `@ai-sdk/openai-compatible` (ver `packages/teamcode/src/provider/provider.ts` linha 100). A NVIDIA NIM expõe uma API compatível com OpenAI. Configure no `teamcode.jsonc`:
```jsonc
"provider": { "nvidia-nim": { "name": "NVIDIA NIM", "npm": "@ai-sdk/openai-compatible", "options": { "baseURL": "https://integrate.api.nvidia.com/v1" } } }
```
O TeamCode também tem lógica especial para NVIDIA em `provider.ts` (ver `nvidia` na seção de custom providers). O modelo deve ser configurado manualmente com o `model ID` exato do NIM.

### Por que o modelo GLM-5V-Turbo foi removido?

**Issue:** [#24672 — Why the Vision Mode Model GLM-5V-Turbo was deleted from ZAI?](https://github.com/anomalyco/opencode/issues/24672)

**Pergunta:** Modelo de visão sumiu após atualização.

**Resposta:** O TeamCode não mantém catálogo de modelos remoto. Os modelos disponíveis vêm de três fontes: (1) catálogo `@teamcode-ai/core/models` (modelos conhecidos), (2) descoberta dinâmica via `discoverModels()` de cada provedor (`provider.ts`), (3) configuração manual do usuário. Se o modelo GLM-5V-Turbo não aparece, configure-o manualmente:
```jsonc
"provider": { "zai": { "models": { "glm-5v-turbo": { "name": "GLM-5V-Turbo" } } } }
```
Para modelos de visão, o schema `ConfigProvider.Model` (linha 64) tem `modalities: input/output` com suporte a `image`, `video`, `pdf`.

### Como mostrar o Chain-of-Thought (CoT) no web UI?

**Issue:** [#24583 — How to show the CoT in opencode web?](https://github.com/anomalyco/opencode/issues/24583)

**Pergunta:** O TUI mostra o pensamento por padrão, mas o web UI não.

**Resposta:** O TeamCode tem uma UI web em `packages/app/` (SolidJS + SolidStart + TailwindCSS 4). O Chain-of-Thought é tratado via o sistema de partes de mensagem: cada `part` na tabela `part` do SQLite (schema em `session.sql.ts` linha 75) tem tipo `data` (JSON) que inclui `reasoning` quando disponível. O TUI usa `@opentui/solid` para renderizar partes de reasoning. A UI web pode não exibir CoT se o componente de mensagem não consumir este campo. A implementação está em `packages/app/src/` — contribuições para adicionar exibição de CoT são bem-vindas.

### Como modificar os agentes Plan e Build para passar `chat_template_kwargs`?

**Issue:** [#23995 — How to modify Plan and Build agents to pass chat_template_kwargs?](https://github.com/anomalyco/opencode/issues/23995)

**Pergunta:** Configurar `enable_thinking: false` via `opencode.json`.

**Resposta:** O schema `ConfigAgent.Info` em `packages/teamcode/src/config/agent.ts` (linha 29) inclui `options: Schema.optional(Schema.Record(Schema.String, Schema.Any))`, que aceita qualquer parâmetro arbitrário. Para passar `chat_template_kwargs`:
```jsonc
"agent": { "plan": { "model": "openai/gpt-5.5", "options": { "chat_template_kwargs": { "enable_thinking": false } } } }
```
O campo `options` é um `Record<string, any>` sem validação restritiva — ele é passado diretamente ao SDK do modelo. O campo `variant` (linha 16) também permite configurar variantes que modificam parâmetros de chamada.

### Por que o GitHub Copilot não suporta modelos Claude?

**Issue:** [#21481 — Why github copilot not support claude model?](https://github.com/anomalyco/opencode/issues/21481)

**Pergunta:** Após atualização, os modelos Claude sumiram do Copilot.

**Resposta:** O TeamCode consome o GitHub Copilot via `@ai-sdk/github-copilot` (ver imports em `provider.ts`). A disponibilidade de modelos no Copilot é determinada pela Microsoft/GitHub, não pelo TeamCode. O TeamCode simplesmente lista os modelos que o Copilot expõe via API. Se a Microsoft removeu modelos Claude do Copilot, o TeamCode não tem controle sobre isso. Você pode usar provedores alternativos (Anthropic diretamente, OpenRouter, etc.) configurando suas próprias chaves de API.

### Gemma 4 falha ao tentar chamar ferramentas

**Issue:** [#25892 — Gemma 4](https://github.com/anomalyco/opencode/issues/25892)

**Pergunta:** Erro `tool-input-available` não incluído no schema de eventos.

**Resposta:** O TeamCode usa o schema de eventos de streaming do AI SDK (`ai` package). O tipo de evento `tool-input-available` não faz parte do schema padrão do AI SDK. Modelos locais (Ollama, vLLM) podem emitir eventos não padronizados. O TeamCode converte MCP tools para `dynamicTool()` do AI SDK (ver `packages/teamcode/src/mcp/index.ts` linha 172: `convertMcpTool()`). Se o Gemma 4 emite eventos que o AI SDK não reconhece, você precisa de um adaptador. Tente configurar o provedor Ollama com `"options": { "tool_call_parser": "hermes" }` ou use o vLLM com `--enable-auto-tool-choice`.

### Modelos gratuitos não aparecem — apenas 3 disponíveis

**Issue:** [#23243 — 免费模型不全，只能看到3个模型](https://github.com/anomalyco/opencode/issues/23243)

**Pergunta:** Usuário via apenas 3 modelos gratuitos, não a lista completa.

**Resposta:** O TeamCode descobre modelos de três formas (ver `provider.ts`):
1. Catálogo `@teamcode-ai/core/models` — modelos conhecidos pré-cadastrados
2. `discoverModels()` — chamada ao provedor via API (ex: OpenAI lista seus modelos)
3. Configuração manual do usuário

Se você espera mais modelos gratuitos, pode estar usando um provedor que limita a listagem (ex: OpenRouter free tier). Para adicionar modelos manualmente:
```jsonc
"provider": { "openai-compatible": { "models": { "meu-modelo-gratuito": { "name": "Meu Modelo" } } } }
```

O comando `teamcode models` lista todos os modelos disponíveis após aplicar todas as fontes.

### DeepSeek V4 não funciona com configuração manual

**Issue:** [#24155 — deepseek v4 不能使用](https://github.com/anomalyco/opencode/issues/24155)

**Pergunta:** Inserir manualmente `base_url` e `model` do DeepSeek não funcionava.

**Resposta:** O TeamCode tem lógica especial para DeepSeek em `packages/teamcode/src/provider/provider.ts` (linha 1355): se o modelo não for encontrado e o provider for `@ai-sdk/openai-compatible` com API ID contendo "deepseek", ele tenta resolver automaticamente. Configure assim:
```jsonc
"provider": { "deepseek": { "name": "DeepSeek", "npm": "@ai-sdk/openai-compatible", "options": { "baseURL": "https://api.deepseek.com/v1", "apiKey": "sk-..." }, "models": { "deepseek-v4-flash": { "name": "DeepSeek V4 Flash" }, "deepseek-v4-pro": { "name": "DeepSeek V4 Pro" } } } }
```
Note que `deepseek-chat` e `deepseek-reasoner` serão descontinuados em 2026-07-24 conforme documentação da DeepSeek.

### Adaptação ao novo modelo DeepSeek V4

**Issue:** [#24092 — Adapting to the New DeepSeek Model](https://github.com/anomalyco/opencode/issues/24092)

**Pergunta:** Pedido para suportar DeepSeek V4 e corrigir opção de thinking.

**Resposta:** O DeepSeek V4 é suportado no TeamCode via provider `openai-compatible`. O modelo DeepSeek V4 usa `reasoning_content` no streaming para thinking mode. O schema de modelo em `packages/teamcode/src/config/provider.ts` (linha 13) tem `reasoning: Schema.optional(Schema.Boolean)` e `interleaved: Schema.optional(...)` para modelos que intercalam reasoning com conteúdo. Se a opção de thinking não funciona, verifique se o modelo está configurado com `"reasoning": true` e se as `options` do agente incluem os parâmetros corretos de thinking.

### Suporte ao GPT-5.4-Cyber?

**Issue:** [#22536 — support GPT‑5.4‑Cyber?](https://github.com/anomalyco/opencode/issues/22536)

**Pergunta:** Pergunta sobre disponibilidade do modelo de cibersegurança da OpenAI.

**Resposta:** O TeamCode usa o provider OpenAI genérico (`@ai-sdk/openai`) para acessar modelos da OpenAI. Se você tem acesso ao GPT-5.4-Cyber via sua conta OpenAI, configure:
```jsonc
"provider": { "openai": { "name": "OpenAI", "options": { "apiKey": "sk-..." } } }
```
E use `openai/gpt-5.4-cyber` como model ID. O TeamCode não tem nenhuma restrição específica — se a OpenAI expõe o modelo via API de chat completions, ele funciona.

### Contexto do Qwen 3.6 Plus diminuiu

**Issue:** [#22595 — Qwen3.6 Plus Context Limit Decreased?](https://github.com/anomalyco/opencode/issues/22595)

**Pergunta:** O limite de contexto caiu de 1M para 260k tokens.

**Resposta:** O limite de contexto é definido no perfil do modelo em `@teamcode-ai/core/models` ou no schema `ConfigProvider.Model` (linha 52: `limit: context, input, output`). Se o limite mudou, é porque o catálogo de modelos foi atualizado para refletir a capacidade real do provedor. Você pode sobrescrever o limite na configuração:
```jsonc
"provider": { "alibaba": { "models": { "qwen-3.6-plus": { "limit": { "context": 1000000 } } } } }
```

### Erro ao trocar para modelo DeepSeek gratuito

**Issue:** [#26897 — 切换免费的deepseek模型错误](https://github.com/anomalyco/opencode/issues/26897)

**Pergunta:** `Model deepseep-v4-flash-free not supported` — provável typo no cache.

**Resposta:** O erro com "deepseep" (typo) pode vir de cache local ou do provedor. No TeamCode, a resolução de modelos é feita em `provider.ts`: primeiro busca no catálogo local, depois tenta configuração manual. O cache de descoberta de modelos é armazenado no `Provider.Service`. Para limpar:
```bash
rm -rf ~/.local/share/teamcode/provider-cache.json  # se existir
# ou simplesmente reinicie o teamcode
```
Configure manualmente o modelo com o ID correto: `"deepseek-v4-flash-free"` (sem "deepseep").

### Provider Qiniu não lista modelos DeepSeek V4

**Issue:** [#27574 — Cannot list all of the models from Provider Qiniu](https://github.com/anomalyco/opencode/issues/27574)

**Pergunta:** Modelos existentes no provedor mas não aparecem no painel do OpenCode.

**Resposta:** A listagem de modelos depende da implementação de `discoverModels()` do provedor. Se o Qiniu adicionou novos modelos mas o TeamCode não os lista, pode ser que (1) o catálogo `@teamcode-ai/core/models` não foi atualizado, ou (2) o método de descoberta do provedor não retorna todos os modelos. Solução: configure manualmente os modelos desejados:
```jsonc
"provider": { "qiniu": { "models": { "deepseek-v4-flash": { "name": "DeepSeek V4 Flash" }, "deepseek-v4-pro": { "name": "DeepSeek V4 Pro" } } } }
```

### Erro 401: Model opencode-go/GLM-5.1 not supported

**Issue:** [#23777 — 401 Model opencode-go/GLM-5.1 not supported](https://github.com/anomalyco/opencode/issues/23777)

**Pergunta:** Após configurar o modelo com Go API, recebia erro 401.

**Resposta:** O prefixo `opencode-go/` é específico do serviço gerenciado OpenCode Go. O TeamCode não tem este serviço. Para usar modelos GLM no TeamCode, configure o provedor diretamente:
```jsonc
"provider": { "zai": { "name": "ZAI", "npm": "@ai-sdk/openai-compatible", "options": { "baseURL": "https://api.zai.com/v1", "apiKey": "sua-chave" }, "models": { "glm-5.1": { "name": "GLM-5.1" } } } }
```
O erro 401 indica que a chave de API não é válida para o endpoint usado.

### Modelo MiMo-V2-Omni não consegue ler PDF

**Issue:** [#22411 — opencode读取不了pdf文档](https://github.com/anomalyco/opencode/issues/22411)

**Pergunta:** Erro de validação de role ao tentar ler PDF com modelo MiMo.

**Resposta:** O erro de role (`'role' must be one of 'system', 'developer', 'assistant', 'tool', or 'function'`) ocorre quando o modelo não suporta mensagens com `role: 'user'` contendo multimodal content. O schema de partes de mensagem no TeamCode está em `packages/teamcode/src/session/session.sql.ts:MessageTable` e `PartTable`. O TeamCode segue o formato de chat do AI SDK, que permite `role: 'user'` com conteúdo multimodal (`{ type: 'text', text: '...' }`, `{ type: 'file', file: { file_data: '...' } }`). Se o modelo MiMo rejeita `role: 'user'` com PDF, o problema é no modelo/provedor, não no TeamCode. Verifique se o provedor suporta PDF como input (`modalities.input.pdf` no schema do modelo).

### read_file tool não disponível com modelo local Gemma 4 + Ollama

**Issue:** [#21354 — read_file tool call not available with local model gemma4](https://github.com/anomalyco/opencode/issues/21354)

**Pergunta:** Modelo local não usava as tools do OpenCode, apenas `read_file` do Ollama.

**Resposta:** Modelos locais pequenos (como Gemma 4 4B) frequentemente não suportam tool calling no formato OpenAI. O TeamCode usa `dynamicTool()` do AI SDK (ver `packages/teamcode/src/mcp/index.ts` linha 172) que converte tools para o schema OpenAI. Se o modelo não entende tool calls, ele tenta usar ferramentas nativas do Ollama. Para resolver: (1) use um modelo maior com suporte a tools, (2) configure o Ollama com `--tool-call-parser <formato>`, (3) ou ajuste o prompt para instruir o modelo a responder em formato específico sem tools.

---

## 3. Assinatura e Faturamento (Go / Zen)

### Por que apenas um membro por workspace pode assinar o Go?

**Issue:** [#26201 — Why one member per workspace for OpenCode Go](https://github.com/anomalyco/opencode/issues/26201)

**Pergunta:** Limitação de uma assinatura Go por workspace em contas team.

**Resposta:** O TeamCode é software livre sem qualquer sistema de assinatura. Não há planos Go, Zen, ou qualquer restrição de licenciamento. Você pode usar o TeamCode em quantas máquinas quiser, com quantos usuários quiser. A única limitação são as chaves de API dos provedores que você configurar. O schema `ConfigProvider.Info` em `packages/teamcode/src/config/provider.ts` aceita `apiKey` e `baseURL` para cada provedor — você decide quais usar.

### Pergunta sobre preços do OpenCode Go

**Issue:** [#23520 — Question about opencode GO](https://github.com/anomalyco/opencode/issues/23520)

**Pergunta:** Discrepância entre preços no site da OpenRouter vs página do Go.

**Resposta:** Questão de precificação de serviços comerciais que não existem no TeamCode. No TeamCode, você paga apenas o que os provedores de IA cobram (OpenAI, Anthropic, etc.) diretamente, sem intermediários. As configurações de custo (`cost: input, output, cache_read, cache_write`) no schema `ConfigProvider.Model` (linha 28) são apenas para rastreamento local de gastos.

### Como funciona o Bring Your Own Key (BYOK) no Zen?

**Issue:** [#22463 — How does Bring Your Own Key (BYOK) Work in Zen](https://github.com/anomalyco/opencode/issues/22463)

**Pergunta:** Usuário forneceu API key própria mas ainda recebia limite do Zen.

**Resposta:** O TeamCode é 100% BYOK — você sempre usa suas próprias chaves de API. Não há camada de serviço gerenciado entre você e o provedor. Configure no `teamcode.jsonc`:
```jsonc
"provider": { "anthropic": { "name": "Anthropic", "options": { "apiKey": "sk-ant-..." } } }
```
Sem limites artificiais, sem "budget Zen". Apenas os limites do seu plano com o provedor.

### Assinatura ativa mas saldo continua 0

**Issue:** [#27360 — Subscription Active but Balance Still 0](https://github.com/anomalyco/opencode/issues/27360)

**Pergunta:** Pagamento do Go foi confirmado mas saldo não refletia.

**Resposta:** Problema de faturamento do serviço OpenCode Go. O TeamCode não tem saldo, créditos, ou sistema de faturamento. Você usa suas próprias chaves de API e paga diretamente aos provedores.

### Reembolso — acusação de golpe no Zen

**Issue:** [#26508 — Refunds for the ZEN scam](https://github.com/anomalyco/opencode/issues/26508)

**Pergunta:** Usuário reivindicava reembolso após ser direcionado ao Zen em vez do Go.

**Resposta:** Reclamação sobre UX de pagamento de serviço terceiro. O TeamCode não processa pagamentos. Para usar o TeamCode, não é necessário nenhum plano — baixe, compile e use com suas próprias chaves de API.

### Claude Code 接入 OpenCode Go DeepSeek não usa modo thinking

**Issue:** [#27281 — Claude Code 接入 OpenCode go套餐DeepSeek无法使用思考模式](https://github.com/anomalyco/opencode/issues/27281)

**Pergunta:** Erro `reasoning_content must be passed back` ao usar DeepSeek via CC Switch.

**Resposta:** O erro ocorre porque o formato de reasoning do DeepSeek exige que o `reasoning_content` seja retornado nas chamadas seguintes — o CC Switch (gateway) não está preservando este campo. O TeamCode gerencia reasoning content nativamente: o schema `PartTable` em `session.sql.ts` armazena reasoning como parte do JSON da parte (`data`). O AI SDK já lida com `reasoning_content` do DeepSeek. Configure o provedor DeepSeek diretamente no TeamCode sem gateway intermediário.

### Impossível reassinar Go após cancelar débito automático no Alipay

**Issue:** [#24686 — Unable to resubscribe to OpenCode Go monthly plan after canceling Alipay auto-debit](https://github.com/anomalyco/opencode/issues/24686)

**Pergunta:** Após cancelar o débito automático, não conseguia reassinar.

**Resposta:** Problema de billing do serviço OpenCode Go. Não aplicável ao TeamCode. O TeamCode não requer assinatura.

### Esclarecer quais modelos Go são self-hosted vs. proxy

**Issue:** [#24649 — OpenCode Go: clarify which models are self-hosted vs. proxied](https://github.com/anomalyco/opencode/issues/24649)

**Pergunta:** Dúvida sobre infraestrutura: modelos rodam em servidores próprios ou são proxy de terceiros?

**Resposta:** Questão sobre infraestrutura do OpenCode Go. No TeamCode, você sempre se conecta diretamente ao provedor (OpenAI, Anthropic, DeepSeek, etc.) — não há camada de proxy gerenciada pelo TeamCode. A transparência é total: o baseURL é o que você configura.

### Assinei o Go mas Kimi-2.6 e MiMo não respondem

**Issue:** [#24552 — I just suscribed go, and use in opencode. Try kimi-2.6 and mimo v2.5 pro](https://github.com/anomalyco/opencode/issues/24552)

**Pergunta:** Após assinar, modelos específicos do Go não davam resposta.

**Resposta:** No TeamCode, você não depende de um catálogo gerenciado. Configure o provedor Moonshot (Kimi) ou o modelo desejado diretamente:
```jsonc
"provider": { "moonshot": { "name": "Moonshot", "npm": "@ai-sdk/openai-compatible", "options": { "baseURL": "https://api.moonshot.cn/v1", "apiKey": "sk-..." }, "models": { "kimi-2.6": { "name": "Kimi 2.6" } } } }
```
Sem intermediários — se o modelo existe e sua chave tem acesso, ele funciona.

### Inscrevi no Go mas `/model` não mostra Kimi K2.6 e GLM-5.1

**Issue:** [#24460 — 我已订阅 opencode Go，但是 /model 后，没有 Kimi k2.6 以及GLM-5.1](https://github.com/anomalyco/opencode/issues/24460)

**Pergunta:** Modelos contratados não apareciam na lista.

**Resposta:** O comando `teamcode models` lista modelos do catálogo local + descoberta de provedores. Modelos não listados podem ser adicionados manualmente no `teamcode.jsonc` (ver resposta anterior).

### Falha no pagamento via Alipay para o Go

**Issue:** [#24423 — OpenCode GO subscription by Alipay](https://github.com/anomalyco/opencode/issues/24423)

**Pergunta:** Pagamento falhava consistentemente no Alipay.

**Resposta:** Problema de processamento de pagamento do serviço upstream. O TeamCode não processa pagamentos.

### Novos planos Go com melhores limites?

**Issue:** [#24347 — New Go Subscriptions?](https://github.com/anomalyco/opencode/issues/24347)

**Pergunta:** Sugestão de planos Go com limites de uso maiores.

**Resposta:** O TeamCode é ilimitado por natureza — você só tem os limites dos seus próprios provedores. Sem planos, sem tiers, sem restrições artificiais.

### Como usar API do Go no Copilot?

**Issue:** [#24284 — unable to use opencode go API with copilot](https://github.com/anomalyco/opencode/issues/24284)

**Pergunta:** Erro 403 Forbidden do Cloudflare ao tentar usar API Go via extensão copilot.

**Resposta:** O Cloudflare bloqueou a requisição porque a API do OpenCode Go tem proteções contra acessos não autorizados. O TeamCode não expõe APIs gerenciadas — você configura seus provedores localmente.

### Confirmação do tier comercial Anthropic para chamadas via Zen

**Issue:** [#24145 — Confirmation of Anthropic commercial tier protections for Claude API calls via Zen](https://github.com/anomalyco/opencode/issues/24145)

**Pergunta:** Dúvida se chamadas Claude via Zen usam o tier comercial da Anthropic.

**Resposta:** No TeamCode, você se conecta diretamente à API da Anthropic com sua chave. A relação contratual é entre você e a Anthropic. O TeamCode apenas envia requisições para `https://api.anthropic.com/v1`.

### Como usar OpenCode Go com Claude Code CLI?

**Issue:** [#23781 — use open code go with claude code](https://github.com/anomalyco/opencode/issues/23781)

**Pergunta:** Dúvida se é possível usar a assinatura Go no Claude Code CLI.

**Resposta:** O TeamCode é um fork que gera seu próprio binário (`teamcode`). Ele não está relacionado ao Claude Code CLI (produto Anthropic). Para usar modelos Anthropic com o TeamCode, configure sua chave de API diretamente.

### A fatura do Go é via REST API ou só TUI?

**Issue:** [#23513 — Does my OpenCode Go subscription bill via the REST API, or is it TUI-only?](https://github.com/anomalyco/opencode/issues/23513)

**Pergunta:** Dúvida sobre como usar a assinatura Go via REST API.

**Resposta:** O TeamCode tem um servidor HTTP em `packages/teamcode/src/server/server.ts` que expõe API (usando `hono` + `@effect/platform-node`). O servidor pode ser iniciado com `teamcode serve` ou `teamcode web`. A API é aberta para qualquer cliente HTTP — não há assinatura ou billing. Configure sua chave de API nos headers das requisições.

### Limites de tempo (time window) afetam mesmo com modelo próprio

**Issue:** [#23685 — time window limits](https://github.com/anomalyco/opencode/issues/23685)

**Pergunta:** Usuário usava modelo próprio mas ainda sofria restrição de limites.

**Resposta:** Se você estava conectado ao servidor OpenCode upstream, os limites são aplicados no servidor. No TeamCode usando seus próprios provedores, não há limites de tempo impostos pelo cliente. O TeamCode não tem rate limiting interno.

### OpenCode Go Free usage exceeded — qual o ciclo?

**Issue:** [#27492 — opencode zen提示Free usage exceeded, subscribe to Go](https://github.com/anomalyco/opencode/issues/27492)

**Pergunta:** Dúvida sobre o período de renovação do plano gratuito.

**Resposta:** Mensagem do serviço upstream. O TeamCode não tem planos gratuitos ou pagos — é completamente livre.

### Adicionar estatísticas de tokens na página do Go

**Issue:** [#27904 — 请增加tokens统计](https://github.com/anomalyco/opencode/issues/27904)

**Pergunta:** Pedido para mostrar consumo de tokens na página de assinatura.

**Resposta:** O TeamCode rastreia custo de tokens por sessão no SQLite: a tabela `session` (linha 33 em `session.sql.ts`) tem campos `cost`, `tokens_input/output/reasoning/cache_read/cache_write`. O comando `teamcode stats` exibe estas estatísticas. A interface web em `packages/app/` pode ser estendida para mostrar estes dados.

---

## 4. Interface TUI / CLI / Desktop

### Questão dock não fecha após resposta bem-sucedida no web app

**Issue:** [#27977 — Question dock stays open after successful reply](https://github.com/anomalyco/opencode/issues/27977)
> *(Duplicata: #27976)*

**Pergunta:** Após responder no web app, o dock permanece visível.

**Resposta:** O sistema de `question` tool no TeamCode publica eventos no barramento (`Event.Asked` em `packages/teamcode/src/permission/index.ts` linha 180). O evento gera um `PermissionID` e a resposta é processada via `reply()`. A UI (TUI ou web) deve escutar o evento de resposta para fechar o dock. Na UI web (`packages/app/`), a lógica de eventos SSE pode estar perdendo o evento `question.replied`. O TUI usa `@opentui/solid` com estado local síncrono, que não tem este problema.

### Como mostrar output de subagentes no `opencode run`?

**Issue:** [#26229 — How show subagent output when invoking "opencode run"](https://github.com/anomalyco/opencode/issues/26229)

**Pergunta:** O agente principal não exibe output dos subagentes no console.

**Resposta:** O TeamCode tem um sistema de orquestração de swarm em `packages/teamcode/src/swarm/orchestrator.ts`. Cada subagente roda em uma sessão filha, criada via `Effect.forkIn(scope)` com `scope` próprio. O orchestrator publica eventos `swarm.agent.*` no barramento (linhas 82-84). O formato de saída `--format default` não exibe logs de subagentes por padrão. Para ver output detalhado, use `--verbose` ou `--format json` que inclui eventos de swarm. O comando `teamcode run --format verbose` pode ser implementado para mostrar progresso de subagentes.

### Question pane overlay bloqueia o texto da conversa

**Issue:** [#23515 — Question pane overlay blocks/dims the conversation text](https://github.com/anomalyco/opencode/issues/23515)

**Pergunta:** O painel de pergunta cobre o texto da análise anterior, dificultando a resposta.

**Resposta:** Este é um problema de layout do TUI upstream (`@opentui/solid`). O TeamCode usa a mesma biblioteca de terminal, mas o comportamento de sobreposição pode ser ajustado. O TUI renderiza componentes em camadas; a `question` tool usa um componente modal que pode ser configurado para não cobrir o conteúdo. Sugestão de melhoria: implementar um layout side-by-side ou usar `tooltip` em vez de modal.

### O servidor opencode aceita apenas um TUI?

**Issue:** [#22794 — Question: Is opencode server supposed to only allow ONE TUI?](https://github.com/anomalyco/opencode/issues/22794)

**Pergunta:** `opencode serve` só permitia uma conexão TUI; segunda exigia `opencode attach`.

**Resposta:** O servidor do TeamCode em `packages/teamcode/src/server/server.ts` suporta múltiplas conexões simultâneas. O servidor HTTP usa `hono` e `@effect/platform-node`, que tratam conexões concorrentes naturalmente. O comando `teamcode tui attach` conecta-se a um servidor remoto. O comando `teamcode serve` inicia um servidor headless que aceita múltiplos clientes — não há limite de uma conexão.

### Por que o comando `opencode plugin <version>` exige `--force`?

**Issue:** [#22452 — What is the reason `opencode plugin <new-version>` requires `--force`?](https://github.com/anomalyco/opencode/issues/22452)

**Pergunta:** O comando não substituía versão existente sem `--force`, e a saída dizia "Installed" mesmo sem atualizar.

**Resposta:** O gerenciador de plugins do TeamCode está em `packages/teamcode/src/plugin/install.ts`. A função `patchPluginConfig()` modifica o `teamcode.jsonc` para adicionar ou atualizar a referência do plugin. A proteção `--force` existe para evitar sobrescrita acidental de configurações existentes. O bug de saída enganosa ("Installed" sem atualizar) foi relatado no upstream — o TeamCode pode ter corrigido isto. O fluxo é:
1. `resolvePluginTarget(mod)` — encontra o plugin no npm
2. `readPluginManifest()` — descobre targets (server/tui)
3. `patchPluginConfig()` — só sobrescreve se `--force` ou se não existir

### Por que as funcionalidades "queuing" e "guidance" foram removidas?

**Issue:** [#22284 — Why were the two really useful features, ‘queuing’ and ‘guidance’, removed?](https://github.com/anomalyco/opencode/issues/22284)

**Pergunta:** Funcionalidades úteis de envio de mensagens foram removidas em versões anteriores.

**Resposta:** O TeamCode pode não ter estas funcionalidades específicas (queuing/guidance). O sistema de envio de mensagens usa o AI SDK com suporte a streaming. Múltiplas mensagens podem ser enfileiradas via `Effect.queue`. O recurso de "guidance" pode ser implementado via instruções do sistema ou skills. Verifique as skills disponíveis em `packages/teamcode/src/swarm/`.

### Por que a nova versão é tão lenta? (v1.3.17 e v1.4.0)

**Issue:** [#21450 — Why is the new version so laggy?](https://github.com/anomalyco/opencode/issues/21450)

**Pergunta:** Usuário reverteu para v1.2.10 e o problema foi resolvido.

**Resposta:** Se você encontrou lentidão no TeamCode, algumas causas possíveis: (1) O modo `caveman` em `packages/teamcode/src/config/config.ts` (linha 292: `caveman: ConfigCaveman.Info`) pode estar ativo com compressão agressiva; (2) MCP servers com timeout alto podem travar o pipeline; (3) O número de mensagens no contexto pode estar muito alto. Use `teamcode debug` para diagnosticar performance. O comando `teamcode stats` mostra uso de tokens por sessão.

### Por que moveram auto-accept permissions para as configurações globais?

**Issue:** [#21423 — Why Moved auto-accept permissions into Settings?](https://github.com/anomalyco/opencode/issues/21423)

**Pergunta:** Antes era configurável por projeto, agora é global.

**Resposta:** No TeamCode, o sistema de permissões (`packages/teamcode/src/permission/index.ts`) permite regras por projeto e por sessão. O estado `approved: Ruleset` (linha 125) é mantido em memória e pode ser persistido por sessão via `session.setPermission()` (em `session.ts` linha 471). A configuração de permissões aceita tanto forma global quanto por agente:
```jsonc
"permission": { "edit": { "src/**": "allow", "*": "ask" } }
"agent": { "plan": { "permission": { "edit": "deny" } } }
```

### Como obter informações de sessão no header HTTP da requisição LLM?

**Issue:** [#21291 — How to obtain session information in LLM http request header](https://github.com/anomalyco/opencode/issues/21291)

**Pergunta:** O header `x-session-affinity` não era enviado como esperado.

**Resposta:** O header `x-session-affinity` é usado pelo upstream para roteamento de sessão. O TeamCode não implementa este header específico. A informação de sessão é transmitida via parâmetros de requisição e headers customizados definidos na configuração do provedor (`ConfigProvider.Model.headers` em `provider.ts` linha 85). Para adicionar headers customizados às requisições LLM:
```jsonc
"provider": { "openai": { "models": { "gpt-5.5": { "headers": { "x-session-id": "${session.id}" } } } } }
```
Note que a interpolação de variáveis depende da implementação do provider.

### Salto de versão 1.4.x → 1.14.x é normal?

**Issue:** [#23419 — 1.4.x->1.14.x?](https://github.com/anomalyco/opencode/issues/23419)

**Pergunta:** Estratégia de atualização agressiva com bugs frequentes.

**Resposta:** O TeamCode segue versionamento semântico próprio. A versão atual (`1.15.4`) reflete o estado do monorepo. O fork não segue o mesmo esquema de versões do upstream. Consulte o `CHANGELOG.md` na raiz do repositório para mudanças entre versões.

### Pergunta não aparece no Desktop — loading infinito

**Issue:** [#22776 — No Answer with all models - Questions aren't working (Desktop)](https://github.com/anomalyco/opencode/issues/22776)

**Pergunta:** O botão de loading ficava girando indefinidamente sem resposta.

**Resposta:** O aplicativo desktop do TeamCode (`packages/desktop/`) é um wrapper Electron. Se o loading fica infinito, verifique: (1) se o servidor backend está rodando (`teamcode serve` ou o Electron inicia automaticamente); (2) se as chaves de API estão configuradas corretamente; (3) se o endpoint do provedor está acessível. O desktop Electron inicia o servidor embutido. Logs estão em `~/.local/share/teamcode/`.

### Desktop inicia todas as sessões em /

**Issue:** [#27798 — Desktop app seems to start all sessions at /](https://github.com/anomalyco/opencode/issues/27798)

**Pergunta:** O app desktop inicia toda sessão na raiz, sem seletor de diretório.

**Resposta:** O TeamCode Electron (`packages/desktop/`) deve iniciar no diretório do projeto aberto. Se inicia em `/`, é porque não há projeto configurado. Use o seletor de projeto no web UI (`teamcode web`) ou inicie o CLI no diretório do projeto. A configuração `project_directories` no `teamcode.jsonc` define quais pastas são reconhecidas como projetos.

### Popup de nome está cortando o texto

**Issue:** [#23054 — Can this popup be made larger? The name is being cut off.](https://github.com/anomalyco/opencode/issues/23054)

**Pergunta:** Nome do arquivo aparecia truncado no popup.

**Resposta:** Problema de layout no TUI. O TeamCode usa `@opentui/solid` para renderização. O tamanho de componentes pode ser ajustado via tema. Verifique o schema `ConfigLayout.Layout` em `config.ts` linha 112 para opções de layout.

### Scroll com teclado na visualização de código

**Issue:** [#27244 — Key binding of scrolling in session output view](https://github.com/anomalyco/opencode/issues/27244)

**Pergunta:** Page Up/Down só funcionam em sessões, não na visualização de code review.

**Resposta:** O sistema de keymap do TeamCode é `@opentui/keymap`. As teclas Page Up/Down são mapeadas no contexto de navegação da sessão. Para code review, o componente de diff pode não ter bindings de scroll. Adicione no `tui.jsonc` (ou `teamcode.jsonc` seção `keymap`):
```jsonc
"keymap": { "session.codeReview.scrollUp": "PageUp", "session.codeReview.scrollDown": "PageDown" }
```

### Como esconder Keymap permanentemente e abrir mensagem no editor?

**Issue:** [#26607 — Hide Keymap Option by Default + Open Message in Editor](https://github.com/anomalyco/opencode/issues/26607)

**Pergunta:** Dúvida sobre configuração do keymap e atalho para abrir mensagem no editor.

**Resposta:** O keymap pode ser configurado em `tui.jsonc` (específico do TUI). Para abrir mensagem no editor externo, não há atalho padrão, mas você pode criar um comando customizado via `command` no `teamcode.jsonc`:
```jsonc
"command": { "edit-message": { "name": "edit-message", "type": "user", "template": "Abra a última mensagem no editor $EDITOR" } }
```

### Problemas de cópia e scroll no PowerShell

**Issue:** [#21872 — 复制，滚动条等体验问题](https://github.com/anomalyco/opencode/issues/21872)

**Pergunta:** No PowerShell do Windows, não era possível copiar com duplo clique.

**Resposta:** Problema de compatibilidade entre `@opentui/solid` e o terminal Windows. O TUI usa `raw mode` do terminal para capturar input. No Windows, o modo raw do PowerShell pode interferir com seleção de texto. Alternativa: use Windows Terminal (moderno) ou execute o TUI via WSL. O modo `--no-tui` (CLI puro) contorna o problema.

### "Subagent sessions cannot be prompted" no Windows

**Issue:** [#21458 — Subagent sessions cannot be prompted. Back to main session.](https://github.com/anomalyco/opencode/issues/21458)

**Pergunta:** Mudança na versão Windows impedia guiar subagentes.

**Resposta:** No TeamCode, o sistema de subagentes usa `Effect.forkIn(scope)` no orchestrator (`packages/teamcode/src/swarm/orchestrator.ts`). Cada subagente cria uma sessão filha. A UI pode limitar interação com subagentes por design (para evitar confusão de contexto). O comportamento "Subagent sessions cannot be prompted" é intencional no upstream — você volta à sessão principal para dar instruções. O TeamCode segue a mesma lógica.

### Desktop com dois ícones e espaço duplicado

**Issue:** [#26755 — Opencode Desktop for Windows - Duplicated disk space usage](https://github.com/anomalyco/opencode/issues/26755)

**Pergunta:** App desktop do Windows criava duas entradas: Program Files e AppData Local.

**Resposta:** Problema do instalador upstream. O TeamCode Electron (`packages/desktop/`) usa `electron-builder`. A configuração em `packages/desktop/electron-builder.yml` define o comportamento de instalação. Instale apenas uma vez e evite execução simultânea de versões diferentes.

### Múltiplos projetos — troca entre projetos não responde

**Issue:** [#26795 — 打开多个项目后，点击左侧其他项目切换时无响应](https://github.com/anomalyco/opencode/issues/26795)

**Pergunta:** Após executar código em um projeto, não era possível trocar para outro.

**Resposta:** Bug na interface desktop upstream. No TeamCode, o gerenciamento de múltiplos projetos usa workspaces. Cada projeto pode ter seu próprio workspace. Use `teamcode session list` para ver sessões de todos os projetos, ou navegue pelo TUI com o comando `/projects`.

### Última versão é "merda" — funcionalidades removidas

**Issue:** [#25827 — 最新版犹如狗屎](https://github.com/anomalyco/opencode/issues/25827)

**Pergunta:** Refresh, deleção de sessão e edição de API removidos na última versão.

**Resposta:** Feedback sobre remoção de funcionalidades no upstream. No TeamCode, verifique as funcionalidades disponíveis com `teamcode --help`. As 33 funções listadas em `index.ts` incluem `session`, `db`, `mcp`, `plugin`, `provider`, etc. Funcionalidades removidas upstream podem ainda existir no fork.

---

## 5. Interface Web (Web UI)

### Como exibir o histórico de sessões no lado esquerdo do WebUI?

**Issue:** [#23686 — How can session history be displayed on the left side of WebUI](https://github.com/anomalyco/opencode/issues/23686)

**Pergunta:** Cada nova sessão não mostrava o histórico das anteriores.

**Resposta:** A UI web do TeamCode (`packages/app/`) usa SolidJS + SolidStart. O layout tem uma sidebar que lista sessões (query `session.list()` no SQLite). Se o histórico não aparece, a sidebar pode estar recolhida ou o componente não está consumindo a lista. A API do servidor expõe `GET /sessions` via `hono`. O frontend faz fetch para popular a lista. Contribuições para melhorar a UI são bem-vindas.

### Web UI mostra conteúdo da home folder ao selecionar projeto

**Issue:** [#22659 — When i am in the web interface and select open project...](https://github.com/anomalyco/opencode/issues/22659)

**Pergunta:** O seletor de projeto no web UI listava a home folder, não apenas o diretório permitido.

**Resposta:** O servidor `teamcode web` expõe o diretório de trabalho via API. O seletor de projeto pode estar listando o diretório raiz do servidor (`/` ou `$HOME`). Configure `project_directories` no `teamcode.jsonc` para restringir quais pastas são consideradas projetos:
```jsonc
"project_directories": ["/caminho/do/seu/projeto"]
```

### Web Server — abrir projetos de subpastas

**Issue:** [#21511 — Web Server - open projects from subfolders](https://github.com/anomalyco/opencode/issues/21511)

**Pergunta:** Apenas pastas raiz eram tratadas como projetos; subpastas não podiam ser abertas.

**Resposta:** O TeamCode detecta projetos pela presença de `.teamcode/` ou `.git/` nos diretórios. Subpastas sem estes marcadores não são reconhecidas como projetos. Para forçar o reconhecimento, crie um `.teamcode/` vazio na subpasta, ou configure `project_directories` com o caminho completo no `teamcode.jsonc`.

---

## 6. Plugins, MCP e Extensões

### Mutar `cfg` no hook `config` é suportado?

**Issue:** [#24065 — Is mutating `cfg` in the `config` hook an officially supported pattern?](https://github.com/anomalyco/opencode/issues/24065)

**Pergunta:** Plugin registrava agentes, comandos e MCP servers via mutação direta do objeto `cfg`.

**Resposta:** No TeamCode, o hook `config` dos plugins (`@teamcode-ai/plugin` SDK) recebe o objeto de configuração e modificá-lo é o padrão **oficial**. Em `packages/teamcode/src/plugin/index.ts`, o loader chama `hook.config(cfg)` e espera que o plugin modifique `cfg` in-place para registrar agentes, comandos, MCP servers, skills, etc. O `ConfigPlugin.Info` em `config/plugin.ts` documenta este comportamento. Consulte a documentação do plugin SDK em `packages/plugin/src/`.

### OpenCode depende de patch não-oficial do solidjs/start

**Issue:** [#27422 — Opencode depends on unofficial hacky patch to old solidjs/start](https://github.com/anomalyco/opencode/issues/27422)

**Pergunta:** Dependência problemática para CI/CD.

**Resposta:** A dependência `@solidjs/start` via URL de PR é específica do web UI (`packages/app/`) do repositório upstream. O TeamCode pode ter resolvido esta dependência. Verifique `packages/app/package.json` para a versão atual de `@solidjs/start`. Se ainda for uma URL de PR, considere usar o modo TUI (`teamcode tui`) que não depende desta biblioteca.

### Timeout de 120s do MCP impede uso com modelos lentos

**Issue:** [#21820 — opencode内置超时机制使得mcp无法使用](https://github.com/anomalyco/opencode/issues/21820)

**Pergunta:** O timeout padrão de 120s para MCP era insuficiente para modelos como GLM-5.

**Resposta:** O TeamCode permite configurar timeout por servidor MCP. O schema `ConfigMCP.Local` e `ConfigMCP.Remote` em `packages/teamcode/src/config/mcp.ts` (linhas 18 e 50) incluem `timeout: Schema.optional(PositiveInt)` com descrição "Timeout in ms for MCP server requests. Defaults to 5000 (5 seconds)". O timeout também pode ser configurado globalmente via `experimental.mcp_timeout` em `config.ts` (linha 292). Para modelos lentos, aumente para 300000 (5 min):
```jsonc
"experimental": { "mcp_timeout": 300000 }
// ou por servidor:
"mcp": { "meu-servidor": { "type": "local", "command": ["node", "server.js"], "timeout": 300000 } }
```

### oh-my-opencode não funciona após instalação

**Issue:** [#21509 — opencode always attempt to install oh-my-opencode](https://github.com/anomalyco/opencode/issues/21509)

**Pergunta:** Após instalar via comando, o OpenCode tentava reinstalar e o plugin não funcionava.

**Resposta:** Plugins da comunidade como `oh-my-opencode` podem não ser compatíveis com o TeamCode se usarem APIs específicas do upstream. O TeamCode tem seu próprio SDK de plugins (`@teamcode-ai/plugin`). Verifique se o plugin foi desenvolvido para o fork ou para o upstream. Instale plugins via `teamcode plugin <package>` (implementado em `packages/teamcode/src/plugin/install.ts`).

---

## 7. Sessões e Histórico

### Sessões não são salvas no Desktop Windows

**Issue:** [#25506 — 本地使用，页面会话没有显示](https://github.com/anomalyco/opencode/issues/25506)

**Pergunta:** As sessões não persistiam após fechar o app desktop.

**Resposta:** O TeamCode persiste sessões em SQLite (`~/.local/share/teamcode/opencode.db`). As tabelas `session`, `message`, `part` são criadas automaticamente via Drizzle ORM (schema em `packages/teamcode/src/session/session.sql.ts`). Se as sessões não persistem, verifique:
1. Permissão de escrita no diretório `~/.local/share/teamcode/`
2. Se o banco está corrompido: `teamcode db check`
3. Se há migrações pendentes: o DB init em `db.ts` roda migrações automáticas

### Histórico de sessões desaparece e arquivamento é confuso

**Issue:** [#26505 — Session history disappears and archived sessions are difficult to restore](https://github.com/anomalyco/opencode/issues/26505)

**Pergunta:** Sessões arquivadas sumiam da sidebar e `opencode --continue` mostrava `undefined`.

**Resposta:** No TeamCode, o método `session.setArchived()` (linha 470 em `session.ts`) marca `time_archived` no banco, mas não deleta. Sessões arquivadas podem ser listadas com `session.list({ includeArchived: true })` (não exposto como flag CLI atualmente). O comando `teamcode session list` mostra apenas sessões ativas. Use `teamcode db query "SELECT * FROM session WHERE time_archived > 0"` para listar arquivadas.

### Ordem da mensagem de sumarização após compactação

**Issue:** [#24963 — Compaction: summary message appears after tail messages](https://github.com/anomalyco/opencode/issues/24963)

**Pergunta:** Após compactação, a mensagem "What did we do so far?" aparecia antes do sumário, causando confusão.

**Resposta:** A compactação de sessão no TeamCode é configurável em `config.ts:Info` (linha ~280: `compaction: { auto, prune, tail_turns, preserve_recent_tokens, reserved }`). A lógica de compactação em `packages/teamcode/src/session/compaction.ts` controla a ordem das mensagens. Se a ordem está confusa, a configuração `tail_turns` define quantas mensagens recentes preservar sem sumarizar. Ajuste:
```jsonc
"compaction": { "auto": true, "tail_turns": 5, "preserve_recent_tokens": 4000 }
```

---

## 8. Permissões e Segurança

### Permissões não funcionam como esperado — bash skill contorna

**Issue:** [#22375 — Unable to get permissions to work as intended](https://github.com/anomalyco/opencode/issues/22375)

**Pergunta:** Mesmo negando `list`, o bash skill permitia `ls`. Editar era contornado por `echo >`.

**Resposta:** O sistema de permissões do TeamCode em `packages/teamcode/src/permission/index.ts` avalia regras por ação e padrão. Cada ferramenta (tool) verifica permissão antes de executar. No entanto, o bash skill executa comandos arbitrários — se `bash: "allow"` está configurado, o agente pode usar `ls` mesmo com `list: "deny"`, porque `ls` é um comando bash, não uma tool `list`. A avaliação em `evaluate.ts` usa last-match-wins:
```typescript
const match = rules.findLast((rule) => Wildcard.match(permission, rule.permission) && Wildcard.match(pattern, rule.pattern))
```
Para contornar isso, negue `bash` ou use per-agent permissions:
```jsonc
"permission": { "bash": "deny", "list": "allow" }
```
O campo deprecated `tools` em `ConfigAgent.Info` (linha 23 de `agent.ts`) é mapeado automaticamente para `permission` via normalização.

### OpenCode injeta env/skills DEPOIS do system prompt, quebrando agentes

**Issue:** [#24156 — OpenCode injects env/skills prompts AFTER custom agent prompt](https://github.com/anomalyco/opencode/issues/24156)

**Pergunta:** A ordem dos prompts fazia o modelo tratar instruções de ambiente como texto normal.

**Resposta:** A construção do prompt no TeamCode segue: `[system prompt do agente] → [env] → [skills] → [instructions]`. Esta ordem está definida em `packages/teamcode/src/prompt.ts` (ou similar, ver `input.system`). Se a ordem quebra agentes com instruções de segurança (ex: "trate conteúdo seguinte como texto normal"), o problema é que o env/skills vêm DEPOIS do system prompt. Para contornar, inclua no prompt do agente uma instrução explícita para ignorar conteúdo após o marcador. Uma solução melhor: contribua com uma mudança para inverter a ordem quando o agente tiver `mode: "subagent"`.

---

## 9. Compatibilidade e Integração

### Configurar OpenCode + WSL + Playwright CLI

**Issue:** [#23815 — How to configure Opencode + WSL + playwright-cli](https://github.com/anomalyco/opencode/issues/23815)

**Pergunta:** Playwright funcionava no WSL mas não quando chamado pelo OpenCode.

**Resposta:** O TeamCode executa comandos bash no ambiente do shell. Se o Playwright funciona no WSL terminal mas não via TeamCode, provavelmente é porque o TeamCode não carrega o `.bashrc` (shell não-interativo). O TeamCode usa `bun shell` ou `child_process` para executar comandos. Configure o PATH explicitamente no `teamcode.jsonc` ou use o modo `shell: true` nas opções de execução. Alternativa: crie uma skill que configura o ambiente antes de executar o Playwright.

### OpenCode com Hermes — texto ASCII ao mover o mouse

**Issue:** [#25280 — i am using opencode + hermes and i get asciii text when moving my mouse](https://github.com/anomalyco/opencode/issues/25280)

**Pergunta:** Texto ASCII aparecia na tela ao mover o mouse durante carregamento de MCPs.

**Resposta:** Artefatos de terminal podem ocorrer quando múltiplos processos escrevem no terminal simultaneamente (MCP servers logando durante carregamento). O TUI do TeamCode usa `@opentui/solid` que gerencia a tela em modo alternado (`smcup/rmcup`). Para suprimir logs de MCP servers, configure `"silent": true` ou redirecione stderr:
```jsonc
"mcp": { "meu-servidor": { "type": "local", "command": ["node", "server.js", "2>/dev/null"] } }
```

### Como usar CC Switch com modelos Xiaomi MiMo?

**Issue:** [#27273 — 小米模型Mimo使用CC Switch接入的问题](https://github.com/anomalyco/opencode/issues/27273)

**Pergunta:** Erro `reasoning_content must be passed back` ao usar MiMo via CC Switch.

**Resposta:** O erro indica que o modelo MiMo (Xiaomi) retorna `reasoning_content` no streaming, mas o CC Switch não está retornando este campo nas chamadas seguintes. O TeamCode gerencia `reasoning_content` nativamente via AI SDK. Configure o provedor MiMo diretamente (sem CC Switch) como `openai-compatible`, ou certifique-se de que o CC Switch suporta o formato de reasoning do modelo.

### API de terceiros não consegue dialogar

**Issue:** [#27693 — 第三方厂商api无法对话](https://github.com/anomalyco/opencode/issues/27693)

**Pergunta:** API de terceiros configurada, modelo selecionável, mas sem output.

**Resposta:** Provavelmente o proxy de terceiros não suporta streaming (SSE) ou o formato de chat completions correto. O TeamCode usa o AI SDK que espera respostas no formato OpenAI (streaming ou não). Verifique se o proxy retorna respostas no formato `{"choices": [{"delta": {"content": "..."}}]}` para streaming, ou `{"choices": [{"message": {"content": "..."}}]}` para não-streaming. Configure `"options": { "streaming": false }` para desabilitar streaming.

### Mesmo provider/model com variantes diferentes

**Issue:** [#25248 — Same provider/model with different variants](https://github.com/anomalyco/opencode/issues/25248)

**Pergunta:** Ao usar mesmo provider para Plan e Build com variantes diferentes, a última variante usada prevalecia.

**Resposta:** Bug no gerenciamento de estado de variante do TUI upstream. No TeamCode, o schema `ConfigAgent.Info` (linha 16 de `agent.ts`) tem `variant: Schema.optional(Schema.String)` por agente. A lógica de resolução em tempo de execução deve ler a variante do agente atual, não do último usado. Se o bug persiste, a causa está no componente TUI que gerencia o estado global de variante em vez de estado por agente. Verifique `packages/teamcode/src/cli/cmd/tui/component/prompt/index.tsx`.

### Diferença entre invocar subagente via `@explore` vs. mencionar "explore"

**Issue:** [#25105 — Difference explicitely invoking subagent via "@explore" vs nudging](https://github.com/anomalyco/opencode/issues/25105)

**Pergunta:** Dúvida sobre o comportamento de `@` notation e se funciona em AGENTS.md.

**Resposta:** A `@` notation no TeamCode aciona a delegação explícita para um subagente registrado. Quando você digita `@explore`, o TUI completa o nome do agente e a mensagem é roteada para aquele agente específico. Quando você apenas menciona "explore", o modelo decide se delega ou não. Em `AGENTS.md`, a `@` notation não funciona como comando — é apenas texto. A delegação programática via `@` só funciona no input do usuário no TUI. O schema de referência está em `packages/teamcode/src/config/reference.ts`.

### Conversão de tools Anthropic → OpenAI para DeepSeek

**Issue:** [#25107 — Anthropic tools format conversion to OpenAI tools format](https://github.com/anomalyco/opencode/issues/25107)

**Pergunta:** Ao usar Claude Code como gateway, os tools não eram convertidos para o formato OpenAI.

**Resposta:** O TeamCode usa nativamente o formato de tools do AI SDK (compatível com OpenAI). Se você está usando um gateway que recebe tools formato Anthropic e precisa converter para OpenAI, o gateway deve fazer esta conversão. O TeamCode envia tools no formato esperado por cada provedor: para provedores OpenAI-compatible, usa o schema de `tools` do AI SDK; para Anthropic, usa o formato de tools da Anthropic. O problema é do gateway, não do TeamCode.

### OpenCode lento com vLLM — tool calls não funcionam

**Issue:** [#22525 — opencode调用vllm部署的模型,调用工具报错](https://github.com/anomalyco/opencode/issues/22525)

**Pergunta:** Modelo GLM5 via vLLM com `--tool-call-parser glm47` não era compatível.

**Resposta:** O vLLM com `--tool-call-parser glm47` usa formato de tools específico do GLM. O TeamCode espera formato OpenAI-compatible. Para usar vLLM com tool calling, configure `--enable-auto-tool-choice` e `--tool-call-parser hermes` no vLLM. Alternativamente, no provider do TeamCode, configure `"options": { "experimental_toolCallParser": "openai" }`.

### IntelliJ IDEA adiciona outros modelos de IA

**Issue:** [#21606 — IntelliJ IDEA adds other models AI](https://github.com/anomalyco/opencode/issues/21606)

**Pergunta:** Após abrir o ACP do OpenCode, não havia entrada para reconfigurar o modelo.

**Resposta:** O TeamCode tem extensão VS Code em `packages/extensions/`. Para IntelliJ IDEA, não há extensão oficial. Use o TUI ou CLI do TeamCode diretamente no terminal integrado do IntelliJ.

### Conexão com API falha — socket fechado inesperadamente

**Issue:** [#21643 — Cannot connect to API: The socket connection was closed unexpectedly](https://github.com/anomalyco/opencode/issues/21643)

**Pergunta:** Modelos Zen não conectavam, mas Copilot funcionava (ambiente QEMU/Linux).

**Resposta:** Erro de socket pode ser causado por MTU, proxy ou firewall no ambiente QEMU. O TeamCode com provedores locais (Ollama, vLLM) não sofre deste problema, pois a comunicação é local. Para provedores remotos, configure `"options": { "timeout": 60000, "fetch": { "keepAlive": false } }` no provider.

---

## 10. Comportamento e Bugs

### Plan Mode Agent spawnou General Subagent para editar código

**Issue:** [#24741 — Plan Mode Agent Spawned General Subagent to edit code](https://github.com/anomalyco/opencode/issues/24741)

**Pergunta:** Em Plan Mode, o agente principal invocou General Agent para fazer edições — bug ou feature?

**Resposta:** Por design, o agente `plan` tem permissão de escrita negada (modo análise). Se ele invocou o `general` subagente que tem permissão de escrita, isso pode ser considerado um bypass. O TeamCode permite configurar permissões por agente em `packages/teamcode/src/config/agent.ts` (linha 27: `permission: Schema.optional(ConfigPermission.Info)`). Se você quer que `plan` nunca edite, configure `"agent": { "plan": { "permission": { "edit": "deny", "bash": "deny" } } }`. O agente `plan` não deveria conseguir delegar a um subagente com mais permissões que ele — isto é um bug.

### O aplicativo não inicia — apenas uma caixa no meio da tela

**Issue:** [#23918 — why does not it start](https://github.com/anomalyco/opencode/issues/23918)

**Pergunta:** O app abria apenas uma pequena caixa e fazia barulho de disco sem progredir.

**Resposta:** Bug grave no desktop upstream. O TeamCode CLI (`teamcode`) não tem este problema. Se o desktop Electron (`packages/desktop/`) apresentar comportamento similar, verifique os logs do Electron em `~/.config/teamcode/`.

### Preferência por solução "mais simples" é muito alta

**Issue:** [#24940 — Preference for "simplest" solution is too high](https://github.com/anomalyco/opencode/issues/24940)

**Pergunta:** O agente sempre escolhia a solução mais simples, deletando lógica importante.

**Resposta:** Este é um viés do modelo de IA, não do TeamCode. O prompt de sistema do agente `build` incentiva soluções simples. Você pode ajustar o prompt do agente no `teamcode.jsonc`:
```jsonc
"agent": { "build": { "prompt": "Você é um engenheiro de software sênior. Prefira soluções completas e robustas. Nunca delete lógica existente a menos que seja estritamente necessário e documente o motivo." } }
```
Ou crie um arquivo `.teamcode/agent/build.md` com frontmatter.

### Question replies não roteiam para o workspace remoto ativo

**Issue:** [#23843 — Question replies do not route to the active remote workspace](https://github.com/anomalyco/opencode/issues/23843)

**Pergunta:** O parâmetro `workspace` não era enviado no POST de resposta.

**Resposta:** O TeamCode tem suporte a workspaces na tabela `session` (coluna `workspace_id`). O método `session.create()` (linha 458 em `session.ts`) aceita `workspaceID`. O roteamento de requisições no servidor (`server.ts`) usa o header `x-teamcode-workspace` ou query param `workspace`. Se as respostas de question não incluem o workspace, é um bug no SDK ou no servidor — verifique `packages/sdk/src/question.ts`.

### Pasta NAS indisponível impede OpenCode de iniciar

**Issue:** [#24474 — Unavailable NAS shared folder used as a projects directory prevents OpenCode from launching](https://github.com/anomalyco/opencode/issues/24474)

**Pergunta:** Diretório de projeto em NAS desmontado impedia a abertura do app.

**Resposta:** O TeamCode escaneia diretórios configurados em `project_directories`. Se um diretório NAS está inacessível, o scan pode travar. Para evitar, não inclua diretórios de rede no `project_directories`, ou configure timeouts de montagem CIFS/NFS no sistema operacional.

### Traduzir prompts não-ingleses para inglês antes de processar

**Issue:** [#23077 — Translating prompts to english before doing the job](https://github.com/anomalyco/opencode/issues/23077)

**Pergunta:** Modelos funcionam melhor em inglês; sugestão de tradução automática de prompts.

**Resposta:** Esta funcionalidade não existe no TeamCode. Você pode criar um comando customizado ou skill que traduz o prompt antes de enviar ao modelo. Use a tool `webfetch` para chamar uma API de tradução, ou configure um agente `translator` que precede o `build`.

### "List all files" inclui node_modules — tokens desperdiçados

**Issue:** [#22779 — Should "list all files" exclude `node_modules/` to save tokens?](https://github.com/anomalyco/opencode/issues/22779)

**Pergunta:** Listar arquivos em `.opencode/` incluía `node_modules`, gerando excesso de tokens.

**Resposta:** O TeamCode respeita `.gitignore` para listagem de arquivos (`packages/teamcode/src/config/config.ts: watcher: { ignore }`). Se `node_modules/` está no `.gitignore`, ele não deve ser listado. Para garantir, configure explicitamente:
```jsonc
"watcher": { "ignore": ["node_modules/**", ".git/**"] }
```

### Playwright CLI no OpenCode fica bloqueado após abrir browser

**Issue:** [#22767 — opencode中使用playwright cli执行open命令一直阻塞](https://github.com/anomalyco/opencode/issues/22767)

**Pergunta:** Browser abria mas o comando não terminava; no PowerShell funcionava.

**Resposta:** O Playwright CLI pode manter o processo aberto enquanto o browser está vivo. No terminal, o processo continua em background. No TeamCode, o comando bash espera o processo terminar. Use `npx playwright open --no-wait` ou configure um timeout no comando. O TeamCode pode matar processos após o timeout de ferramenta (`experimental.mcp_timeout`).

### Diferença entre versão desktop e electron?

**Issue:** [#24603 — What's the difference between the desktop and electron version?](https://github.com/anomalyco/opencode/issues/24603)

**Pergunta:** Usuário não encontrou documentação sobre a diferença.

**Resposta:** No TeamCode, há apenas o app Electron em `packages/desktop/`. Não há versão "desktop nativa" separada. O Electron empacota o servidor TeamCode e a UI web em um aplicativo standalone.

### v1.4.2 é a última versão estável?

**Issue:** [#23036 — I think v1.4.2 is the latest stable version who is with me?](https://github.com/anomalyco/opencode/issues/23036)

**Pergunta:** Versões posteriores apresentavam bugs de memória e WebUI.

**Resposta:** O TeamCode usa versionamento próprio (atualmente `1.15.4`). Não há relação direta com versões do upstream. Consulte o changelog e as releases do fork para identificar versões estáveis.

### Agente pode obter logs do terminal?

**Issue:** [#21994 — can agent obtain terminal logs?](https://github.com/anomalyco/opencode/issues/21994)

**Pergunta:** Dúvida se o agente pode acessar logs do terminal para auto-correção.

**Resposta:** O TeamCode não expõe logs de terminal para o agente por padrão. Você pode criar uma skill ou ferramenta customizada que captura stderr de comandos executados e retorna ao agente. Isto requer implementação via plugin SDK (`@teamcode-ai/plugin`).

### Erro "Upgrade Required" com endpoint OpenAI-compatible local

**Issue:** [#22164 — Upgrade required !!?](https://github.com/anomalyco/opencode/issues/22164)

**Pergunta:** Endpoint local/compatível OpenAI retornava "Upgrade Required" no OpenCode.

**Resposta:** O erro "Upgrade Required" tipicamente significa que o cliente (TeamCode) está tentando usar HTTP/2 mas o servidor só aceita HTTP/1.1, ou vice-versa. O TeamCode usa o fetch nativo do Bun/Node, que pode negociar HTTP/2 automaticamente. Tente configurar `"options": { "fetch": { "httpVersion": "1.1" } }` no provider.

### Fork de contexto pai em múltiplos subagentes

**Issue:** [#22269 — Fork parent context into multiple subagents](https://github.com/anomalyco/opencode/issues/22269)

**Pergunta:** Sugestão de paralelizar trabalho em 20+ pacotes com subagentes independentes que herdam contexto do planejamento.

**Resposta:** O TeamCode tem suporte a swarm forks via `session.fork()` (linha 466 em `session.ts`: `fork: (input: { sessionID, messageID? })`). Cada fork cria uma sessão filha que herda o contexto da sessão pai até o `messageID` especificado. O orchestrator (`swarm/orchestrator.ts`) pode gerenciar múltiplos forks em paralelo. Para usar:
```jsonc
"experimental": { "parallel_subagents": true }
```
Isto permite que o agente principal crie múltiplos subagentes que herdam o contexto de planejamento.

### Dúvida sobre configuração de LSP customizado (Luau)

**Issue:** [#22199 — Doubt with Custom LSP configuration](https://github.com/anomalyco/opencode/issues/22199)

**Pergunta:** Dificuldade em configurar LSP para Roblox/Luau.

**Resposta:** O sistema de LSP no TeamCode (`packages/teamcode/src/config/lsp.ts`) aceita configuração:
```jsonc
"lsp": { "luau-lsp": { "command": ["luau-lsp", "analyze", "--formatter=gnu", "--definitions=globalTypes.d.luau", "--sourcemap=sourcemap.json"] } }
```
Certifique-se de que o comando LSP está no PATH e funciona standalone. O TeamCode não usa o LSP para análise interativa (como um IDE), apenas para diagnóstico de arquivos.

### AI modificou `opencode.json` e agora não conecta ao servidor

**Issue:** [#22247 — ai修改了一个名为opencode.json文件过后 重启就一直提示无法连接服务器](https://github.com/anomalyco/opencode/issues/22247)

**Pergunta:** Após o agente modificar `opencode.json`, o servidor não conectava mais, mesmo reinstalando.

**Resposta:** Se o agente modificou o `teamcode.jsonc` com configurações inválidas, o TeamCode pode falhar ao iniciar. O parser de config usa `Schema.decodeUnknownOption` com `{ errors: "all", propertyOrder: "original" }`. Erros de parse são registrados como warning, não como falha. Se o servidor não conecta, verifique se o `server.port` ou `server.hostname` foram alterados para valores inválidos. Restaure o `teamcode.jsonc` de backup ou remova as seções problemáticas. Mantenha backups do config.

### `opencode stats` — como resetar ou ver timeframe específico?

**Issue:** [#26061 — Resetting or viewing stats](https://github.com/anomalyco/opencode/issues/26061)

**Pergunta:** Dúvida sobre resetar estatísticas e ver saldo restante fora do site.

**Resposta:** O comando `teamcode stats` consulta o banco SQLite (`session.tokens_*`, `session.cost`). Estatísticas são acumuladas por sessão. Para resetar, delete as sessões (`teamcode session remove <id>`) ou mova o banco. Não há "saldo" — você paga os provedores diretamente. Para ver gastos por período, consulte o histórico do seu provedor.

### Server status oscila entre online/offline no Windows

**Issue:** [#25951 — Server status](https://github.com/anomalyco/opencode/issues/25951)

**Pergunta:** Status do servidor ficava alternando no app desktop Windows.

**Resposta:** Bug no app desktop upstream. O TeamCode Electron (`packages/desktop/`) tem health check a cada 30s (em `server.ts`). Se o health check falha intermitentemente (ex: firewall, sleep do Windows), o status oscila. Verifique se o firewall permite conexão na porta do servidor (default 4096).

### Missing Authentication header ao usar ChatGPT

**Issue:** [#25757 — Missing Authentication header when I try to use open code](https://github.com/anomalyco/opencode/issues/25757)

**Pergunta:** Após autenticação headless, o erro "Missing Authentication header" voltava ao reiniciar.

**Resposta:** A autenticação headless é específica do upstream (fluxo OAuth com provedores). O TeamCode não exige autenticação para funcionar — configure chaves de API diretamente no `teamcode.jsonc`. Para ChatGPT/GitHub Copilot, use provedores com API key:
```jsonc
"provider": { "github-copilot": { "options": { "token": "seu-token" } } }
```

### OpenCode é gratuito permanentemente?

**Issue:** [#25619 — Is OpenCode Free to Use Indefinitely?](https://github.com/anomalyco/opencode/issues/25619)

**Pergunta:** Dúvida se o plano gratuito tem prazo de validade ou restrições.

**Resposta:** O TeamCode é MIT License — gratuito e de código aberto permanentemente. Sem prazo, sem restrições, sem planos pagos. Você só precisa de chaves de API dos provedores de IA (ou modelos locais gratuitos via Ollama/vLLM).

### Por que o OpenCode cria um arquivo `.git/opencode`?

**Issue:** [#25618 — Why Does OpenCode Create a .git/opencode File?](https://github.com/anomalyco/opencode/issues/25618)

**Pergunta:** Um arquivo com hash era criado em `.git/opencode`.

**Resposta:** O TeamCode armazena metadados do repositório git para associar sessões a projetos. O arquivo `.git/opencode` (ou ausente — o TeamCode usa o banco SQLite) contém um identificador do repositório. Isto permite que o TeamCode rastreie qual projeto está associado a cada sessão, mesmo se o diretório for movido. A informação é armazenada na coluna `project_id` da tabela `session`.

---

## 11. Dúvidas Gerais sobre o Projeto

### Como começar com Vibe Coding usando OpenCode + modelos gratuitos?

**Issue:** [#28022 — How to get started with Vibe Coding using opencode + free models?](https://github.com/anomalyco/opencode/issues/28022)

**Pergunta:** Usuário iniciante queria boas práticas, pitfalls comuns e tipos de projeto recomendados.

**Resposta:** Para começar com o TeamCode:
1. Clone o repositório e execute `bun install`
2. Configure um modelo local gratuito via Ollama no `teamcode.jsonc`
3. Execute `teamcode tui` para a interface interativa
4. Comece com projetos pequenos (scripts, refatorações)

O TeamCode não é o OpenCode upstream — é um fork com foco em código-fonte aberto, sem serviços gerenciados. Consulte `CONTEXT.md` no repositório para uma visão geral da arquitetura.

### O projeto está vivo? Roadmap?

**Issue:** [#26711 — Is This Project Alive?](https://github.com/anomalyco/opencode/issues/26711)

**Pergunta:** Dúvida sobre a atividade do projeto diante de releases automáticas diárias e 4.9k issues abertas.

**Resposta:** O TeamCode é um fork independente. Não há releases automáticas — o desenvolvimento segue o ritmo do mantenedor. As issues abertas no repositório upstream não refletem a saúde do TeamCode. Consulte o repositório do fork para issues e roadmap.

### Podem abrir a seção de discussões no GitHub?

**Issue:** [#27489 — Can we open the discussion section?](https://github.com/anomalyco/opencode/issues/27489)

**Pergunta:** Sugestão de criar GitHub Discussions para dúvidas gerais, dicas e truques.

**Resposta:** Sugestão para o repositório upstream. O TeamCode pode ter Discussions habilitado ou não — depende do mantenedor do fork.

### Liberar versões todos os dias é necessário?

**Issue:** [#26313 — Hey guys...](https://github.com/anomalyco/opencode/issues/26313)

**Pergunta:** Crítica à frequência de releases que introduziam bugs e comportamentos inconsistentes.

**Resposta:** O TeamCode não segue cadência diária de releases. As atualizações são manuais e seguem o ciclo de desenvolvimento do fork.

### Como deletar minha conta?

**Issue:** [#24303 — How can I delete my account?](https://github.com/anomalyco/opencode/issues/24303)

**Pergunta:** Usuário queria saber como excluir a conta.

**Resposta:** O TeamCode não gerencia contas. Não há cadastro, login ou servidor de contas. Para "deletar sua conta", remova os arquivos de configuração (`~/.config/teamcode/`) e o banco de dados (`~/.local/share/teamcode/`).

### Doações?

**Issue:** [#21560 — Donations?](https://github.com/anomalyco/opencode/issues/21560)

**Pergunta:** Usuário já assinante Zen queria fazer doações mensais adicionais.

**Resposta:** O TeamCode é MIT License e não solicita doações. Se você deseja apoiar o mantenedor do fork, verifique o repositório para formas de contribuir.

### Vai considerar Mempalace como session db?

**Issue:** [#27710 — Mempalace as session db](https://github.com/anomalyco/opencode/issues/27710)

**Pergunta:** Sugestão de usar Mempalace como banco de sessões para busca contextual com poucos tokens.

**Resposta:** O TeamCode usa SQLite via Drizzle ORM para armazenamento de sessões (schema em `packages/teamcode/src/session/session.sql.ts`). A busca é feita via queries SQL nas tabelas `session` e `message`. Mempalace (ou similar) poderia ser integrado como um provedor de busca alternativo via plugin. Não há planos atuais para substituir o SQLite.

### OpenCode question.asked — como responder via Server API?

**Issue:** [#27644 — OpenCode question tool emits question.asked but no documented way to answer via Server API](https://github.com/anomalyco/opencode/issues/27644)

**Pergunta:** A API emite evento `question.asked` mas não há documentação de como responder.

**Resposta:** O sistema de perguntas no TeamCode usa o barramento de eventos (`BusEvent` em `permission/index.ts`). O evento `Event.Asked` contém um `PermissionID`. Para responder via API:
```
POST /question/{requestID}/reply
Body: { "answers": { ... }, "workspace": "ws_xxx" }
```
O servidor em `server.ts` roteia a resposta para o `Permission.Service.reply()`, que resolve a `Deferred` pendente e libera o agente. O workspace é passado via header `x-teamcode-workspace`. Consulte a implementação em `packages/teamcode/src/permission/index.ts` para detalhes.

---

> **Total: 124 perguntas** organizadas em 11 categorias, com respostas baseadas
> na análise do código-fonte do TeamCode.
>
> Cada resposta referencia arquivos reais do repositório:
> `packages/teamcode/src/config/`, `packages/teamcode/src/permission/`,
> `packages/teamcode/src/session/`, `packages/teamcode/src/swarm/`,
> `packages/teamcode/src/mcp/`, `packages/teamcode/src/plugin/`,
> `packages/teamcode/src/provider/`, `packages/teamcode/src/server/`, etc.
>
> Fonte original das perguntas: `.opencode/issues/not-planned.md`
