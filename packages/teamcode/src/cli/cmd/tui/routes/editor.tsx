/**
 * Editor route/page — full-screen code editor.
 */

import { createSignal } from "solid-js"
import { useRoute } from "@tui/context/route"
import { useProject } from "@tui/context/project"
import { useToast } from "@tui/ui/toast"
import { Editor } from "../component/editor/editor"
import { TextBuffer } from "../component/editor/buffer"
import { VimEngine } from "../component/editor/vim-mode"
import type { EditorRoute } from "../context/route"

export function EditorPage() {
  const route = useRoute()
  const project = useProject()
  const toast = useToast()

  const routeData = () => route.data as EditorRoute

  const [buffer] = createSignal<TextBuffer>(new TextBuffer(routeData().filePath))
  const [showTree] = createSignal(true)

  const vim = new VimEngine(buffer(), {
    onSave: handleSave,
    onCloseEditor: handleClose,
    onSearch: () => toast.show({ message: "Search mode", variant: "info" }),
  })

  async function handleSave() {
    const fp = buffer().options.filePath
    if (!fp) {
      toast.show({ message: "No file path to save", variant: "warning" })
      return
    }
    try {
      const content = buffer().getText()
      await fetch(`file://${fp}`, { method: "PUT", body: content })
      buffer().markSaved()
      toast.show({ message: "Saved", variant: "info" })
    } catch (err) {
      toast.show({
        message: `Failed to save: ${err instanceof Error ? err.message : String(err)}`,
        variant: "error",
      })
    }
  }

  function handleClose() {
    if (buffer().isDirty) {
      toast.show({ message: "Unsaved changes. Use :w to save first.", variant: "warning" })
      return
    }
    route.navigate({ type: "home" })
  }

  return (
    <box flexGrow={1}>
      <Editor
        buffer={buffer()}
        vim={vim}
        onSave={handleSave}
        onClose={handleClose}
        showFileTree={showTree()}
        rootDir={routeData().rootDir ?? project.instance.path().directory}
      />
    </box>
  )
}
