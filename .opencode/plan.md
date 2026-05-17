# 🔴 Plano de Implementação — Issues Críticas

Total: 227 issues críticas | 10 alta prioridade para implementação

> ⚠️ 200/227 são específicas de plataforma (Windows/macOS/Linux/Docker/Desktop) e podem não se aplicar diretamente ao nosso fork.

---

## Prioridade Alta (implementação imediata)

### #27924 — bug(session): infinite compaction loop when compression fails to reduce context

**Área:** `session`

**Problema:** Infinite compaction loop when compression fails to reduce context

**Fix:** Add max iteration guard in compaction loop

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27924](https://github.com/anomalyco/opencode/issues/27924)

---

### #27923 — bug(config): pluginAutoInstall config has no effect

**Área:** `config`

**Problema:** pluginAutoInstall config has no effect

**Fix:** Wire pluginAutoInstall config flag to plugin install behavior

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27923](https://github.com/anomalyco/opencode/issues/27923)

---

### #27779 — acp/agent: prompt() silently swallows SDK errors — end_turn returned with no content on failure

**Área:** `acp`

**Problema:** acp/agent: prompt() silently swallows SDK errors

**Fix:** Propagate SDK errors instead of swallowing in end_turn

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27779](https://github.com/anomalyco/opencode/issues/27779)

---

### #27724 — Agents have no awareness of MCPs that need auth

**Área:** `mcp`

**Problema:** Agents have no awareness of MCPs that need auth

**Fix:** Expose MCP auth status to agent prompt/system context

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27724](https://github.com/anomalyco/opencode/issues/27724)

---

### #27663 — Bug: prompt_async stops publishing message.part.delta events on second call (conversation continuation)

**Área:** `session`

**Problema:** prompt_async stops publishing message.part.delta events on second call

**Fix:** Fix event subscription lifecycle for consecutive prompt_async calls

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27663](https://github.com/anomalyco/opencode/issues/27663)

---

### #27629 — fix(provider): Z.AI GLM overflow error not classified as context overflow, causing chain compaction

**Área:** `provider`

**Problema:** Z.AI GLM overflow error not classified as context overflow

**Fix:** Add Z.AI GLM error pattern to context overflow detection

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27629](https://github.com/anomalyco/opencode/issues/27629)

---

### #26177 — Run loop continues on orphaned interrupted tools, triggering "model does not support assistant message prefill" 400 errors

**Área:** `session`

**Problema:** Run loop continues on orphaned interrupted tools

**Fix:** Guard against orphaned tool state in session run loop

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/26177](https://github.com/anomalyco/opencode/issues/26177)

---

### #25421 — ACP agent_message_chunk frames land after end_turn RPC reply due to event-subscription / prompt-RPC race

**Área:** `acp`

**Problema:** ACP agent_message_chunk frames land after end_turn RPC reply

**Fix:** Ensure event subscription cleanup before end_turn resolves

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/25421](https://github.com/anomalyco/opencode/issues/25421)

---

### #21924 — [HIGH PRIORITY] AI reads files outside permitted directory

**Área:** `permission`

**Problema:** AI reads files outside permitted directory

**Fix:** Enforce permission boundary in file read tool

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/21924](https://github.com/anomalyco/opencode/issues/21924)

---

### #27844 — opentui: fatal: No renderer found

**Área:** `tui`

**Problema:** opentui: fatal: No renderer found

**Fix:** Add graceful fallback when TUI renderer is unavailable

**Status:** ⏳ Pendente

**URL:** [https://github.com/anomalyco/opencode/issues/27844](https://github.com/anomalyco/opencode/issues/27844)

---


## Anexo: Todas as 227 Issues Críticas por Categoria
