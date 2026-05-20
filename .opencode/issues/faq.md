# ❓ FAQ — Perguntas Classificadas como "Não Planejadas"

> Este documento reúne **124 perguntas de usuários** do repositório upstream
> [anomalyco/opencode](https://github.com/anomalyco/opencode) que foram
> classificadas como fora do escopo do fork TeamCode.
>
> **Fonte original:** `.opencode/issues/not-planned.md`
>
> As perguntas estão organizadas por tema para facilitar a consulta.
> Cada entrada inclui o número da issue original, um resumo da pergunta
> e um link para a discussão completa no GitHub.

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
> O usuário queria encontrar a configuração padrão dos agentes no `opencode.json`, mas não conseguia localizá-la — ela é hardcoded.

### Qual é a última versão do opencode CLI?

**Issue:** [#27876 — what is he last version of opencode cli?](https://github.com/anomalyco/opencode/issues/27876)
> O CLI notificava sobre uma atualização, mas mesmo após instalar o `.deb` mais recente a versão do CLI não atualizava.

### É seguro atualizar o OpenCode durante um ataque supply chain?

**Issue:** [#27646 — Is it safe to update Opencode these few days?](https://github.com/anomalyco/opencode/issues/27646)
> Preocupação com segurança devido a um ataque supply chain amplamente noticiado.

### Como recuperar uma sessão deletada acidentalmente?

**Issue:** [#23468 — How to recover a mistakenly deleted session](https://github.com/anomalyco/opencode/issues/23468)
> O comando `/sessions` + `Ctrl+d` deleta a sessão. O usuário queria saber como recuperá-la.

### Por que o OpenCode instala pacotes de plugin automaticamente?

**Issue:** [#26462 — Why OpenCode automatic install plugin packages?](https://github.com/anomalyco/opencode/issues/26462)
> Ao abrir o OpenCode, ele instala `@opencode-ai/plugin` em um subdiretório `./basic`, o que gerou dúvida.

### Por que o Workspace precisa ser vinculado a um diretório específico?

**Issue:** [#23424 — Why must a workspace be forcibly bound to a specific directory?](https://github.com/anomalyco/opencode/issues/23424)
> O usuário sugeria que workspaces deveriam ser coleções de ideias, e não pastas físicas.

### Como fazer o OpenCode lembrar o modelo Plan/Build configurado?

**Issue:** [#26144 — How to make Opencode TUI remember your Build/Plan model?](https://github.com/anomalyco/opencode/issues/26144)
> Após fechar e reabrir o OpenCode, os modelos Plan e Build voltavam ao padrão.

### O que aconteceu com o opencode-cli TUI?

**Issue:** [#25879 — What happened to the opencode-cli TUI?](https://github.com/anomalyco/opencode/issues/25879)
> Após atualizar o pacote debian, o binário `opencode-cli` não existia mais.

### Como saber se estou usando o OpenCode via npm ou bun?

**Issue:** [#23055 — how do i know what way i launch opencode after i use npm and bun both](https://github.com/anomalyco/opencode/issues/23055)
> Múltiplas instalações do `opencode` no `$PATH` — o usuário não sabia qual estava sendo executada.

### Por que a instalação do Desktop não permite escolher o diretório?

**Issue:** [#26791 — 为什么安装路径不能自己指定了](https://github.com/anomalyco/opencode/issues/26791)
> A versão desktop agora instala sempre em `User Local` sem opção de escolha.

### Como instalar o OpenCode offline no Windows 10?

**Issue:** [#23005 — opencode如何在win10系统上离线安装呢](https://github.com/anomalyco/opencode/issues/23005)
> Pergunta sobre instalação offline.

---

## 2. Modelos e Provedores

### Como desabilitar o modo Thinking do DeepSeek V4 Flash?

**Issue:** [#27555 — How to disable DeepSeek V4 Flash Thinking mode in OpenCode?](https://github.com/anomalyco/opencode/issues/27555)
> O usuário usava a API key do OpenCode Go no Immersive Translate e queria desabilitar o modo reasoning.

### Por que o OpenCode exibe linhas selecionadas e o arquivo atual no VSCode?

**Issue:** [#27420 — Why does OpenCode display the selected lines...](https://github.com/anomalyco/opencode/issues/27420)
> Comparação com a extensão Claude Code do VSCode.

### O que significa o erro "VirusFound"?

**Issue:** [#26904 — What does VirusFound mean?](https://github.com/anomalyco/opencode/issues/26904)
> Erro misterioso ao usar o provedor Copilot (GPT 5.4).

### Como usar as APIs NVIDIA NIM com OpenCode?

**Issue:** [#26876 — How can I use the Nvidia NIM Apis with Opencode](https://github.com/anomalyco/opencode/issues/26876)
> Dúvida sobre compatibilidade com NVIDIA NIM.

### Por que o modelo GLM-5V-Turbo foi removido?

**Issue:** [#24672 — Why the Vision Mode Model GLM-5V-Turbo was deleted from ZAI?](https://github.com/anomalyco/opencode/issues/24672)
> Modelo de visão sumiu após atualização.

### Como mostrar o Chain-of-Thought (CoT) no web UI?

**Issue:** [#24583 — How to show the CoT in opencode web?](https://github.com/anomalyco/opencode/issues/24583)
> O TUI mostra o pensamento por padrão, mas o web UI não.

### Como modificar os agentes Plan e Build para passar `chat_template_kwargs`?

**Issue:** [#23995 — How to modify Plan and Build agents to pass chat_template_kwargs?](https://github.com/anomalyco/opencode/issues/23995)
> Configurar `enable_thinking: false` via `opencode.json`.

### Por que o GitHub Copilot não suporta modelos Claude?

**Issue:** [#21481 — Why github copilot not support claude model?](https://github.com/anomalyco/opencode/issues/21481)
> Após atualização, os modelos Claude sumiram do Copilot.

### Gemma 4 falha ao tentar chamar ferramentas

**Issue:** [#25892 — Gemma 4](https://github.com/anomalyco/opencode/issues/25892)
> Erro `tool-input-available` não incluído no schema de eventos.

### Modelos gratuitos não aparecem — apenas 3 disponíveis

**Issue:** [#23243 — 免费模型不全，只能看到3个模型](https://github.com/anomalyco/opencode/issues/23243)
> Usuário via apenas 3 modelos gratuitos, não a lista completa.

### DeepSeek V4 não funciona com configuração manual

**Issue:** [#24155 — deepseek v4 不能使用](https://github.com/anomalyco/opencode/issues/24155)
> Inserir manualmente `base_url` e `model` do DeepSeek não funcionava.

### Adaptação ao novo modelo DeepSeek V4

**Issue:** [#24092 — Adapting to the New DeepSeek Model](https://github.com/anomalyco/opencode/issues/24092)
> Pedido para suportar DeepSeek V4 e corrigir opção de thinking.

### Suporte ao GPT-5.4-Cyber?

**Issue:** [#22536 — support GPT‑5.4‑Cyber?](https://github.com/anomalyco/opencode/issues/22536)
> Pergunta sobre disponibilidade do modelo de cibersegurança da OpenAI.

### Contexto do Qwen 3.6 Plus diminuiu

**Issue:** [#22595 — Qwen3.6 Plus Context Limit Decreased?](https://github.com/anomalyco/opencode/issues/22595)
> O limite de contexto caiu de 1M para 260k tokens.

### Erro ao trocar para modelo DeepSeek gratuito

**Issue:** [#26897 — 切换免费的deepseek模型错误](https://github.com/anomalyco/opencode/issues/26897)
> `Model deepseep-v4-flash-free not supported` — provável typo no cache.

### Provider Qiniu não lista modelos DeepSeek V4

**Issue:** [#27574 — Cannot list all of the models from Provider Qiniu](https://github.com/anomalyco/opencode/issues/27574)
> Modelos existentes no provedor mas não aparecem no painel do OpenCode.

### Erro 401: Model opencode-go/GLM-5.1 not supported

**Issue:** [#23777 — 401 Model opencode-go/GLM-5.1 not supported](https://github.com/anomalyco/opencode/issues/23777)
> Após configurar o modelo com Go API, recebia erro 401.

### Modelo MiMo-V2-Omni não consegue ler PDF

**Issue:** [#22411 — opencode读取不了pdf文档](https://github.com/anomalyco/opencode/issues/22411)
> Erro de validação de role ao tentar ler PDF com modelo MiMo.

### read_file tool não disponível com modelo local Gemma 4 + Ollama

**Issue:** [#21354 — read_file tool call not available with local model gemma4](https://github.com/anomalyco/opencode/issues/21354)
> Modelo local não usava as tools do OpenCode, apenas `read_file` do Ollama.

---

## 3. Assinatura e Faturamento (Go / Zen)

### Por que apenas um membro por workspace pode assinar o Go?

**Issue:** [#26201 — Why one member per workspace for OpenCode Go](https://github.com/anomalyco/opencode/issues/26201)
> Limitação de uma assinatura Go por workspace em contas team.

### Pergunta sobre preços do OpenCode Go

**Issue:** [#23520 — Question about opencode GO](https://github.com/anomalyco/opencode/issues/23520)
> Discrepância entre preços no site da OpenRouter vs página do Go.

### Como funciona o Bring Your Own Key (BYOK) no Zen?

**Issue:** [#22463 — How does Bring Your Own Key (BYOK) Work in Zen](https://github.com/anomalyco/opencode/issues/22463)
> Usuário forneceu API key própria mas ainda recebia limite do Zen.

### Assinatura ativa mas saldo continua 0

**Issue:** [#27360 — Subscription Active but Balance Still 0](https://github.com/anomalyco/opencode/issues/27360)
> Pagamento do Go foi confirmado mas saldo não refletia.

### Reembolso — acusação de golpe no Zen

**Issue:** [#26508 — Refunds for the ZEN scam](https://github.com/anomalyco/opencode/issues/26508)
> Usuário reivindicava reembolso após ser direcionado ao Zen em vez do Go.

### Claude Code接入 OpenCode Go DeepSeek não usa modo thinking

**Issue:** [#27281 — Claude Code 接入 OpenCode go套餐DeepSeek无法使用思考模式](https://github.com/anomalyco/opencode/issues/27281)
> Erro `reasoning_content must be passed back` ao usar DeepSeek via CC Switch.

### Impossível reassinar Go após cancelar débito automático no Alipay

**Issue:** [#24686 — Unable to resubscribe to OpenCode Go monthly plan after canceling Alipay auto-debit](https://github.com/anomalyco/opencode/issues/24686)
> Após cancelar o débito automático, não conseguia reassinar.

### Esclarecer quais modelos Go são self-hosted vs. proxy

**Issue:** [#24649 — OpenCode Go: clarify which models are self-hosted vs. proxied](https://github.com/anomalyco/opencode/issues/24649)
> Dúvida sobre infraestrutura: modelos rodam em servidores próprios ou são proxy de terceiros?

### Assinei o Go mas Kimi-2.6 e MiMo não respondem

**Issue:** [#24552 — I just suscribed go, and use in opencode. Try kimi-2.6 and mimo v2.5 pro](https://github.com/anomalyco/opencode/issues/24552)
> Após assinar, modelos específicos do Go não davam resposta.

### Inscrevi no Go mas `/model` não mostra Kimi K2.6 e GLM-5.1

**Issue:** [#24460 — 我已订阅 opencode Go，但是 /model 后，没有 Kimi k2.6 以及GLM-5.1](https://github.com/anomalyco/opencode/issues/24460)
> Modelos contratados não apareciam na lista.

### Falha no pagamento via Alipay para o Go

**Issue:** [#24423 — OpenCode GO subscription by Alipay](https://github.com/anomalyco/opencode/issues/24423)
> Pagamento falhava consistentemente no Alipay.

### Novos planos Go com melhores limites?

**Issue:** [#24347 — New Go Subscriptions?](https://github.com/anomalyco/opencode/issues/24347)
> Sugestão de planos Go com limites de uso maiores.

### Como usar API do Go no Copilot?

**Issue:** [#24284 — unable to use opencode go API with copilot](https://github.com/anomalyco/opencode/issues/24284)
> Erro 403 Forbidden do Cloudflare ao tentar usar API Go via extensão copilot.

### Confirmação do tier comercial Anthropic para chamadas via Zen

**Issue:** [#24145 — Confirmation of Anthropic commercial tier protections for Claude API calls via Zen](https://github.com/anomalyco/opencode/issues/24145)
> Dúvida se chamadas Claude via Zen usam o tier comercial da Anthropic.

### Como usar OpenCode Go com Claude Code CLI?

**Issue:** [#23781 — use open code go with claude code](https://github.com/anomalyco/opencode/issues/23781)
> Dúvida se é possível usar a assinatura Go no Claude Code CLI.

### A fatura do Go é via REST API ou só TUI?

**Issue:** [#23513 — Does my OpenCode Go subscription bill via the REST API, or is it TUI-only?](https://github.com/anomalyco/opencode/issues/23513)
> Dúvida sobre como usar a assinatura Go via REST API.

### Limites de tempo (time window) afetam mesmo com modelo próprio

**Issue:** [#23685 — time window limits](https://github.com/anomalyco/opencode/issues/23685)
> Usuário usava modelo próprio mas ainda sofria restrição de limites.

### OpenCode Go Free usage exceeded — qual o ciclo?

**Issue:** [#27492 — opencode zen提示Free usage exceeded, subscribe to Go](https://github.com/anomalyco/opencode/issues/27492)
> Dúvida sobre o período de renovação do plano gratuito.

### Adicionar estatísticas de tokens na página do Go

**Issue:** [#27904 — 请增加tokens统计](https://github.com/anomalyco/opencode/issues/27904)
> Pedido para mostrar consumo de tokens na página de assinatura.

---

## 4. Interface TUI / CLI / Desktop

### Questão dock não fecha após resposta bem-sucedida no web app

**Issue:** [#27977 — Question dock stays open after successful reply](https://github.com/anomalyco/opencode/issues/27977)
> *(Duplicata: #27976)* Após responder no web app, o dock permanece visível.

### Como mostrar output de subagentes no `opencode run`?

**Issue:** [#26229 — How show subagent output when invoking "opencode run"](https://github.com/anomalyco/opencode/issues/26229)
> O agente principal não exibe output dos subagentes no console.

### Question pane overlay bloqueia o texto da conversa

**Issue:** [#23515 — Question pane overlay blocks/dims the conversation text](https://github.com/anomalyco/opencode/issues/23515)
> O painel de pergunta cobre o texto da análise anterior, dificultando a resposta.

### O servidor opencode aceita apenas um TUI?

**Issue:** [#22794 — Question: Is opencode server supposed to only allow ONE TUI?](https://github.com/anomalyco/opencode/issues/22794)
> `opencode serve` só permitia uma conexão TUI; segunda exigia `opencode attach`.

### Por que o comando `opencode plugin <version>` exige `--force`?

**Issue:** [#22452 — What is the reason `opencode plugin <new-version>` requires `--force`?](https://github.com/anomalyco/opencode/issues/22452)
> O comando não substituía versão existente sem `--force`, e a saída dizia "Installed" mesmo sem atualizar.

### Por que as funcionalidades "queuing" e "guidance" foram removidas?

**Issue:** [#22284 — Why were the two really useful features, ‘queuing’ and ‘guidance’, removed?](https://github.com/anomalyco/opencode/issues/22284)
> Funcionalidades úteis de envio de mensagens foram removidas em versões anteriores.

### Por que a nova versão é tão lenta? (v1.3.17 e v1.4.0)

**Issue:** [#21450 — Why is the new version so laggy?](https://github.com/anomalyco/opencode/issues/21450)
> Usuário reverteu para v1.2.10 e o problema foi resolvido.

### Por que moveram auto-accept permissions para as configurações globais?

**Issue:** [#21423 — Why Moved auto-accept permissions into Settings?](https://github.com/anomalyco/opencode/issues/21423)
> Antes era configurável por projeto, agora é global.

### Como obter informações de sessão no header HTTP da requisição LLM?

**Issue:** [#21291 — How to obtain session information in LLM http request header](https://github.com/anomalyco/opencode/issues/21291)
> O header `x-session-affinity` não era enviado como esperado.

### Salto de versão 1.4.x → 1.14.x é normal?

**Issue:** [#23419 — 1.4.x->1.14.x?](https://github.com/anomalyco/opencode/issues/23419)
> Estratégia de atualização agressiva com bugs frequentes.

### Pergunta não aparece no Desktop — loading infinito

**Issue:** [#22776 — No Answer with all models - Questions aren't working (Desktop)](https://github.com/anomalyco/opencode/issues/22776)
> O botão de loading ficava girando indefinidamente sem resposta.

### Desktop inicia todas as sessões em /

**Issue:** [#27798 — Desktop app seems to start all sessions at /](https://github.com/anomalyco/opencode/issues/27798)
> O app desktop inicia toda sessão na raiz, sem seletor de diretório.

### Popup de nome está cortando o texto

**Issue:** [#23054 — Can this popup be made larger? The name is being cut off.](https://github.com/anomalyco/opencode/issues/23054)
> Nome do arquivo aparecia truncado no popup.

### Scroll com teclado na visualização de código

**Issue:** [#27244 — Key binding of scrolling in session output view](https://github.com/anomalyco/opencode/issues/27244)
> Page Up/Down só funcionam em sessões, não na visualização de code review.

### Como esconder Keymap permanentemente e abrir mensagem no editor?

**Issue:** [#26607 — Hide Keymap Option by Default + Open Message in Editor](https://github.com/anomalyco/opencode/issues/26607)
> Dúvida sobre configuração do keymap e atalho para abrir mensagem no editor.

### Problemas de cópia e scroll no PowerShell

**Issue:** [#21872 — 复制，滚动条等体验问题](https://github.com/anomalyco/opencode/issues/21872)
> No PowerShell do Windows, não era possível copiar com duplo clique.

### "Subagent sessions cannot be prompted" no Windows

**Issue:** [#21458 — Subagent sessions cannot be prompted. Back to main session.](https://github.com/anomalyco/opencode/issues/21458)
> Mudança na versão Windows impedia guiar subagentes.

### Desktop com dois ícones e espaço duplicado

**Issue:** [#26755 — Opencode Desktop for Windows - Duplicated disk space usage](https://github.com/anomalyco/opencode/issues/26755)
> App desktop do Windows criava duas entradas: Program Files e AppData Local.

### Múltiplos projetos — troca entre projetos não responde

**Issue:** [#26795 — 打开多个项目后，点击左侧其他项目切换时无响应](https://github.com/anomalyco/opencode/issues/26795)
> Após executar código em um projeto, não era possível trocar para outro.

### Última versão é "merda" — funcionalidades removidas

**Issue:** [#25827 — 最新版犹如狗屎](https://github.com/anomalyco/opencode/issues/25827)
> Refresh, deleção de sessão e edição de API removidos na última versão.

---

## 5. Interface Web (Web UI)

### Como exibir o histórico de sessões no lado esquerdo do WebUI?

**Issue:** [#23686 — How can session history be displayed on the left side of WebUI](https://github.com/anomalyco/opencode/issues/23686)
> Cada nova sessão não mostrava o histórico das anteriores.

### Web UI mostra conteúdo da home folder ao selecionar projeto

**Issue:** [#22659 — When i am in the web interface and select open project...](https://github.com/anomalyco/opencode/issues/22659)
> O seletor de projeto no web UI listava a home folder, não apenas o diretório permitido.

### Web Server — abrir projetos de subpastas

**Issue:** [#21511 — Web Server - open projects from subfolders](https://github.com/anomalyco/opencode/issues/21511)
> Apenas pastas raiz eram tratadas como projetos; subpastas não podiam ser abertas.

---

## 6. Plugins, MCP e Extensões

### Mutar `cfg` no hook `config` é suportado?

**Issue:** [#24065 — Is mutating `cfg` in the `config` hook an officially supported pattern?](https://github.com/anomalyco/opencode/issues/24065)
> Plugin registrava agentes, comandos e MCP servers via mutação direta do objeto `cfg`.

### OpenCode depende de patch não-oficial do solidjs/start

**Issue:** [#27422 — Opencode depends on unofficial hacky patch to old solidjs/start](https://github.com/anomalyco/opencode/issues/27422)
> Dependência problemática para CI/CD.

### Timeout de 120s do MCP impede uso com modelos lentos

**Issue:** [#21820 — opencode内置超时机制使得mcp无法使用](https://github.com/anomalyco/opencode/issues/21820)
> O timeout padrão de 120s para MCP era insuficiente para modelos como GLM-5.

### oh-my-opencode não funciona após instalação

**Issue:** [#21509 — opencode always attempt to install oh-my-opencode](https://github.com/anomalyco/opencode/issues/21509)
> Após instalar via comando, o OpenCode tentava reinstalar e o plugin não funcionava.

---

## 7. Sessões e Histórico

### Sessões não são salvas no Desktop Windows

**Issue:** [#25506 — 本地使用，页面会话没有显示](https://github.com/anomalyco/opencode/issues/25506)
> As sessões não persistiam após fechar o app desktop.

### Histórico de sessões desaparece e arquivamento é confuso

**Issue:** [#26505 — Session history disappears and archived sessions are difficult to restore](https://github.com/anomalyco/opencode/issues/26505)
> Sessões arquivadas sumiam da sidebar e `opencode --continue` mostrava `undefined`.

### Ordem da mensagem de sumarização após compactação

**Issue:** [#24963 — Compaction: summary message appears after tail messages](https://github.com/anomalyco/opencode/issues/24963)
> Após compactação, a mensagem "What did we do so far?" aparecia antes do sumário, causando confusão.

---

## 8. Permissões e Segurança

### Permissões não funcionam como esperado — bash skill contorna

**Issue:** [#22375 — Unable to get permissions to work as intended](https://github.com/anomalyco/opencode/issues/22375)
> Mesmo negando `list`, o bash skill permitia `ls`. Editar era contornado por `echo >`.

### OpenCode injeta env/skills DEPOIS do system prompt, quebrando agentes

**Issue:** [#24156 — OpenCode injects env/skills prompts AFTER custom agent prompt](https://github.com/anomalyco/opencode/issues/24156)
> A ordem dos prompts fazia o modelo tratar instruções de ambiente como texto normal.

---

## 9. Compatibilidade e Integração

### Configurar OpenCode + WSL + Playwright CLI

**Issue:** [#23815 — How to configure Opencode + WSL + playwright-cli](https://github.com/anomalyco/opencode/issues/23815)
> Playwright funcionava no WSL mas não quando chamado pelo OpenCode.

### OpenCode com Hermes — texto ASCII ao mover o mouse

**Issue:** [#25280 — i am using opencode + hermes and i get asciii text when moving my mouse](https://github.com/anomalyco/opencode/issues/25280)
> Texto ASCII aparecia na tela ao mover o mouse durante carregamento de MCPs.

### Como usar CC Switch com modelos Xiaomi MiMo?

**Issue:** [#27273 — 小米模型Mimo使用CC Switch接入的问题](https://github.com/anomalyco/opencode/issues/27273)
> Erro `reasoning_content must be passed back` ao usar MiMo via CC Switch.

### API de terceiros não consegue dialogar

**Issue:** [#27693 — 第三方厂商api无法对话](https://github.com/anomalyco/opencode/issues/27693)
> API de terceiros configurada, modelo selecionável, mas sem output.

### Mesmo provider/model com variantes diferentes

**Issue:** [#25248 — Same provider/model with different variants](https://github.com/anomalyco/opencode/issues/25248)
> Ao usar mesmo provider para Plan e Build com variantes diferentes, a última variante usada prevalecia.

### Diferença entre invocar subagente via `@explore` vs. mencionar "explore"

**Issue:** [#25105 — Difference explicitely invoking subagent via "@explore" vs nudging](https://github.com/anomalyco/opencode/issues/25105)
> Dúvida sobre o comportamento de `@` notation e se funciona em AGENTS.md.

### Conversão de tools Anthropic → OpenAI para DeepSeek

**Issue:** [#25107 — Anthropic tools format conversion to OpenAI tools format](https://github.com/anomalyco/opencode/issues/25107)
> Ao usar Claude Code como gateway, os tools não eram convertidos para o formato OpenAI.

### OpenCode lento com vLLM — tool calls não funcionam

**Issue:** [#22525 — opencode调用vllm部署的模型,调用工具报错](https://github.com/anomalyco/opencode/issues/22525)
> Modelo GLM5 via vLLM com `--tool-call-parser glm47` não era compatível.

### IntelliJ IDEA adiciona outros modelos de IA

**Issue:** [#21606 — IntelliJ IDEA adds other AI models](https://github.com/anomalyco/opencode/issues/21606)
> Após abrir o ACP do OpenCode, não havia entrada para reconfigurar o modelo.

### Conexão com API falha — socket fechado inesperadamente

**Issue:** [#21643 — Cannot connect to API: The socket connection was closed unexpectedly](https://github.com/anomalyco/opencode/issues/21643)
> Modelos Zen não conectavam, mas Copilot funcionava (ambiente QEMU/Linux).

---

## 10. Comportamento e Bugs

### Plan Mode Agent spawnou General Subagent para editar código

**Issue:** [#24741 — Plan Mode Agent Spawned General Subagent to edit code](https://github.com/anomalyco/opencode/issues/24741)
> Em Plan Mode, o agente principal invocou General Agent para fazer edições — bug ou feature?

### O aplicativo não inicia — apenas uma caixa no meio da tela

**Issue:** [#23918 — why does not it start](https://github.com/anomalyco/opencode/issues/23918)
> O app abria apenas uma pequena caixa e fazia barulho de disco sem progredir.

### Preferência por solução "mais simples" é muito alta

**Issue:** [#24940 — Preference for "simplest" solution is too high](https://github.com/anomalyco/opencode/issues/24940)
> O agente sempre escolhia a solução mais simples, deletando lógica importante.

### Question replies não roteiam para o workspace remoto ativo

**Issue:** [#23843 — Question replies do not route to the active remote workspace](https://github.com/anomalyco/opencode/issues/23843)
> O parâmetro `workspace` não era enviado no POST de resposta.

### Pasta NAS indisponível impede OpenCode de iniciar

**Issue:** [#24474 — Unavailable NAS shared folder used as a projects directory prevents OpenCode from launching](https://github.com/anomalyco/opencode/issues/24474)
> Diretório de projeto em NAS desmontado impedia a abertura do app.

### Traduzir prompts não-ingleses para inglês antes de processar

**Issue:** [#23077 — Translating prompts to english before doing the job](https://github.com/anomalyco/opencode/issues/23077)
> Modelos funcionam melhor em inglês; sugestão de tradução automática de prompts.

### "List all files" inclui node_modules — tokens desperdiçados

**Issue:** [#22779 — Should "list all files" exclude `node_modules/` to save tokens?](https://github.com/anomalyco/opencode/issues/22779)
> Listar arquivos em `.opencode/` incluía `node_modules`, gerando excesso de tokens.

### Playwright CLI no OpenCode fica bloqueado após abrir browser

**Issue:** [#22767 — opencode中使用playwright cli执行open命令一直阻塞](https://github.com/anomalyco/opencode/issues/22767)
> Browser abria mas o comando não terminava; no PowerShell funcionava.

### Diferença entre versão desktop e electron?

**Issue:** [#24603 — What's the difference between the desktop and electron version?](https://github.com/anomalyco/opencode/issues/24603)
> Usuário não encontrou documentação sobre a diferença.

### v1.4.2 é a última versão estável?

**Issue:** [#23036 — I think v1.4.2 is the latest stable version who is with me?](https://github.com/anomalyco/opencode/issues/23036)
> Versões posteriores apresentavam bugs de memória e WebUI.

### Agente pode obter logs do terminal?

**Issue:** [#21994 — can agent obtain terminal logs?](https://github.com/anomalyco/opencode/issues/21994)
> Dúvida se o agente pode acessar logs do terminal para auto-correção.

### Erro "Upgrade Required" com endpoint OpenAI-compatible local

**Issue:** [#22164 — Upgrade required !!?](https://github.com/anomalyco/opencode/issues/22164)
> Endpoint local/compatível OpenAI retornava "Upgrade Required" no OpenCode.

### Fork de contexto pai em múltiplos subagentes

**Issue:** [#22269 — Fork parent context into multiple subagents](https://github.com/anomalyco/opencode/issues/22269)
> Sugestão de paralelizar trabalho em 20+ pacotes com subagentes independentes que herdam contexto do planejamento.

### Dúvida sobre configuração de LSP customizado (Luau)

**Issue:** [#22199 — Doubt with Custom LSP configuration](https://github.com/anomalyco/opencode/issues/22199)
> Dificuldade em configurar LSP para Roblox/Luau.

### AI modificou `opencode.json` e agora não conecta ao servidor

**Issue:** [#22247 — ai修改了一个名为opencode.json文件过后 重启就一直提示无法连接服务器](https://github.com/anomalyco/opencode/issues/22247)
> Após o agente modificar `opencode.json`, o servidor não conectava mais, mesmo reinstalando.

### `opencode stats` — como resetar ou ver timeframe específico?

**Issue:** [#26061 — Resetting or viewing stats](https://github.com/anomalyco/opencode/issues/26061)
> Dúvida sobre resetar estatísticas e ver saldo restante fora do site.

### Server status oscila entre online/offline no Windows

**Issue:** [#25951 — Server status](https://github.com/anomalyco/opencode/issues/25951)
> Status do servidor ficava alternando no app desktop Windows.

### Missing Authentication header ao usar ChatGPT

**Issue:** [#25757 — Missing Authentication header when I try to use open code](https://github.com/anomalyco/opencode/issues/25757)
> Após autenticação headless, o erro "Missing Authentication header" voltava ao reiniciar.

### OpenCode é gratuito permanentemente?

**Issue:** [#25619 — Is OpenCode Free to Use Indefinitely?](https://github.com/anomalyco/opencode/issues/25619)
> Dúvida se o plano gratuito tem prazo de validade ou restrições.

### Por que o OpenCode cria um arquivo `.git/opencode`?

**Issue:** [#25618 — Why Does OpenCode Create a .git/opencode File?](https://github.com/anomalyco/opencode/issues/25618)
> Um arquivo com hash era criado em `.git/opencode`.

---

## 11. Dúvidas Gerais sobre o Projeto

### Como começar com Vibe Coding usando OpenCode + modelos gratuitos?

**Issue:** [#28022 — How to get started with Vibe Coding using opencode + free models?](https://github.com/anomalyco/opencode/issues/28022)
> Usuário iniciante queria boas práticas, pitfalls comuns e tipos de projeto recomendados.

### O projeto está vivo? Roadmap?

**Issue:** [#26711 — Is This Project Alive?](https://github.com/anomalyco/opencode/issues/26711)
> Dúvida sobre a atividade do projeto diante de releases automáticas diárias e 4.9k issues abertas.

### Podem abrir a seção de discussões no GitHub?

**Issue:** [#27489 — Can we open the discussion section?](https://github.com/anomalyco/opencode/issues/27489)
> Sugestão de criar GitHub Discussions para dúvidas gerais, dicas e truques.

### Liberar versões todos os dias é necessário?

**Issue:** [#26313 — Hey guys...](https://github.com/anomalyco/opencode/issues/26313)
> Crítica à frequência de releases que introduziam bugs e comportamentos inconsistentes.

### Como deletar minha conta?

**Issue:** [#24303 — How can I delete my account?](https://github.com/anomalyco/opencode/issues/24303)
> Usuário queria saber como excluir a conta.

### Doações?

**Issue:** [#21560 — Donations?](https://github.com/anomalyco/opencode/issues/21560)
> Usuário já assinante Zen queria fazer doações mensais adicionais.

### Vai considerar Mempalace como session db?

**Issue:** [#27710 — Mempalace as session db](https://github.com/anomalyco/opencode/issues/27710)
> Sugestão de usar Mempalace como banco de sessões para busca contextual com poucos tokens.

### OpenCode question.asked — como responder via Server API?

**Issue:** [#27644 — OpenCode question tool emits question.asked but no documented way to answer via Server API](https://github.com/anomalyco/opencode/issues/27644)
> A API emite evento `question.asked` mas não há documentação de como responder.

---

> **Total: 124 perguntas** organizadas em 11 categorias.
>
> Fonte: `.opencode/issues/not-planned.md` — issues do upstream
> [anomalyco/opencode](https://github.com/anomalyco/opencode) que estão fora
> do escopo do fork TeamCode.
