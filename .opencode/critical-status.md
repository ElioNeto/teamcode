# 🔴 Status — Implementação de Issues Críticas

| # | Issue | Área | Status | Commit |
|---|-------|------|--------|--------|
| #27924 | Infinite compaction loop when compression fails | session | ✅ | 877cfcd |
| #27923 | pluginAutoInstall config has no effect | config | ❌ skipped | — |
| #27779 | acp/agent: prompt() silently swallows SDK errors | acp | ✅ | c82c6aa |
| #27724 | Agents have no awareness of MCPs that need auth | mcp | ❌ feature request | — |
| #27663 | prompt_async stops publishing message.part.delta | session | ❌ complex scope bug | — |
| #27629 | Z.AI GLM overflow error not classified as context overflow | provider | ✅ | 77540d9 |
| #26177 | Run loop continues on orphaned interrupted tools | session | ✅ | 77540d9 |
| #25421 | ACP agent_message_chunk frames land after end_turn | acp | ✅ | c82c6aa |
| #21924 | AI reads files outside permitted directory | permission | ✅ | 3cddafc |
| #27844 | opentui: fatal: No renderer found | tui | ✅ | 6021541 |

### Legend
- ✅ Fix implementado e commitado
- ❌ skipped: Config field não existe neste fork
- ❌ feature request: Requer nova funcionalidade (PR #27725 existe upstream)
- ❌ complex scope bug: Envolve interação profunda entre InstanceState/escopo Effect

### Summary
**Total:** 10 issues → **6 fixed**, **3 skipped**, **1 feature request**
**Commits:** 877cfcd 77540d9 c82c6aa 3cddafc 6021541
