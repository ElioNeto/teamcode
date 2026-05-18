import { Button } from "@teamcode-ai/ui/button"
import { Card } from "@teamcode-ai/ui/card"
import { Icon } from "@teamcode-ai/ui/icon"
import { Tag } from "@teamcode-ai/ui/tag"
import { Logo } from "@teamcode-ai/ui/logo"
import { getFilename } from "@teamcode-ai/core/util/path"
import { useNavigate, A } from "@solidjs/router"
import { base64Encode } from "@teamcode-ai/core/util/encode"
import { createMemo, For, Match, Switch, Show, createResource } from "solid-js"
import { DateTime } from "luxon"
import { useLayout } from "@/context/layout"
import { useGlobalSync } from "@/context/global-sync"
import { useServer } from "@/context/server"
import { useDialog } from "@teamcode-ai/ui/context/dialog"
import { useLanguage } from "@/context/language"
import { usePlatform } from "@/context/platform"
import { useNotification } from "@/context/notification"
import { DialogSelectDirectory } from "@/components/dialog-select-directory"
import { DialogSelectServer } from "@/components/dialog-select-server"
import { DialogSelectProvider } from "@/components/dialog-select-provider"
import { sessionTitle } from "@/utils/session-title"

export default function Dashboard() {
  const sync = useGlobalSync()
  const layout = useLayout()
  const server = useServer()
  const dialog = useDialog()
  const navigate = useNavigate()
  const language = useLanguage()
  const platform = usePlatform()
  const notification = useNotification()
  const homedir = createMemo(() => sync.data.path.home)

  const projects = createMemo(() =>
    sync.data.project
      .slice()
      .sort((a, b) => (b.time.updated ?? b.time.created) - (a.time.updated ?? a.time.created)),
  )

  const allSessions = createMemo(() => {
    const result: Array<{ id: string; title?: string; time: { created: number; updated?: number; archived?: number }; model?: { id: string }; dir: string }> = []
    for (const project of projects()) {
      const [store] = sync.child(project.worktree, { bootstrap: false })
      for (const session of store.session) {
        if (session.time.archived) continue
        result.push({ id: session.id, title: session.title, time: session.time, model: session.model, dir: project.worktree })
      }
    }
    return result
      .sort((a, b) => (b.time.updated ?? b.time.created) - (a.time.updated ?? a.time.created))
      .slice(0, 10)
  })

  const [sessionCount] = createResource(
    () => projects(),
    async (projs) => {
      let count = 0
      for (const project of projs) {
        const [store] = sync.child(project.worktree, { bootstrap: false })
        count += store.sessionTotal || store.session.length
      }
      return count
    },
  )

  const serverDotClass = createMemo(() => {
    const healthy = server.healthy()
    if (healthy === true) return "bg-icon-success-base"
    if (healthy === false) return "bg-icon-critical-base"
    return "bg-border-weak-base"
  })

  const openProject = (directory: string) => {
    layout.projects.open(directory)
    server.projects.touch(directory)
    navigate(`/${base64Encode(directory)}`)
  }

  const chooseProject = () => {
    const resolve = (result: string | string[] | null) => {
      if (Array.isArray(result)) {
        for (const directory of result) openProject(directory)
      } else if (result) {
        openProject(result)
      }
    }
    if (platform.openDirectoryPickerDialog && server.isLocal()) {
      platform.openDirectoryPickerDialog?.({ title: language.t("command.project.open"), multiple: true }).then(resolve)
    } else {
      dialog.show(
        () => <DialogSelectDirectory multiple={true} onSelect={resolve} />,
        () => resolve(null),
      )
    }
  }

  const connectProvider = () => {
    dialog.show(() => <DialogSelectProvider />)
  }

  return (
    <div class="h-full w-full overflow-y-auto">
      <div class="max-w-4xl mx-auto px-8 py-8 flex flex-col gap-8">
        {/* Header */}
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <Logo class="w-10 h-12" />
            <div class="flex flex-col">
              <h1 class="text-20-medium text-text-strong">TeamCode</h1>
              <p class="text-14-regular text-text-weak">{language.t("home.empty.description")}</p>
            </div>
          </div>
          <button
            type="button"
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-raised-base-hover transition-colors"
            onClick={() => dialog.show(() => <DialogSelectServer />)}
          >
            <div class={`size-2 rounded-full ${serverDotClass()}`} />
            <span class="text-14-regular text-text-base">{server.name}</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div class="flex items-center gap-3">
          <Button size="large" icon="new-session" onClick={() => { const p = projects()[0]; if (p) navigate(`/${base64Encode(p.worktree)}/session`) }}>
            {language.t("command.session.new")}
          </Button>
          <Button size="large" icon="folder-add-left" variant="ghost" onClick={chooseProject}>
            {language.t("command.project.open")}
          </Button>
          <Button size="large" icon="plus-small" variant="ghost" onClick={connectProvider}>
            {language.t("command.provider.connect")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card variant="normal">
            <div class="flex items-start justify-between p-4">
              <div class="flex flex-col gap-1">
                <span class="text-12-regular text-text-weak">{language.t("sidebar.projects")}</span>
                <span class="text-20-medium text-text-strong">{projects().length}</span>
              </div>
              <Icon name="folder" size="large" class="text-icon-weak" />
            </div>
          </Card>
          <Card variant="normal">
            <div class="flex items-start justify-between p-4">
              <div class="flex flex-col gap-1">
                <span class="text-12-regular text-text-weak">Sessions</span>
                <span class="text-20-medium text-text-strong">{sessionCount() ?? "..."}</span>
              </div>
              <Icon name="bubble-5" size="large" class="text-icon-weak" />
            </div>
          </Card>
          <Card variant="normal">
            <div class="flex items-start justify-between p-4">
              <div class="flex flex-col gap-1">
                <span class="text-12-regular text-text-weak">Unseen</span>
                <span class="text-20-medium text-text-strong">
                  {projects().reduce((t, p) => t + notification.project.unseenCount(p.worktree), 0)}
                </span>
              </div>
              <Icon name="status" size="large" class="text-icon-weak" />
            </div>
          </Card>
        </div>

        {/* Projects */}
        <section class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h2 class="text-14-medium text-text-strong">{language.t("home.recentProjects")}</h2>
            <Button size="small" icon="folder-add-left" variant="ghost" class="pl-2 pr-3" onClick={chooseProject}>
              {language.t("command.project.open")}
            </Button>
          </div>
          <Switch>
            <Match when={projects().length > 0}>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <For each={projects().slice(0, 6)}>
                  {(project) => (
                    <Card
                      variant="normal"
                      class="cursor-pointer transition-colors hover:bg-surface-raised-base-hover"
                      onClick={() => openProject(project.worktree)}
                    >
                      <div class="flex items-center gap-3 p-4">
                        <div class="size-10 rounded-lg bg-surface-raised-base flex items-center justify-center shrink-0">
                          <Icon name="folder" size="medium" class="text-icon-base" />
                        </div>
                        <div class="flex flex-col min-w-0 gap-0.5 flex-1">
                          <span class="text-14-medium text-text-strong truncate">
                            {project.name || getFilename(project.worktree)}
                          </span>
                          <span class="text-12-regular text-text-weak truncate">
                            {project.worktree.replace(homedir(), "~")}
                          </span>
                        </div>
                        <span class="text-12-regular text-text-weaker shrink-0">
                          {DateTime.fromMillis(project.time.updated ?? project.time.created).toRelative()}
                        </span>
                      </div>
                    </Card>
                  )}
                </For>
              </div>
            </Match>
            <Match when={true}>
              <div class="flex flex-col items-center gap-4 py-12 text-center">
                <Icon name="folder-add-left" size="large" class="text-icon-weak" />
                <div class="flex flex-col gap-1">
                  <span class="text-14-medium text-text-strong">{language.t("home.empty.title")}</span>
                  <span class="text-12-regular text-text-weak">{language.t("home.empty.description")}</span>
                </div>
                <Button class="px-3 mt-1" onClick={chooseProject}>
                  {language.t("command.project.open")}
                </Button>
              </div>
            </Match>
          </Switch>
        </section>

        {/* Recent Sessions */}
        <Show when={allSessions().length > 0}>
          <section class="flex flex-col gap-3">
            <h2 class="text-14-medium text-text-strong">Recent Sessions</h2>
            <div class="flex flex-col gap-1">
              <For each={allSessions()}>
                {(item) => (
                  <A
                    href={`/${base64Encode(item.dir)}/session/${item.id}`}
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-raised-base-hover transition-colors"
                  >
                    <div class="size-8 rounded-md bg-surface-raised-base flex items-center justify-center shrink-0">
                      <Icon name="comment" size="small" class="text-icon-base" />
                    </div>
                    <div class="flex flex-col min-w-0 gap-0.5 flex-1">
                      <span class="text-14-regular text-text-strong truncate">
                        {sessionTitle(item.title)}
                      </span>
                      <span class="text-12-regular text-text-weak truncate">
                        {getFilename(item.dir)}
                      </span>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <Show when={item.model}>
                        <Tag size="normal">{item.model!.id}</Tag>
                      </Show>
                      <span class="text-12-regular text-text-weaker">
                        {DateTime.fromMillis(item.time.updated ?? item.time.created).toRelative()}
                      </span>
                    </div>
                  </A>
                )}
              </For>
            </div>
          </section>
        </Show>
      </div>
    </div>
  )
}
