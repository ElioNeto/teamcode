# ❓ FAQ — Perguntas Classificadas como "Não Planejadas"

> Este documento reúne **124 perguntas de usuários** do repositório upstream
> [anomalyco/opencode](https://github.com/anomalyco/opencode) que foram
> classificadas como fora do escopo do fork TeamCode.
>
> **Fonte original:** `.opencode/issues/not-planned.md`
>
> Cada entrada inclui a pergunta, a resposta (por que não se aplica ao TeamCode),
> e um link para a discussão completa no GitHub upstream.

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

**Resposta:** Esta é uma dúvida sobre a arquitetura interna de configuração do OpenCode upstream. As configurações padrão dos agentes são definidas em código no repositório original (`anomalyco/opencode`). O TeamCode é um fork que mantém seu próprio conjunto de configurações; consulte a documentação do TeamCode para detalhes sobre como os agentes são configurados neste fork.

### Qual é a última versão do opencode CLI?

**Issue:** [#27876 — what is he last version of opencode cli?](https://github.com/anomalyco/opencode/issues/27876)

**Pergunta:** O CLI notificava sobre uma atualização, mas mesmo após instalar o `.deb` mais recente a versão do CLI não atualizava.

**Resposta:** Esta pergunta é sobre o ciclo de releases e pacotes de distribuição do OpenCode upstream (pacotes `.deb`, versionamento CLI). O TeamCode é um fork do código-fonte e não publica pacotes de distribuição próprios. Para usar o TeamCode, compile a partir da fonte ou consulte as instruções de instalação específicas do fork.

### É seguro atualizar o OpenCode durante um ataque supply chain?

**Issue:** [#27646 — Is it safe to update Opencode these few days?](https://github.com/anomalyco/opencode/issues/27646)

**Pergunta:** Preocupação com segurança devido a um ataque supply chain amplamente noticiado.

**Resposta:** Esta preocupação de segurança era direcionada à infraestrutura de distribuição do OpenCode upstream. O TeamCode é um fork de código aberto que não compartilha o mesmo pipeline de distribuição. Verifique as práticas de segurança adotadas pelo mantenedor do TeamCode para obter garantias específicas.

### Como recuperar uma sessão deletada acidentalmente?

**Issue:** [#23468 — How to recover a mistakenly deleted session](https://github.com/anomalyco/opencode/issues/23468)

**Pergunta:** O comando `/sessions` + `Ctrl+d` deleta a sessão. O usuário queria saber como recuperá-la.

**Resposta:** Esta é uma dúvida de uso sobre o comportamento específico do TUI do OpenCode upstream. O gerenciamento de sessões pode diferir no TeamCode. Consulte a documentação do TeamCode sobre o comando de sessões para entender o comportamento local.

### Por que o OpenCode instala pacotes de plugin automaticamente?

**Issue:** [#26462 — Why OpenCode automatic install plugin packages?](https://github.com/anomalyco/opencode/issues/26462)

**Pergunta:** Ao abrir o OpenCode, ele instala `@opencode-ai/plugin` em um subdiretório `./basic`, o que gerou dúvida.

**Resposta:** Este comportamento de instalação automática de plugins é uma decisão de design do OpenCode upstream. O TeamCode pode gerenciar plugins de forma diferente; consulte a documentação local para entender o mecanismo de plugins neste fork.

### Por que o Workspace precisa ser vinculado a um diretório específico?

**Issue:** [#23424 — Why must a workspace be forcibly bound to a specific directory?](https://github.com/anomalyco/opencode/issues/23424)

**Pergunta:** O usuário sugeria que workspaces deveriam ser coleções de ideias, e não pastas físicas.

**Resposta:** Esta é uma discussão de design sobre o modelo de workspaces do OpenCode upstream. O TeamCode pode ter adotado abordagens diferentes para o gerenciamento de workspaces. Consulte a documentação do TeamCode para entender o modelo atual.

### Como fazer o OpenCode lembrar o modelo Plan/Build configurado?

**Issue:** [#26144 — How to make Opencode TUI remember your Build/Plan model?](https://github.com/anomalyco/opencode/issues/26144)

**Pergunta:** Após fechar e reabrir o OpenCode, os modelos Plan e Build voltavam ao padrão.

**Resposta:** Esta é uma questão de persistência de configuração no TUI do OpenCode upstream. O comportamento de salvamento de preferências pode variar entre versões e forks. Verifique como o TeamCode lida com a persistência de configuração de agentes.

### O que aconteceu com o opencode-cli TUI?

**Issue:** [#25879 — What happened to the opencode-cli TUI?](https://github.com/anomalyco/opencode/issues/25879)

**Pergunta:** Após atualizar o pacote debian, o binário `opencode-cli` não existia mais.

**Resposta:** Esta é uma questão sobre a estrutura de pacotes de distribuição do OpenCode upstream. O TeamCode não distribui pacotes `.deb` ou binários pré-compilados. A separação entre CLI e TUI pode ser diferente neste fork.

### Como saber se estou usando o OpenCode via npm ou bun?

**Issue:** [#23055 — how do i know what way i launch opencode after i use npm and bun both](https://github.com/anomalyco/opencode/issues/23055)

**Pergunta:** Múltiplas instalações do `opencode` no `$PATH` — o usuário não sabia qual estava sendo executada.

**Resposta:** Esta é uma dúvida genérica sobre gerenciamento de múltiplas instalações do OpenCode upstream. O TeamCode é instalado via fonte ou pelo método definido pelo mantenedor do fork. Use `which opencode` ou `bun which opencode` para rastrear a origem do binário.

### Por que a instalação do Desktop não permite escolher o diretório?

**Issue:** [#26791 — 为什么安装路径不能自己指定了](https://github.com/anomalyco/opencode/issues/26791)

**Pergunta:** A versão desktop agora instala sempre em `User Local` sem opção de escolha.

**Resposta:** Esta é uma questão sobre o instalador desktop (Electron) do OpenCode upstream. O TeamCode é um fork do código-fonte CLI e não mantém instaladores desktop próprios. Consulte as instruções de instalação do TeamCode para detalhes.

### Como instalar o OpenCode offline no Windows 10?

**Issue:** [#23005 — opencode如何在win10系统上离线安装呢](https://github.com/anomalyco/opencode/issues/23005)

**Pergunta:** Pergunta sobre instalação offline.

**Resposta:** Esta é uma dúvida sobre o instalador oficial do OpenCode para Windows. O TeamCode não distribui instaladores Windows. Para usar o TeamCode offline, compile a partir do código-fonte ou siga as instruções específicas do fork.

---

## 2. Modelos e Provedores

### Como desabilitar o modo Thinking do DeepSeek V4 Flash?

**Issue:** [#27555 — How to disable DeepSeek V4 Flash Thinking mode in OpenCode?](https://github.com/anomalyco/opencode/issues/27555)

**Pergunta:** O usuário usava a API key do OpenCode Go no Immersive Translate e queria desabilitar o modo reasoning.

**Resposta:** Esta pergunta envolve a API do OpenCode Go (um serviço gerenciado upstream) e o comportamento do modelo DeepSeek. O TeamCode não opera serviços de API gerenciados nem controla o catálogo de modelos upstream. Para usar modelos com suas próprias chaves de API no TeamCode, configure o provedor diretamente no `opencode.json`.

### Por que o OpenCode exibe linhas selecionadas e o arquivo atual no VSCode?

**Issue:** [#27420 — Why does OpenCode display the selected lines...](https://github.com/anomalyco/opencode/issues/27420)

**Pergunta:** Comparação com a extensão Claude Code do VSCode.

**Resposta:** Esta é uma questão sobre a integração do OpenCode com extensões VSCode — funcionalidade específica do ecossistema upstream. O TeamCode pode ou não incluir integrações similares; verifique a documentação de integração com editores do fork.

### O que significa o erro "VirusFound"?

**Issue:** [#26904 — What does VirusFound mean?](https://github.com/anomalyco/opencode/issues/26904)

**Pergunta:** Erro misterioso ao usar o provedor Copilot (GPT 5.4).

**Resposta:** Este erro é originado no provedor GitHub Copilot integrado ao OpenCode upstream. É uma mensagem de provedor terceiro, não do OpenCode em si. O TeamCode pode se integrar com provedores diferentes; consulte a lista de provedores suportados no fork.

### Como usar as APIs NVIDIA NIM com OpenCode?

**Issue:** [#26876 — How can I use the Nvidia NIM Apis with Opencode](https://github.com/anomalyco/opencode/issues/26876)

**Pergunta:** Dúvida sobre compatibilidade com NVIDIA NIM.

**Resposta:** Esta é uma pergunta sobre integração com um provedor específico no OpenCode upstream. O TeamCode expõe APIs para configurar provedores personalizados compatíveis com OpenAI. Para usar NVIDIA NIM, configure um provedor `openai-compatible` com a `baseURL` apropriada.

### Por que o modelo GLM-5V-Turbo foi removido?

**Issue:** [#24672 — Why the Vision Mode Model GLM-5V-Turbo was deleted from ZAI?](https://github.com/anomalyco/opencode/issues/24672)

**Pergunta:** Modelo de visão sumiu após atualização.

**Resposta:** O catálogo de modelos disponíveis no OpenCode upstream é gerenciado pelos mantenedores do OpenCode e provedores terceiros (como ZAI). O TeamCode não controla quais modelos são incluídos ou removidos do ecossistema upstream. Para visão/local, configure manualmente o modelo desejado via `opencode.json`.

### Como mostrar o Chain-of-Thought (CoT) no web UI?

**Issue:** [#24583 — How to show the CoT in opencode web?](https://github.com/anomalyco/opencode/issues/24583)

**Pergunta:** O TUI mostra o pensamento por padrão, mas o web UI não.

**Resposta:** Esta é uma questão sobre a interface web do OpenCode upstream, que faz parte do pacote `packages/web/` do repositório original. O TeamCode é focado no código-fonte CLI e não mantém a interface web do OpenCode.

### Como modificar os agentes Plan e Build para passar `chat_template_kwargs`?

**Issue:** [#23995 — How to modify Plan and Build agents to pass chat_template_kwargs?](https://github.com/anomalyco/opencode/issues/23995)

**Pergunta:** Configurar `enable_thinking: false` via `opencode.json`.

**Resposta:** O parâmetro `chat_template_kwargs` é específico de certos provedores e modelos integrados ao OpenCode upstream. O TeamCode pode expor opções diferentes para configuração de agentes. Consulte a documentação de configuração de agentes do fork para opções equivalentes.

### Por que o GitHub Copilot não suporta modelos Claude?

**Issue:** [#21481 — Why github copilot not support claude model?](https://github.com/anomalyco/opencode/issues/21481)

**Pergunta:** Após atualização, os modelos Claude sumiram do Copilot.

**Resposta:** Esta é uma questão sobre o ecossistema GitHub Copilot, não sobre o OpenCode em si. A disponibilidade de modelos no Copilot é determinada pela Microsoft/GitHub. O OpenCode (e o TeamCode) apenas consomem os modelos que o Copilot expõe via API.

### Gemma 4 falha ao tentar chamar ferramentas

**Issue:** [#25892 — Gemma 4](https://github.com/anomalyco/opencode/issues/25892)

**Pergunta:** Erro `tool-input-available` não incluído no schema de eventos.

**Resposta:** Este é um bug de compatibilidade entre o schema de eventos de streaming do OpenCode upstream e o formato de saída do modelo Gemma 4. Correções para provedores/modelos específicos dependem do upstream. O TeamCode pode ter schemas diferentes para eventos de streaming.

### Modelos gratuitos não aparecem — apenas 3 disponíveis

**Issue:** [#23243 — 免费模型不全，只能看到3个模型](https://github.com/anomalyco/opencode/issues/23243)

**Pergunta:** Usuário via apenas 3 modelos gratuitos, não a lista completa.

**Resposta:** A lista de modelos gratuitos é gerenciada pelo serviço upstream OpenCode (provavelmente OpenCode Zen). O TeamCode não opera serviços de API gerenciados. Para usar modelos gratuitos locais ou de terceiros, configure provedores personalizados.

### DeepSeek V4 não funciona com configuração manual

**Issue:** [#24155 — deepseek v4 不能使用](https://github.com/anomalyco/opencode/issues/24155)

**Pergunta:** Inserir manualmente `base_url` e `model` do DeepSeek não funcionava.

**Resposta:** A configuração manual de modelos pode exigir parâmetros adicionais não documentados ou específicos da versão do OpenCode upstream. No TeamCode, provedores `openai-compatible` são configurados de forma similar; verifique se o modelo e a URL estão corretos e se o provedor suporta tool calling.

### Adaptação ao novo modelo DeepSeek V4

**Issue:** [#24092 — Adapting to the New DeepSeek Model](https://github.com/anomalyco/opencode/issues/24092)

**Pergunta:** Pedido para suportar DeepSeek V4 e corrigir opção de thinking.

**Resposta:** O suporte a novos modelos no OpenCode upstream depende dos mantenedores integrarem os provedores. O TeamCode pode se beneficiar de integrações similares ou exigir configuração manual via provedor `openai-compatible`.

### Suporte ao GPT-5.4-Cyber?

**Issue:** [#22536 — support GPT‑5.4‑Cyber?](https://github.com/anomalyco/opencode/issues/22536)

**Pergunta:** Pergunta sobre disponibilidade do modelo de cibersegurança da OpenAI.

**Resposta:** Modelos especiais da OpenAI (como o GPT-5.4-Cyber) requerem acesso específico via API da OpenAI. Se você tem acesso, configure um provedor `openai` no TeamCode com sua chave de API — o modelo deve funcionar se estiver disponível na sua conta.

### Contexto do Qwen 3.6 Plus diminuiu

**Issue:** [#22595 — Qwen3.6 Plus Context Limit Decreased?](https://github.com/anomalyco/opencode/issues/22595)

**Pergunta:** O limite de contexto caiu de 1M para 260k tokens.

**Resposta:** Esta mudança de limite de contexto ocorreu no provedor upstream (Alibaba/Qwen) ou na camada de API do OpenCode Go. O TeamCode não opera serviços de API e não controla limites de contexto de provedores terceiros.

### Erro ao trocar para modelo DeepSeek gratuito

**Issue:** [#26897 — 切换免费的deepseek模型错误](https://github.com/anomalyco/opencode/issues/26897)

**Pergunta:** `Model deepseep-v4-flash-free not supported` — provável typo no cache.

**Resposta:** O erro parece ser um problema de cache local com o nome do modelo (typo: "deepseep" vs "deepseek"). Isso é específico da implementação de cache de modelos do OpenCode upstream. No TeamCode, limpe o cache local ou verifique a configuração do provedor.

### Provider Qiniu não lista modelos DeepSeek V4

**Issue:** [#27574 — Cannot list all of the models from Provider Qiniu](https://github.com/anomalyco/opencode/issues/27574)

**Pergunta:** Modelos existentes no provedor mas não aparecem no painel do OpenCode.

**Resposta:** A listagem de modelos de provedores depende da integração entre o OpenCode e cada provedor. Se o provedor Qiniu adicionou novos modelos mas o OpenCode não os lista, é uma questão de atualização da lista de modelos no upstream. No TeamCode, você pode tentar configurar o modelo manualmente.

### Erro 401: Model opencode-go/GLM-5.1 not supported

**Issue:** [#23777 — 401 Model opencode-go/GLM-5.1 not supported](https://github.com/anomalyco/opencode/issues/23777)

**Pergunta:** Após configurar o modelo com Go API, recebia erro 401.

**Resposta:** O prefixo `opencode-go/` é específico dos modelos gerenciados pelo serviço OpenCode Go. O TeamCode não tem acesso a este catálogo. Configure seus próprios provedores com suas chaves de API no TeamCode.

### Modelo MiMo-V2-Omni não consegue ler PDF

**Issue:** [#22411 — opencode读取不了pdf文档](https://github.com/anomalyco/opencode/issues/22411)

**Pergunta:** Erro de validação de role ao tentar ler PDF com modelo MiMo.

**Resposta:** Este é um problema de compatibilidade entre o formato de mensagens do OpenCode upstream e o modelo MiMo-V2-Omni. A validação de `role` no schema de mensagens pode diferir entre forks. No TeamCode, verifique se o modelo suporta mensagens multimodais no formato utilizado.

### read_file tool não disponível com modelo local Gemma 4 + Ollama

**Issue:** [#21354 — read_file tool call not available with local model gemma4](https://github.com/anomalyco/opencode/issues/21354)

**Pergunta:** Modelo local não usava as tools do OpenCode, apenas `read_file` do Ollama.

**Resposta:** Modelos locais via Ollama podem não suportar tool calling no formato esperado pelo OpenCode. Esta é uma limitação conhecida de modelos menores rodando localmente. O TeamCode utiliza o mesmo mecanismo de tool calling; modelos que não suportam o formato OpenAI de ferramentas podem não funcionar.

---

## 3. Assinatura e Faturamento (Go / Zen)

### Por que apenas um membro por workspace pode assinar o Go?

**Issue:** [#26201 — Why one member per workspace for OpenCode Go](https://github.com/anomalyco/opencode/issues/26201)

**Pergunta:** Limitação de uma assinatura Go por workspace em contas team.

**Resposta:** Esta é uma questão de política de negócios do serviço OpenCode Go, operado pela equipe do upstream. O TeamCode é um fork do código-fonte aberto e não tem qualquer relação com o sistema de assinaturas ou planos do OpenCode Go/Zen.

### Pergunta sobre preços do OpenCode Go

**Issue:** [#23520 — Question about opencode GO](https://github.com/anomalyco/opencode/issues/23520)

**Pergunta:** Discrepância entre preços no site da OpenRouter vs página do Go.

**Resposta:** Dúvida sobre precificação de um serviço comercial (OpenCode Go) mantido pela equipe upstream. O TeamCode não opera serviços de assinatura. Para questões de faturamento, contate o suporte do OpenCode em `opencode.ai`.

### Como funciona o Bring Your Own Key (BYOK) no Zen?

**Issue:** [#22463 — How does Bring Your Own Key (BYOK) Work in Zen](https://github.com/anomalyco/opencode/issues/22463)

**Pergunta:** Usuário forneceu API key própria mas ainda recebia limite do Zen.

**Resposta:** O OpenCode Zen é um serviço gerenciado upstream com suas próprias regras de negócio. O TeamCode não oferece planos Zen ou Go. Se você deseja usar suas próprias chaves de API, configure provedores diretamente no `opencode.json` do TeamCode.

### Assinatura ativa mas saldo continua 0

**Issue:** [#27360 — Subscription Active but Balance Still 0](https://github.com/anomalyco/opencode/issues/27360)

**Pergunta:** Pagamento do Go foi confirmado mas saldo não refletia.

**Resposta:** Problema de faturamento do serviço OpenCode Go. Entre em contato com o suporte do OpenCode em `opencode.ai`. O TeamCode não tem acesso ou responsabilidade sobre sistemas de pagamento upstream.

### Reembolso — acusação de golpe no Zen

**Issue:** [#26508 — Refunds for the ZEN scam](https://github.com/anomalyco/opencode/issues/26508)

**Pergunta:** Usuário reivindicava reembolso após ser direcionado ao Zen em vez do Go.

**Resposta:** Questão de faturamento e UX de pagamento do site upstream. O TeamCode não está envolvido em transações financeiras do OpenCode. Para reembolsos, contate o suporte oficial em `opencode.ai`.

### Claude Code 接入 OpenCode Go DeepSeek não usa modo thinking

**Issue:** [#27281 — Claude Code 接入 OpenCode go套餐DeepSeek无法使用思考模式](https://github.com/anomalyco/opencode/issues/27281)

**Pergunta:** Erro `reasoning_content must be passed back` ao usar DeepSeek via CC Switch.

**Resposta:** Este é um problema de compatibilidade entre o Claude Code, o gateway CC Switch, e a API do OpenCode Go — todos fora do escopo do TeamCode. O TeamCode suporta configuração direta de provedores sem intermediários.

### Impossível reassinar Go após cancelar débito automático no Alipay

**Issue:** [#24686 — Unable to resubscribe to OpenCode Go monthly plan after canceling Alipay auto-debit](https://github.com/anomalyco/opencode/issues/24686)

**Pergunta:** Após cancelar o débito automático, não conseguia reassinar.

**Resposta:** Problema de gerenciamento de pagamento do serviço OpenCode Go. Entre em contato com o suporte upstream. O TeamCode não gerencia assinaturas.

### Esclarecer quais modelos Go são self-hosted vs. proxy

**Issue:** [#24649 — OpenCode Go: clarify which models are self-hosted vs. proxied](https://github.com/anomalyco/opencode/issues/24649)

**Pergunta:** Dúvida sobre infraestrutura: modelos rodam em servidores próprios ou são proxy de terceiros?

**Resposta:** Questão sobre a infraestrutura do serviço OpenCode Go. O TeamCode não opera infraestrutura de API. Consulte a documentação do OpenCode Go ou contate o suporte upstream.

### Assinei o Go mas Kimi-2.6 e MiMo não respondem

**Issue:** [#24552 — I just suscribed go, and use in opencode. Try kimi-2.6 and mimo v2.5 pro](https://github.com/anomalyco/opencode/issues/24552)

**Pergunta:** Após assinar, modelos específicos do Go não davam resposta.

**Resposta:** Problema de disponibilidade de modelos no serviço OpenCode Go. Contate o suporte upstream. No TeamCode, você usa seus próprios provedores e chaves de API, sem depender de catálogos gerenciados.

### Inscrevi no Go mas `/model` não mostra Kimi K2.6 e GLM-5.1

**Issue:** [#24460 — 我已订阅 opencode Go，但是 /model 后，没有 Kimi k2.6 以及GLM-5.1](https://github.com/anomalyco/opencode/issues/24460)

**Pergunta:** Modelos contratados não apareciam na lista.

**Resposta:** A lista de modelos disponíveis no OpenCode é sincronizada com os servidores upstream. Se modelos contratados não aparecem, é uma questão com o serviço OpenCode Go. O TeamCode não gerencia listas de modelos remotas.

### Falha no pagamento via Alipay para o Go

**Issue:** [#24423 — OpenCode GO subscription by Alipay](https://github.com/anomalyco/opencode/issues/24423)

**Pergunta:** Pagamento falhava consistentemente no Alipay.

**Resposta:** Problema de processamento de pagamento do serviço upstream. Contate o suporte do OpenCode. O TeamCode não processa pagamentos.

### Novos planos Go com melhores limites?

**Issue:** [#24347 — New Go Subscriptions?](https://github.com/anomalyco/opencode/issues/24347)

**Pergunta:** Sugestão de planos Go com limites de uso maiores.

**Resposta:** Sugestão de produto para o serviço OpenCode Go. Direcione para o feedback do OpenCode em `opencode.ai`. O TeamCode é software livre sem planos de assinatura.

### Como usar API do Go no Copilot?

**Issue:** [#24284 — unable to use opencode go API with copilot](https://github.com/anomalyco/opencode/issues/24284)

**Pergunta:** Erro 403 Forbidden do Cloudflare ao tentar usar API Go via extensão copilot.

**Resposta:** O erro 403 do Cloudflare indica que a API do OpenCode Go está protegida contra acessos não autorizados. Esta é uma configuração de segurança do serviço upstream. O TeamCode não fornece API gerenciada; configure seus provedores diretamente.

### Confirmação do tier comercial Anthropic para chamadas via Zen

**Issue:** [#24145 — Confirmation of Anthropic commercial tier protections for Claude API calls via Zen](https://github.com/anomalyco/opencode/issues/24145)

**Pergunta:** Dúvida se chamadas Claude via Zen usam o tier comercial da Anthropic.

**Resposta:** Questão sobre a relação contratual entre o OpenCode Zen e a Anthropic. Direcione para o suporte ou documentação oficial do OpenCode. O TeamCode não intermediia chamadas de API.

### Como usar OpenCode Go com Claude Code CLI?

**Issue:** [#23781 — use open code go with claude code](https://github.com/anomalyco/opencode/issues/23781)

**Pergunta:** Dúvida se é possível usar a assinatura Go no Claude Code CLI.

**Resposta:** Integração entre o serviço OpenCode Go e ferramentas de terceiros (Claude Code). Consulte a documentação da API do OpenCode Go. O TeamCode não oferece este tipo de integração gerenciada.

### A fatura do Go é via REST API ou só TUI?

**Issue:** [#23513 — Does my OpenCode Go subscription bill via the REST API, or is it TUI-only?](https://github.com/anomalyco/opencode/issues/23513)

**Pergunta:** Dúvida sobre como usar a assinatura Go via REST API.

**Resposta:** Questão sobre a superfície de API do serviço OpenCode Go. Consulte a documentação do Go em `opencode.ai/docs/go`. O TeamCode é apenas o cliente CLI; não oferece API gerenciada.

### Limites de tempo (time window) afetam mesmo com modelo próprio

**Issue:** [#23685 — time window limits](https://github.com/anomalyco/opencode/issues/23685)

**Pergunta:** Usuário usava modelo próprio mas ainda sofria restrição de limites.

**Resposta:** Se você está usando o OpenCode conectado a um serviço gerenciado (Zen/Go), os limites de tempo são aplicados pelo servidor upstream. Com o TeamCode usando seus próprios provedores locais ou chaves de API diretas, não há limites de tempo impostos pelo cliente.

### OpenCode Go Free usage exceeded — qual o ciclo?

**Issue:** [#27492 — opencode zen提示Free usage exceeded, subscribe to Go](https://github.com/anomalyco/opencode/issues/27492)

**Pergunta:** Dúvida sobre o período de renovação do plano gratuito.

**Resposta:** O ciclo de renovação do plano gratuito é definido pelo serviço OpenCode Zen/Go upstream. Consulte a página de planos em `opencode.ai`. O TeamCode não impõe limites de uso.

### Adicionar estatísticas de tokens na página do Go

**Issue:** [#27904 — 请增加tokens统计](https://github.com/anomalyco/opencode/issues/27904)

**Pergunta:** Pedido para mostrar consumo de tokens na página de assinatura.

**Resposta:** Sugestão de funcionalidade para o painel de assinatura do OpenCode Go. Direcione para o feedback do OpenCode. O TeamCode não possui página de assinatura.

---

## 4. Interface TUI / CLI / Desktop

### Questão dock não fecha após resposta bem-sucedida no web app

**Issue:** [#27977 — Question dock stays open after successful reply](https://github.com/anomalyco/opencode/issues/27977)
> *(Duplicata: #27976)*

**Pergunta:** Após responder no web app, o dock permanece visível.

**Resposta:** Este é um bug na interface web do OpenCode upstream, relacionado ao evento `question.replied` não ser processado corretamente. O TeamCode é focado no código-fonte CLI e não mantém a interface web.

### Como mostrar output de subagentes no `opencode run`?

**Issue:** [#26229 — How show subagent output when invoking "opencode run"](https://github.com/anomalyco/opencode/issues/26229)

**Pergunta:** O agente principal não exibe output dos subagentes no console.

**Resposta:** O comportamento de output de subagentes no modo `run` é uma característica do OpenCode upstream. No TeamCode, a forma como subagentes reportam progresso pode ser configurada; verifique as opções de logging e formato de saída do fork.

### Question pane overlay bloqueia o texto da conversa

**Issue:** [#23515 — Question pane overlay blocks/dims the conversation text](https://github.com/anomalyco/opencode/issues/23515)

**Pergunta:** O painel de pergunta cobre o texto da análise anterior, dificultando a resposta.

**Resposta:** Este é um problema de UI/UX do TUI do OpenCode upstream. O comportamento do painel de perguntas pode diferir no TeamCode dependendo das modificações na interface.

### O servidor opencode aceita apenas um TUI?

**Issue:** [#22794 — Question: Is opencode server supposed to only allow ONE TUI?](https://github.com/anomalyco/opencode/issues/22794)

**Pergunta:** `opencode serve` só permitia uma conexão TUI; segunda exigia `opencode attach`.

**Resposta:** O comportamento do servidor do OpenCode upstream limita a uma conexão TUI ativa por design. O TeamCode pode ter configurações diferentes para o servidor; consulte a documentação do modo servidor no fork.

### Por que o comando `opencode plugin <version>` exige `--force`?

**Issue:** [#22452 — What is the reason `opencode plugin <new-version>` requires `--force`?](https://github.com/anomalyco/opencode/issues/22452)

**Pergunta:** O comando não substituía versão existente sem `--force`, e a saída dizia "Installed" mesmo sem atualizar.

**Resposta:** Esta é uma decisão de design do gerenciador de plugins do OpenCode upstream (proteção contra sobrescrita acidental). A saída confusa ("Installed" sem atualizar) é um bug de UX. O TeamCode pode ter comportamento diferente para instalação de plugins.

### Por que as funcionalidades "queuing" e "guidance" foram removidas?

**Issue:** [#22284 — Why were the two really useful features, ‘queuing’ and ‘guidance’, removed?](https://github.com/anomalyco/opencode/issues/22284)

**Pergunta:** Funcionalidades úteis de envio de mensagens foram removidas em versões anteriores.

**Resposta:** Decisão de design dos mantenedores do OpenCode upstream. O TeamCode pode ter seguido caminho diferente ou mantido funcionalidades similares. Verifique as funcionalidades disponíveis na versão atual do fork.

### Por que a nova versão é tão lenta? (v1.3.17 e v1.4.0)

**Issue:** [#21450 — Why is the new version so laggy?](https://github.com/anomalyco/opencode/issues/21450)

**Pergunta:** Usuário reverteu para v1.2.10 e o problema foi resolvido.

**Resposta:** Regressão de performance em versões específicas do OpenCode upstream. O TeamCode é um fork independente com seu próprio histórico de versões; problemas de performance de versões específicas do upstream não se aplicam automaticamente.

### Por que moveram auto-accept permissions para as configurações globais?

**Issue:** [#21423 — Why Moved auto-accept permissions into Settings?](https://github.com/anomalyco/opencode/issues/21423)

**Pergunta:** Antes era configurável por projeto, agora é global.

**Resposta:** Mudança de design no OpenCode upstream. O TeamCode pode gerenciar permissões de forma diferente; consulte a documentação de permissões do fork.

### Como obter informações de sessão no header HTTP da requisição LLM?

**Issue:** [#21291 — How to obtain session information in LLM http request header](https://github.com/anomalyco/opencode/issues/21291)

**Pergunta:** O header `x-session-affinity` não era enviado como esperado.

**Resposta:** Esta é uma questão sobre headers HTTP específicos que o OpenCode upstream envia para provedores LLM. O comportamento pode variar entre versões e forks. No TeamCode, verifique a implementação do transporte HTTP para provedores.

### Salto de versão 1.4.x → 1.14.x é normal?

**Issue:** [#23419 — 1.4.x->1.14.x?](https://github.com/anomalyco/opencode/issues/23419)

**Pergunta:** Estratégia de atualização agressiva com bugs frequentes.

**Resposta:** O esquema de versionamento e frequência de releases é uma decisão do upstream. O TeamCode segue seu próprio ciclo de releases. Consulte o changelog do fork para entender a estratégia de versionamento adotada.

### Pergunta não aparece no Desktop — loading infinito

**Issue:** [#22776 — No Answer with all models - Questions aren't working (Desktop)](https://github.com/anomalyco/opencode/issues/22776)

**Pergunta:** O botão de loading ficava girando indefinidamente sem resposta.

**Resposta:** Bug na versão desktop do OpenCode upstream. O TeamCode é um fork do CLI; o aplicativo desktop (Electron) é mantido pelo upstream. Verifique se o TeamCode oferece uma interface desktop alternativa.

### Desktop inicia todas as sessões em /

**Issue:** [#27798 — Desktop app seems to start all sessions at /](https://github.com/anomalyco/opencode/issues/27798)

**Pergunta:** O app desktop inicia toda sessão na raiz, sem seletor de diretório.

**Resposta:** Bug ou limitação do aplicativo desktop do OpenCode upstream. O TeamCode é focado no CLI/TUI; não mantém um aplicativo desktop separado.

### Popup de nome está cortando o texto

**Issue:** [#23054 — Can this popup be made larger? The name is being cut off.](https://github.com/anomalyco/opencode/issues/23054)

**Pergunta:** Nome do arquivo aparecia truncado no popup.

**Resposta:** Problema de layout no TUI do OpenCode upstream. A interface pode ter sido ajustada no TeamCode; verifique o comportamento no fork.

### Scroll com teclado na visualização de código

**Issue:** [#27244 — Key binding of scrolling in session output view](https://github.com/anomalyco/opencode/issues/27244)

**Pergunta:** Page Up/Down só funcionam em sessões, não na visualização de code review.

**Resposta:** Limitação de key bindings no TUI do OpenCode upstream. O TeamCode pode ter mapeamentos de teclas diferentes; consulte a documentação de atalhos de teclado do fork.

### Como esconder Keymap permanentemente e abrir mensagem no editor?

**Issue:** [#26607 — Hide Keymap Option by Default + Open Message in Editor](https://github.com/anomalyco/opencode/issues/26607)

**Pergunta:** Dúvida sobre configuração do keymap e atalho para abrir mensagem no editor.

**Resposta:** Questão sobre personalização do TUI do OpenCode upstream. As opções de keymap e atalhos podem ser configuradas de forma diferente no TeamCode.

### Problemas de cópia e scroll no PowerShell

**Issue:** [#21872 — 复制，滚动条等体验问题](https://github.com/anomalyco/opencode/issues/21872)

**Pergunta:** No PowerShell do Windows, não era possível copiar com duplo clique.

**Resposta:** Problema de compatibilidade entre o terminal Windows (PowerShell) e a interface TUI do OpenCode upstream. O TeamCode pode utilizar bibliotecas de terminal diferentes que se comportam melhor no Windows.

### "Subagent sessions cannot be prompted" no Windows

**Issue:** [#21458 — Subagent sessions cannot be prompted. Back to main session.](https://github.com/anomalyco/opencode/issues/21458)

**Pergunta:** Mudança na versão Windows impedia guiar subagentes.

**Resposta:** Mudança de comportamento específica da versão Windows do OpenCode upstream. O TeamCode pode ter implementação diferente para subagentes; verifique a documentação.

### Desktop com dois ícones e espaço duplicado

**Issue:** [#26755 — Opencode Desktop for Windows - Duplicated disk space usage](https://github.com/anomalyco/opencode/issues/26755)

**Pergunta:** App desktop do Windows criava duas entradas: Program Files e AppData Local.

**Resposta:** Problema no instalador Windows do OpenCode desktop upstream. O TeamCode não distribui aplicativo desktop; esta questão não se aplica.

### Múltiplos projetos — troca entre projetos não responde

**Issue:** [#26795 — 打开多个项目后，点击左侧其他项目切换时无响应](https://github.com/anomalyco/opencode/issues/26795)

**Pergunta:** Após executar código em um projeto, não era possível trocar para outro.

**Resposta:** Bug na interface desktop do OpenCode upstream. O comportamento de troca de projetos pode ser diferente no TeamCode.

### Última versão é "merda" — funcionalidades removidas

**Issue:** [#25827 — 最新版犹如狗屎](https://github.com/anomalyco/opencode/issues/25827)

**Pergunta:** Refresh, deleção de sessão e edição de API removidos na última versão.

**Resposta:** Feedback sobre remoção de funcionalidades em versão específica do OpenCode upstream. Estas funcionalidades podem ou não estar presentes no TeamCode; verifique as funcionalidades disponíveis no fork.

---

## 5. Interface Web (Web UI)

### Como exibir o histórico de sessões no lado esquerdo do WebUI?

**Issue:** [#23686 — How can session history be displayed on the left side of WebUI](https://github.com/anomalyco/opencode/issues/23686)

**Pergunta:** Cada nova sessão não mostrava o histórico das anteriores.

**Resposta:** Questão sobre a interface web do OpenCode upstream (`packages/web/`). O TeamCode é focado no código-fonte CLI e não mantém a interface web do OpenCode.

### Web UI mostra conteúdo da home folder ao selecionar projeto

**Issue:** [#22659 — When i am in the web interface and select open project...](https://github.com/anomalyco/opencode/issues/22659)

**Pergunta:** O seletor de projeto no web UI listava a home folder, não apenas o diretório permitido.

**Resposta:** Bug de segurança/usabilidade na interface web do OpenCode upstream. Não se aplica ao TeamCode (foco em CLI/TUI).

### Web Server — abrir projetos de subpastas

**Issue:** [#21511 — Web Server - open projects from subfolders](https://github.com/anomalyco/opencode/issues/21511)

**Pergunta:** Apenas pastas raiz eram tratadas como projetos; subpastas não podiam ser abertas.

**Resposta:** Limitação do servidor web do OpenCode upstream. O TeamCode pode ter comportamento diferente para servir projetos; consulte a documentação do modo servidor no fork.

---

## 6. Plugins, MCP e Extensões

### Mutar `cfg` no hook `config` é suportado?

**Issue:** [#24065 — Is mutating `cfg` in the `config` hook an officially supported pattern?](https://github.com/anomalyco/opencode/issues/24065)

**Pergunta:** Plugin registrava agentes, comandos e MCP servers via mutação direta do objeto `cfg`.

**Resposta:** Questão sobre a API de plugins do OpenCode upstream — se mutar `cfg` é um padrão suportado oficialmente ou efeito colateral não intencional. O TeamCode pode ter uma API de plugins diferente; consulte a documentação de plugins do fork.

### OpenCode depende de patch não-oficial do solidjs/start

**Issue:** [#27422 — Opencode depends on unofficial hacky patch to old solidjs/start](https://github.com/anomalyco/opencode/issues/27422)

**Pergunta:** Dependência problemática para CI/CD.

**Resposta:** Esta dependência específica (`@solidjs/start` via URL de PR) é da interface web do OpenCode upstream. O TeamCode não inclui a interface web, portanto esta dependência não se aplica.

### Timeout de 120s do MCP impede uso com modelos lentos

**Issue:** [#21820 — opencode内置超时机制使得mcp无法使用](https://github.com/anomalyco/opencode/issues/21820)

**Pergunta:** O timeout padrão de 120s para MCP era insuficiente para modelos como GLM-5.

**Resposta:** O timeout de MCP é uma configuração no OpenCode upstream. O TeamCode pode expor configurações de timeout ajustáveis para MCP; verifique a documentação de MCP do fork.

### oh-my-opencode não funciona após instalação

**Issue:** [#21509 — opencode always attempt to install oh-my-opencode](https://github.com/anomalyco/opencode/issues/21509)

**Pergunta:** Após instalar via comando, o OpenCode tentava reinstalar e o plugin não funcionava.

**Resposta:** Problema com o plugin `oh-my-opencode` no ecossistema do OpenCode upstream. O TeamCode pode ter compatibilidade diferente com plugins da comunidade; verifique se o plugin é compatível com o fork.

---

## 7. Sessões e Histórico

### Sessões não são salvas no Desktop Windows

**Issue:** [#25506 — 本地使用，页面会话没有显示](https://github.com/anomalyco/opencode/issues/25506)

**Pergunta:** As sessões não persistiam após fechar o app desktop.

**Resposta:** Bug de persistência no aplicativo desktop do OpenCode upstream. O TeamCode salva sessões em banco de dados local SQLite; verifique se há problemas de permissão de escrita no diretório de dados.

### Histórico de sessões desaparece e arquivamento é confuso

**Issue:** [#26505 — Session history disappears and archived sessions are difficult to restore](https://github.com/anomalyco/opencode/issues/26505)

**Pergunta:** Sessões arquivadas sumiam da sidebar e `opencode --continue` mostrava `undefined`.

**Resposta:** Problemas de gerenciamento de sessões no TUI do OpenCode upstream. O TeamCode pode ter uma implementação diferente de arquivamento e restauração de sessões; consulte a documentação de sessões no fork.

### Ordem da mensagem de sumarização após compactação

**Issue:** [#24963 — Compaction: summary message appears after tail messages](https://github.com/anomalyco/opencode/issues/24963)

**Pergunta:** Após compactação, a mensagem "What did we do so far?" aparecia antes do sumário, causando confusão.

**Resposta:** Questão sobre a ordenação de mensagens durante a compactação de contexto — um design questionável do OpenCode upstream. O TeamCode pode ter uma estratégia de compactação diferente; verifique a implementação local.

---

## 8. Permissões e Segurança

### Permissões não funcionam como esperado — bash skill contorna

**Issue:** [#22375 — Unable to get permissions to work as intended](https://github.com/anomalyco/opencode/issues/22375)

**Pergunta:** Mesmo negando `list`, o bash skill permitia `ls`. Editar era contornado por `echo >`.

**Resposta:** Esta é uma limitação do sistema de permissões do OpenCode upstream: skills podem contornar as regras de permissão porque operam em nível diferente. O TeamCode pode ter um sistema de permissões mais robusto; consulte a documentação de segurança do fork.

### OpenCode injeta env/skills DEPOIS do system prompt, quebrando agentes

**Issue:** [#24156 — OpenCode injects env/skills prompts AFTER custom agent prompt](https://github.com/anomalyco/opencode/issues/24156)

**Pergunta:** A ordem dos prompts fazia o modelo tratar instruções de ambiente como texto normal.

**Resposta:** A ordem de montagem do prompt (system prompt do agente + env/skills) é uma decisão de implementação do OpenCode upstream. O TeamCode pode ter uma abordagem diferente para composição de prompts; verifique a documentação de agentes no fork.

---

## 9. Compatibilidade e Integração

### Configurar OpenCode + WSL + Playwright CLI

**Issue:** [#23815 — How to configure Opencode + WSL + playwright-cli](https://github.com/anomalyco/opencode/issues/23815)

**Pergunta:** Playwright funcionava no WSL mas não quando chamado pelo OpenCode.

**Resposta:** O OpenCode upstream pode não herdar corretamente as variáveis de ambiente do shell (como as definidas no `.bashrc` do WSL). Esta é uma limitação conhecida. No TeamCode, verifique se o PATH e as variáveis de ambiente estão sendo passadas corretamente para os comandos executados.

### OpenCode com Hermes — texto ASCII ao mover o mouse

**Issue:** [#25280 — i am using opencode + hermes and i get asciii text when moving my mouse](https://github.com/anomalyco/opencode/issues/25280)

**Pergunta:** Texto ASCII aparecia na tela ao mover o mouse durante carregamento de MCPs.

**Resposta:** Problema de renderização no terminal ao usar Hermes com o OpenCode upstream. Provavelmente relacionado a conflito de modos de terminal ou artefatos de renderização. Pode ser específico do emulador de terminal ou do provedor Hermes.

### Como usar CC Switch com modelos Xiaomi MiMo?

**Issue:** [#27273 — 小米模型Mimo使用CC Switch接入的问题](https://github.com/anomalyco/opencode/issues/27273)

**Pergunta:** Erro `reasoning_content must be passed back` ao usar MiMo via CC Switch.

**Resposta:** Erro de compatibilidade entre o formato de reasoning do modelo MiMo e o gateway CC Switch. O modelo espera que o reasoning_content seja retornado nas chamadas subsequentes. Questão de configuração do gateway, não do OpenCode em si.

### API de terceiros não consegue dialogar

**Issue:** [#27693 — 第三方厂商api无法对话](https://github.com/anomalyco/opencode/issues/27693)

**Pergunta:** API de terceiros configurada, modelo selecionável, mas sem output.

**Resposta:** A API de terceiros (CC Switch / proxy) pode não ser totalmente compatível com o formato esperado pelo OpenCode upstream. Verifique se o proxy suporta streaming e o formato de chat completions da OpenAI. No TeamCode, configure provedores `openai-compatible`.

### Mesmo provider/model com variantes diferentes

**Issue:** [#25248 — Same provider/model with different variants](https://github.com/anomalyco/opencode/issues/25248)

**Pergunta:** Ao usar mesmo provider para Plan e Build com variantes diferentes, a última variante usada prevalecia.

**Resposta:** Bug no gerenciamento de variantes do OpenCode upstream quando o mesmo provider/model é usado para múltiplos agentes. O TeamCode pode ter lógica diferente para resolução de variantes por agente.

### Diferença entre invocar subagente via `@explore` vs. mencionar "explore"

**Issue:** [#25105 — Difference explicitely invoking subagent via "@explore" vs nudging](https://github.com/anomalyco/opencode/issues/25105)

**Pergunta:** Dúvida sobre o comportamento de `@` notation e se funciona em AGENTS.md.

**Resposta:** A `@` notation é uma funcionalidade do OpenCode upstream para referenciar agentes explicitamente. O comportamento pode variar entre contexto (prompt do usuário vs. AGENTS.md). O TeamCode pode ter implementado a `@` notation de forma diferente; consulte a documentação.

### Conversão de tools Anthropic → OpenAI para DeepSeek

**Issue:** [#25107 — Anthropic tools format conversion to OpenAI tools format](https://github.com/anomalyco/opencode/issues/25107)

**Pergunta:** Ao usar Claude Code como gateway, os tools não eram convertidos para o formato OpenAI.

**Resposta:** Problema de compatibilidade no gateway (Claude Code) que não converte o formato de tools Anthropic para OpenAI. O TeamCode usa nativamente o formato OpenAI para tool calling; verifique se o seu gateway suporta esta conversão.

### OpenCode lento com vLLM — tool calls não funcionam

**Issue:** [#22525 — opencode调用vllm部署的模型,调用工具报错](https://github.com/anomalyco/opencode/issues/22525)

**Pergunta:** Modelo GLM5 via vLLM com `--tool-call-parser glm47` não era compatível.

**Resposta:** O OpenCode upstream espera um formato específico de tool calling (OpenAI-compatible). O parser `glm47` do vLLM pode não produzir o formato esperado. Configure o vLLM com `--tool-call-parler hermes` ou `--enable-auto-tool-choice` para compatibilidade.

### IntelliJ IDEA adiciona outros modelos de IA

**Issue:** [#21606 — IntelliJ IDEA adds other AI models](https://github.com/anomalyco/opencode/issues/21606)

**Pergunta:** Após abrir o ACP do OpenCode, não havia entrada para reconfigurar o modelo.

**Resposta:** Questão sobre a integração OpenCode + IntelliJ IDEA. O plugin para IntelliJ é mantido pelo ecossistema upstream. O TeamCode pode não ter integração específica com IDEs JetBrains.

### Conexão com API falha — socket fechado inesperadamente

**Issue:** [#21643 — Cannot connect to API: The socket connection was closed unexpectedly](https://github.com/anomalyco/opencode/issues/21643)

**Pergunta:** Modelos Zen não conectavam, mas Copilot funcionava (ambiente QEMU/Linux).

**Resposta:** O erro de socket sugere um problema de rede ou TLS entre o cliente e os servidores do OpenCode Zen. Pode ser causado por configuração de proxy, firewall ou certificados no ambiente QEMU. O TeamCode não usa servidores upstream para funcionar com provedores locais.

---

## 10. Comportamento e Bugs

### Plan Mode Agent spawnou General Subagent para editar código

**Issue:** [#24741 — Plan Mode Agent Spawned General Subagent to edit code](https://github.com/anomalyco/opencode/issues/24741)

**Pergunta:** Em Plan Mode, o agente principal invocou General Agent para fazer edições — bug ou feature?

**Resposta:** Este comportamento depende de como os agentes são configurados no OpenCode upstream. Se o Plan Agent tiver permissão para delegar a subagentes, pode invocar ferramentas de edição indiretamente. O TeamCode oferece controle sobre quais ferramentas cada agente pode usar.

### O aplicativo não inicia — apenas uma caixa no meio da tela

**Issue:** [#23918 — why does not it start](https://github.com/anomalyco/opencode/issues/23918)

**Pergunta:** O app abria apenas uma pequena caixa e fazia barulho de disco sem progredir.

**Resposta:** Bug grave no aplicativo desktop do OpenCode upstream (provavelmente travava na inicialização). Não se aplica ao TeamCode.

### Preferência por solução "mais simples" é muito alta

**Issue:** [#24940 — Preference for "simplest" solution is too high](https://github.com/anomalyco/opencode/issues/24940)

**Pergunta:** O agente sempre escolhia a solução mais simples, deletando lógica importante.

**Resposta:** Este é um comportamento do modelo de IA, não do OpenCode em si. O viés por soluções simples é uma característica dos prompts de sistema e do treinamento do modelo. Você pode ajustar os prompts dos agentes no `opencode.json` para incentivar abordagens mais completas.

### Question replies não roteiam para o workspace remoto ativo

**Issue:** [#23843 — Question replies do not route to the active remote workspace](https://github.com/anomalyco/opencode/issues/23843)

**Pergunta:** O parâmetro `workspace` não era enviado no POST de resposta.

**Resposta:** Bug no SDK do OpenCode upstream onde o workspace remoto não era incluído nas requisições de resposta a perguntas. O TeamCode pode ter corrigido ou implementado o roteamento de workspaces de forma diferente.

### Pasta NAS indisponível impede OpenCode de iniciar

**Issue:** [#24474 — Unavailable NAS shared folder used as a projects directory prevents OpenCode from launching](https://github.com/anomalyco/opencode/issues/24474)

**Pergunta:** Diretório de projeto em NAS desmontado impedia a abertura do app.

**Resposta:** O OpenCode upstream (desktop) parece travar se um diretório de projeto configurado estiver inacessível. O TeamCode pode ser mais resiliente a diretórios de projeto indisponíveis; verifique a configuração de diretórios de projeto no fork.

### Traduzir prompts não-ingleses para inglês antes de processar

**Issue:** [#23077 — Translating prompts to english before doing the job](https://github.com/anomalyco/opencode/issues/23077)

**Pergunta:** Modelos funcionam melhor em inglês; sugestão de tradução automática de prompts.

**Resposta:** Sugestão de funcionalidade para o OpenCode upstream. O TeamCode pode implementar ou não tradução automática de prompts. Esta funcionalidade depende do modelo de IA utilizado, não do cliente OpenCode em si.

### "List all files" inclui node_modules — tokens desperdiçados

**Issue:** [#22779 — Should "list all files" exclude `node_modules/` to save tokens?](https://github.com/anomalyco/opencode/issues/22779)

**Pergunta:** Listar arquivos em `.opencode/` incluía `node_modules`, gerando excesso de tokens.

**Resposta:** O comando de listagem de arquivos no OpenCode upstream pode não respeitar os padrões de ignorar (`.gitignore`) corretamente. O TeamCode respeita `.gitignore` e arquivos de configuração de contexto; verifique as configurações de escopo de arquivos.

### Playwright CLI no OpenCode fica bloqueado após abrir browser

**Issue:** [#22767 — opencode中使用playwright cli执行open命令一直阻塞](https://github.com/anomalyco/opencode/issues/22767)

**Pergunta:** Browser abria mas o comando não terminava; no PowerShell funcionava.

**Resposta:** O OpenCode upstream pode não estar capturando corretamente a saída do processo Playwright. A diferença de comportamento entre PowerShell e OpenCode sugere que o OpenCode não está recebendo os eventos de lifecycle do Playwright.

### Diferença entre versão desktop e electron?

**Issue:** [#24603 — What's the difference between the desktop and electron version?](https://github.com/anomalyco/opencode/issues/24603)

**Pergunta:** Usuário não encontrou documentação sobre a diferença.

**Resposta:** O OpenCode upstream oferecia (ou oferece) duas variantes de aplicativo: "desktop" (nativo) e "electron". As diferenças não eram documentadas. O TeamCode não oferece múltiplas variantes de aplicativo.

### v1.4.2 é a última versão estável?

**Issue:** [#23036 — I think v1.4.2 is the latest stable version who is with me?](https://github.com/anomalyco/opencode/issues/23036)

**Pergunta:** Versões posteriores apresentavam bugs de memória e WebUI.

**Resposta:** Discussão sobre estabilidade de versões específicas do OpenCode upstream. O TeamCode segue sua própria numeração de versões e pode ter resolvido problemas similares.

### Agente pode obter logs do terminal?

**Issue:** [#21994 — can agent obtain terminal logs?](https://github.com/anomalyco/opencode/issues/21994)

**Pergunta:** Dúvida se o agente pode acessar logs do terminal para auto-correção.

**Resposta:** Por padrão, o OpenCode não expõe logs de terminal para o agente. Esta funcionalidade precisaria ser implementada como uma ferramenta personalizada ou skill. O TeamCode permite a criação de skills e ferramentas customizadas através do sistema de plugins.

### Erro "Upgrade Required" com endpoint OpenAI-compatible local

**Issue:** [#22164 — Upgrade required !!?](https://github.com/anomalyco/opencode/issues/22164)

**Pergunta:** Endpoint local/compatível OpenAI retornava "Upgrade Required" no OpenCode.

**Resposta:** O erro "Upgrade Required" sugere que o OpenCode upstream está fazendo uma requisição HTTP/2 para um servidor que só aceita HTTP/1.1, ou vice-versa. Pode ser um problema de configuração do servidor local. Verifique a compatibilidade de protocolo do seu endpoint.

### Fork de contexto pai em múltiplos subagentes

**Issue:** [#22269 — Fork parent context into multiple subagents](https://github.com/anomalyco/opencode/issues/22269)

**Pergunta:** Sugestão de paralelizar trabalho em 20+ pacotes com subagentes independentes que herdam contexto do planejamento.

**Resposta:** Sugestão de funcionalidade para o OpenCode upstream. O TeamCode pode ter suporte diferente para fork de contexto entre subagentes. Esta funcionalidade depende de como o cache de contexto e a delegação são implementados no fork.

### Dúvida sobre configuração de LSP customizado (Luau)

**Issue:** [#22199 — Doubt with Custom LSP configuration](https://github.com/anomalyco/opencode/issues/22199)

**Pergunta:** Dificuldade em configurar LSP para Roblox/Luau.

**Resposta:** A configuração de LSPs customizados no OpenCode upstream segue a documentação em `opencode.ai/docs/lsp`. Se o Luau LSP não funciona, verifique se o comando e argumentos estão corretos. O TeamCode suporta a mesma configuração de LSP.

### AI modificou `opencode.json` e agora não conecta ao servidor

**Issue:** [#22247 — ai修改了一个名为opencode.json文件过后 重启就一直提示无法连接服务器](https://github.com/anomalyco/opencode/issues/22247)

**Pergunta:** Após o agente modificar `opencode.json`, o servidor não conectava mais, mesmo reinstalando.

**Resposta:** Se o agente modificou o `opencode.json` com configurações inválidas, o OpenCode pode falhar ao iniciar. Isto não é um bug do OpenCode, mas sim um risco de permitir que o agente edite seus próprios arquivos de configuração. Sempre valide as alterações feitas pelo agente.

### `opencode stats` — como resetar ou ver timeframe específico?

**Issue:** [#26061 — Resetting or viewing stats](https://github.com/anomalyco/opencode/issues/26061)

**Pergunta:** Dúvida sobre resetar estatísticas e ver saldo restante fora do site.

**Resposta:** O comando `opencode stats` no OpenCode upstream mostra estatísticas locais de uso. Para ver saldo de assinatura, é necessário acessar o site do OpenCode. O TeamCode pode ter comandos diferentes para estatísticas; consulte a documentação.

### Server status oscila entre online/offline no Windows

**Issue:** [#25951 — Server status](https://github.com/anomalyco/opencode/issues/25951)

**Pergunta:** Status do servidor ficava alternando no app desktop Windows.

**Resposta:** Bug no aplicativo desktop do OpenCode upstream. O TeamCode não mantém aplicativo desktop, portanto esta questão não se aplica.

### Missing Authentication header ao usar ChatGPT

**Issue:** [#25757 — Missing Authentication header when I try to use open code](https://github.com/anomalyco/opencode/issues/25757)

**Pergunta:** Após autenticação headless, o erro "Missing Authentication header" voltava ao reiniciar.

**Resposta:** Problema de persistência de autenticação no OpenCode upstream. O token de autenticação pode não estar sendo salvo corretamente no `auth.json`. No TeamCode, configure provedores com chaves de API diretamente no `opencode.json`.

### OpenCode é gratuito permanentemente?

**Issue:** [#25619 — Is OpenCode Free to Use Indefinitely?](https://github.com/anomalyco/opencode/issues/25619)

**Pergunta:** Dúvida se o plano gratuito tem prazo de validade ou restrições.

**Resposta:** O OpenCode upstream oferece um plano gratuito (Zen) com limitações. O TeamCode é completamente gratuito e de código aberto — você pode usar seus próprios provedores de API livremente.

### Por que o OpenCode cria um arquivo `.git/opencode`?

**Issue:** [#25618 — Why Does OpenCode Create a .git/opencode File?](https://github.com/anomalyco/opencode/issues/25618)

**Pergunta:** Um arquivo com hash era criado em `.git/opencode`.

**Resposta:** O OpenCode upstream cria este arquivo para identificar o repositório git e associá-lo a workspaces/sessões. O hash provavelmente é um identificador único do repositório. O TeamCode pode ter comportamento similar ou diferente para identificação de projetos.

---

## 11. Dúvidas Gerais sobre o Projeto

### Como começar com Vibe Coding usando OpenCode + modelos gratuitos?

**Issue:** [#28022 — How to get started with Vibe Coding using opencode + free models?](https://github.com/anomalyco/opencode/issues/28022)

**Pergunta:** Usuário iniciante queria boas práticas, pitfalls comuns e tipos de projeto recomendados.

**Resposta:** Pergunta geral sobre uso do OpenCode upstream. Para começar com o TeamCode: instale a partir da fonte, configure um provedor (Ollama para modelos locais gratuitos, ou chave de API de algum provedor), e experimente com projetos pequenos. Consulte a documentação do TeamCode para guias de início rápido.

### O projeto está vivo? Roadmap?

**Issue:** [#26711 — Is This Project Alive?](https://github.com/anomalyco/opencode/issues/26711)

**Pergunta:** Dúvida sobre a atividade do projeto diante de releases automáticas diárias e 4.9k issues abertas.

**Resposta:** Questão sobre a saúde do projeto upstream. O TeamCode é um fork independente com seu próprio roadmap e cadência de desenvolvimento. Consulte o repositório do TeamCode para informações sobre atividade e plano de desenvolvimento.

### Podem abrir a seção de discussões no GitHub?

**Issue:** [#27489 — Can we open the discussion section?](https://github.com/anomalyco/opencode/issues/27489)

**Pergunta:** Sugestão de criar GitHub Discussions para dúvidas gerais, dicas e truques.

**Resposta:** Sugestão para o repositório upstream. O TeamCode pode ou não ter Discussions habilitado. Verifique o repositório do TeamCode para canais de comunidade.

### Liberar versões todos os dias é necessário?

**Issue:** [#26313 — Hey guys...](https://github.com/anomalyco/opencode/issues/26313)

**Pergunta:** Crítica à frequência de releases que introduziam bugs e comportamentos inconsistentes.

**Resposta:** Feedback sobre a cadência de releases do upstream. O TeamCode segue sua própria estratégia de releases. Consulte o roadmap e changelog do fork para entender a frequência de atualizações.

### Como deletar minha conta?

**Issue:** [#24303 — How can I delete my account?](https://github.com/anomalyco/opencode/issues/24303)

**Pergunta:** Usuário queria saber como excluir a conta.

**Resposta:** Esta é uma questão sobre contas de usuário no serviço OpenCode (opencode.ai). O TeamCode é um fork do código-fonte e não gerencia contas de usuário. Para deletar sua conta no OpenCode, acesse as configurações de conta no site `opencode.ai`.

### Doações?

**Issue:** [#21560 — Donations?](https://github.com/anomalyco/opencode/issues/21560)

**Pergunta:** Usuário já assinante Zen queria fazer doações mensais adicionais.

**Resposta:** Questão sobre como apoiar financeiramente o projeto upstream. O TeamCode é um fork independente; consulte o repositório do TeamCode para informações sobre como apoiar o projeto.

### Vai considerar Mempalace como session db?

**Issue:** [#27710 — Mempalace as session db](https://github.com/anomalyco/opencode/issues/27710)

**Pergunta:** Sugestão de usar Mempalace como banco de sessões para busca contextual com poucos tokens.

**Resposta:** Sugestão de funcionalidade para o OpenCode upstream. O TeamCode usa SQLite para armazenamento de sessões. A adoção de Mempalace ou outro mecanismo de busca dependeria do roadmap do fork.

### OpenCode question.asked — como responder via Server API?

**Issue:** [#27644 — OpenCode question tool emits question.asked but no documented way to answer via Server API](https://github.com/anomalyco/opencode/issues/27644)

**Pergunta:** A API emite evento `question.asked` mas não há documentação de como responder.

**Resposta:** Questão sobre a API de eventos do servidor OpenCode upstream. O mecanismo para responder perguntas via API pode não estar documentado ou pode ser diferente no TeamCode. Consulte a documentação da API do servidor no fork.

---

> **Total: 124 perguntas** organizadas em 11 categorias, cada uma com sua resposta
> explicando por que a questão não se aplica ao fork TeamCode.
>
> Fonte: `.opencode/issues/not-planned.md` — issues do upstream
> [anomalyco/opencode](https://github.com/anomalyco/opencode) que estão fora
> do escopo do fork TeamCode.
