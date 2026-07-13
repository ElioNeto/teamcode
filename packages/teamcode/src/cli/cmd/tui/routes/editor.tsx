/**
 * Editor route/page — full-screen code editor.
 */

import { createSignal, onMount } from "solid-js"
import { useRoute } from "@tui/context/route"
import { useProject } from "@tui/context/project"
import { useToast } from "@tui/ui/toast"
import { Editor, saveBufferToDisk, loadBufferFromDisk } from "../component/editor/editor"
import { TextBuffer } from "../component/editor/buffer"
import { VimEngine } from "../component/editor/vim-mode"
import type { EditorRoute } from "../context/route"

export function EditorPage() {
  const route = useRoute()
  const project = useProject()
  const toast = useToast()

  const routeData = () => route.data as EditorRoute

  const buf = new TextBuffer(routeData().filePath)
  const [showTree] = createSignal(true)

  // Load file from disk on mount if filePath is provided
  onMount(async () => {
    if (routeData().filePath) {
      await loadBufferFromDisk(buf)
    }
  })

  const vim = new VimEngine(buf, {
    onSave: handleSave,
    onCloseEditor: handleClose,
    onSearch: () => toast.show({ message: "Search mode", variant: "info" }),
  })

  async function handleSave() {
    const fp = buf.options.filePath
    if (!fp) {
      toast.show({ message: "No file path to save. Use file tree to open a file.", variant: "warning" })
      return
    }
    const ok = await saveBufferToDisk(buf)
    if (ok) {
      toast.show({ message: "Saved", variant: "info" })
    } else {
      toast.show({ message: "Failed to save file", variant: "error" })
    }
  }

  function handleClose() {
    if (buf.isDirty) {
      toast.show({ message: "Unsaved changes. Press Ctrl+S to save first.", variant: "warning" })
      return
    }
    route.navigate({ type: "home" })
  }

  return (
    <box flexGrow={1}>
      <Editor
        buffer={buf}
        vim={vim}
        onSave={handleSave}
        onClose={handleClose}
        showFileTree={true}
        rootDir={routeData().rootDir ?? project.instance.path().directory}
      />
    </box>
  )
}
