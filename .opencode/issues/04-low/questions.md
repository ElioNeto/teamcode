# ❓ Questions

> **Total:** 37 | Extraído em 2026-05-17

---

## #28023 — Question: Built-in configuration

📅 `2026-05-17` | ✏️ **Binhbocnc1234** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/28023](https://github.com/anomalyco/opencode/issues/28023)


### Question

I want to check and change the configuration for the plan/build agent using opencode.json. However, I can't find the built-in configuration anywhere. Is it hidden or hardcoded?

---

## #28022 — Question: How to get started with Vibe Coding using opencode + free models?

📅 `2026-05-17` | ✏️ **Kovisun** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/28022](https://github.com/anomalyco/opencode/issues/28022)


**Question**

I am new to AI-assisted programming. How can a beginner get started with Vibe Coding using opencode + DeepSeek V4 Free?

**Context**

I have zero coding experience but want to learn. I built and deployed a Docker image on my NAS using opencode.

**What I tried**

Followed opencode docs, built OpenCC Docker image, deployed successfully.

**Specific questions**
1. Best practices for Vibe Coding with free models?
2. How to avoid common beginner pitfalls?
3. Recommended project types for beginners?

Thanks to the opencode team for making programming accessible! 

Project: https://github.com/Kovisun/opencc

---

## #27977 — Question dock stays open after successful reply in web app

📅 `2026-05-17` | ✏️ **minhquanle312** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27977](https://github.com/anomalyco/opencode/issues/27977)


## Summary
When answering an agent question from the web session dock, the reply request succeeds but the question dock stays visible and the UI does not advance.

## Steps to reproduce
1. Open a web session where the agent asks a question through the question dock.
2. Fill out all required items in the dock.
3. Click **Submit**.
4. Observe the `POST /question/{requestID}/reply` request succeed.

## Actual behavior
The question dock remains visible and the session stays blocked even though the reply API call succeeded.

## Expected behavior
After a successful reply, the pending question should be cleared locally and the dock should disappear so the session can continue.

## Notes
Current web UI behavior depends on the `question.replied` event to remove the pending question from local sync state. If that event is delayed or missed, the dock remains stuck.

---

## #27976 — Question dock stays open after successful reply in web app

📅 `2026-05-17` | ✏️ **minhquanle312** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/27976](https://github.com/anomalyco/opencode/issues/27976)


## Summary
When answering an agent question from the web session dock, the reply request succeeds but the question dock stays visible and the UI does not advance.

## Steps to reproduce
1. Open a web session where the agent asks a question through the question dock.
2. Fill out all required items in the dock.
3. Click **Submit**.
4. Observe the `POST /question/{requestID}/reply` request succeed.

## Actual behavior
The question dock remains visible and the session stays blocked even though the reply API call succeeded.

## Expected behavior
After a successful reply, the pending question should be cleared locally and the dock should disappear so the session can continue.

## Notes
Current web UI behavior depends on the `question.replied` event to remove the pending question from local sync state. If that event is delayed or missed, the dock remains stuck.

---

## #27876 — what is he last version of opencode cli?

📅 `2026-05-16` | ✏️ **thepoorhacker** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27876](https://github.com/anomalyco/opencode/issues/27876)


### Question

Hello,
opencode-cli is telling me that there is an update, i downloaded the latest .deb package, installed it, the gui version got updated to 1.15 , but the cli version is still at 1.14 and opencode-cli is still telling me i need to update, is there any thing wrong here?

Regards

---

## #27646 — Is it safe to update Opencode these few days?

📅 `2026-05-15` | ✏️ **rh-id** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/27646](https://github.com/anomalyco/opencode/issues/27646)


### Question

As we know that there are currently supply chain attack going on https://thehackernews.com/2026/05/mini-shai-hulud-worm-compromises.html

and I believe it is still going on until today and it gets spread wider, is it really safe to update?

---

## #27555 — How to disable DeepSeek V4 Flash Thinking mode in OpenCode?

📅 `2026-05-14` | ✏️ **pioneerrs** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27555](https://github.com/anomalyco/opencode/issues/27555)


## Question

I am using the OpenCode Go  API key in the Immersive Translate browser extension, not directly in the OpenCode client.

My main use case is translation with the DeepSeek V4 Flash model.

It seems that Thinking / reasoning mode is enabled by default. For translation tasks, I only need the final translated text, and I do not want the model to generate or return reasoning / thinking content.

How can I disable Thinking mode in this setup?

Specifically:

- Does the OpenCode Go API support passing `thinking.type = disabled`?
- Is there a non-thinking variant of DeepSeek V4 Flash available?
- Is prompt-level control the only option when using the API key through a third-party extension?

---

## #27420 — Why does OpenCode display the selected lines and the current file in VSCode after installing the VSCode Claude Code extension, when OpenCode's own extension doesn't achieve this effect? Is this feature really necessary?

📅 `2026-05-14` | ✏️ **wswind** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/27420](https://github.com/anomalyco/opencode/issues/27420)


### Question

opencode version 1.14.49

<img width="960" height="467" alt="Image" src="https://github.com/user-attachments/assets/2d6a5c90-a91d-4b17-838d-2386c1093a7b" />

<img width="1218" height="834" alt="Image" src="https://github.com/user-attachments/assets/3059159c-c935-4770-aae3-3b282638d1fb" />

<img width="394" height="306" alt="Image" src="https://github.com/user-attachments/assets/5cf38d5f-54de-4e1f-b10d-8f7fca1c5120" />

---

## #26904 — What does VirusFound mean?

📅 `2026-05-11` | ✏️ **OmarMtya** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26904](https://github.com/anomalyco/opencode/issues/26904)


### Question

I'm using v1.14.48 with Copilot provider (GPT 5.4), I don't understand what "VirusFound" error means, or how can I avoid it. This is the third time I got this error (I just tell the agent to continue and it works, but is breaking my workflow), just wondering what is it, I don't find anything on Internet about this.
<img width="607" height="154" alt="Image" src="https://github.com/user-attachments/assets/f632a78c-cea5-4708-82e7-2aa09100014b" />

---

## #26876 — How can I use the Nvidia NIM Apis with Opencode

📅 `2026-05-11` | ✏️ **hamshad** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26876](https://github.com/anomalyco/opencode/issues/26876)


### Question

I want to use the Nvidia NIM Apis with Opencode but I don't know how so can anybody tell me if its doable with Opencode and if yes then how should I do it or if no then how else I can work the the NIM Apis?

---

## #26462 — Why OpenCode automatic install plugin packages?

📅 `2026-05-09` | ✏️ **He110te4m** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/26462](https://github.com/anomalyco/opencode/issues/26462)


### Question

I tried using OpenCode, but when I open OpenCode, it installs `@opencode-ai/plugin` in a specific subdirectory (`./basic`), which confuses me. Why is it behaving this way?

---

## #26229 — How show subagent output when invoking "opencode run "my prompt" --format default"

📅 `2026-05-07` | ✏️ **raisbecka** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26229](https://github.com/anomalyco/opencode/issues/26229)


### Question

I'm trying to run an agent **unattended**, and I need to capture the output from the agent for review purposes.

The default primary agent works great, but for my use case, this agent delegates most work to subagents with dedicated contexts. Once a subagent is invoked, that's it - it doesn't output anything to the console until it's finished. 

I really just need output from all agents including subagents shown in the console. For simplicities sake, let's assume that no more than a single agent runs at a time.

What's the best way to achieve this? Is there a way to enable default logging for all subagents and then parse output and tool calls from the log output to achieve the same result?

Thanks.

---

## #26201 — Why one member per workspace for OpenCode Go

📅 `2026-05-07` | ✏️ **nthfloor** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/26201](https://github.com/anomalyco/opencode/issues/26201)


### Question

We have a team account - why is there a limit of one member per workspace can subscribe to OpenCode Go? Seems like a lost opportunity?

---

## #26144 — How to make Opencode TUI remember your Build/Plan model?

📅 `2026-05-07` | ✏️ **mejobloggs** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/26144](https://github.com/anomalyco/opencode/issues/26144)


### Question

I tried setting Plan to Qwen 3.6 and Build to Deepseek v4 Flash

If I close opencode and re-open, both Build/Plan are set to the same model.

Can I save the setting somehow? Seems strange that I can't find a way via the UI to save the setting

---

## #25879 — What happened to the opencode-cli TUI?

📅 `2026-05-05` | ✏️ **dougburks** | 💬 21 | 🔗 [https://github.com/anomalyco/opencode/issues/25879](https://github.com/anomalyco/opencode/issues/25879)


### Question

I was using the `opencode-cli` TUI via the 1.14.30 debian package. I then upgraded to the 1.14.39 debian package and `/usr/bin/opencode-cli` no longer exists. Is it still included in the debian package? I checked the release notes but I'm not seeing anything about this. Thanks.

---

## #25618 — Why Does OpenCode Create a .git/opencode File?

📅 `2026-05-03` | ✏️ **DaFi-1** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/25618](https://github.com/anomalyco/opencode/issues/25618)


### Question

I’ve noticed that in several projects, OpenCode creates a file at .git/opencode that looks like a kind of hash inside it. Why does this happen? What is the purpose of this file?

---

## #24672 — Why the Vision Mode Model GLM-5V-Turbo was deleted from ZAI ?

📅 `2026-04-27` | ✏️ **emco1234** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24672](https://github.com/anomalyco/opencode/issues/24672)


### Description

The Vision Model from ZAI GLM-5V-Turbo was deleted in the new versions of OpenCode, why is that? 
Can somebody help me here? 
In the Coding Plan from ZAI is not anymore the Vision Model GLM-5V-Turbo there, but Zai telled me i can use it with my Coding Plan and the another strange thing is, OpenCode had it the last 2 weeks but from 2-4 days it disapeared after the new Update Release. 



### Plugins

Whitehat-Intent

### OpenCode version

1.14.28

### Steps to reproduce

_No response_

### Screenshot and/or share link

<img width="1298" height="1072" alt="Image" src="https://github.com/user-attachments/assets/29c98218-fb12-403d-9458-9ae32c7df3fa" /> 

### Operating System

Windows 11

### Terminal

_No response_

---

## #24603 — What's the difference between the desktop and electron version?

📅 `2026-04-27` | ✏️ **Artaherzadeh** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/24603](https://github.com/anomalyco/opencode/issues/24603)


### Question

I could'nt find anything.

---

## #24583 — How to show the CoT in opencode web?

📅 `2026-04-27` | ✏️ **auderson** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/24583](https://github.com/anomalyco/opencode/issues/24583)


### Question

As title.
Currently, TUI shows the thinking process by default, but web UI cannot show that.

---

## #23995 — How to modify Plan and Build agents to pass chat_template_kwargs?

📅 `2026-04-23` | ✏️ **lowlyocean** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/23995](https://github.com/anomalyco/opencode/issues/23995)


### Question

For example, in the Build agent, I'd like to try sending chat_template_kwargs with enable_thinking: false

Can that be configured in the agents section of opencode.json?

The "variant cycle" feature seemed useful for this purpose, but doesn't seem to be implemented for local models like Qwen 3.6

---

## #23918 — why does it not start

📅 `2026-04-23` | ✏️ **FYAlso** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23918](https://github.com/anomalyco/opencode/issues/23918)


### Description

If I run the app. All it does is place a small box in the middle of the window and make sounds coming from my hard drive. It does this until I decide to terminate it with a close window command!

### Plugins

_No response_

### OpenCode version

_No response_

### Steps to reproduce

Double click the app icon!

### Screenshot and/or share link

<img width="2288" height="1118" alt="Image" src="https://github.com/user-attachments/assets/178b7e4c-1405-4938-b923-f37feab4288f" />


### Operating System

Win 11

### Terminal

_No response_

---

## #23843 — Question replies do not route to the active remote workspace

📅 `2026-04-22` | ✏️ **justinpbarnett** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23843](https://github.com/anomalyco/opencode/issues/23843)


### Description

When the TUI is attached to a remote workspace, question responses call `question.reply` / `question.reject` without the active workspace. For POST requests the SDK keeps `experimental_workspaceID` in `x-opencode-workspace`, but the server's remote workspace router reads the `workspace` query parameter. That means question answers can route to the default/local workspace instead of the active remote workspace.

`PermissionPrompt` already passes the current workspace after #23593; `QuestionPrompt` appears to need the same treatment.

### Plugins

None

### OpenCode version

Reproduced against `dev` (`packages/opencode` 1.14.20)

### Steps to reproduce

1. Create an SDK client with `experimental_workspaceID: "ws_remote"` and a fetch stub.
2. Call `client.question.reply({ requestID, answers })`.
3. The POST URL is `/question/:id/reply` without `?workspace=ws_remote`.
4. Call `client.question.reply({ requestID, workspace: "ws_remote", answers })`.
5. The POST URL includes `?workspace=ws_remote`, which matches the server workspace router.

### Screenshot and/or share link

N/A

### Operating System

Linux

### Terminal

N/A

---

## #23815 — How to configure Opencode + WSL + playwright-cli

📅 `2026-04-22` | ✏️ **voipp** | 💬 1 | 🔗 [https://github.com/anomalyco/opencode/issues/23815](https://github.com/anomalyco/opencode/issues/23815)


### Question

I have got: Windows 11 with WSL. Opencode windows application.
Opencode server runs in WSL, App connects to it.
I have got playwright-cli installed in WSL.
Opencode server is run with Systemd Unit.

But Opencode doesn't work correctly with playwright-cli.
When i asked the playwright-cli version, the following answer was provided:

> I can't determine an installed playwright-cli version from this environment.
> What I checked:
> 
> npx playwright --version -> npx: command not found
> 
> playwright --version -> playwright: command not found
> 
> So there is no accessible Playwright CLI binary here, and the loaded playwright-cli skill documentation does not specify a version.

But in WSL terminal playwright-cli works smoothly, because its configured with nodejs in .bashrc.

Question is - how to configure opencode to work correctly and smoothly?

---

## #23686 — How can session history be displayed on the left side of WebUI

📅 `2026-04-21` | ✏️ **Sounean** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23686](https://github.com/anomalyco/opencode/issues/23686)


### Question

<img width="794" height="737" alt="Image" src="https://github.com/user-attachments/assets/1d549b40-d2f0-41d9-89a7-b0487c56c37a" />I am currently using the web version of OpenCode. How can I display the session history in the red box in the image? Otherwise, every time I add a session, I won't be able to see the information of the previous session.
tks！！！

---

## #23520 — Question about opencode GO

📅 `2026-04-20` | ✏️ **lorenzo-gi** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23520](https://github.com/anomalyco/opencode/issues/23520)


### Question

Hi,
Not sure this is the right place. 
Looking on openrouter Qwen 3.5 plus costs more than M2.7, but looking at https://opencode.ai/docs/go/#usage-limits Qwen looks 3x cheaper than M2.7. Is it correct?
<img width="654" height="165" alt="Image" src="https://github.com/user-attachments/assets/b59b4b93-d5cf-4709-85bd-7cc05a940467" />

---

## #23515 — Question pane overlay blocks/dims the conversation text behind it

📅 `2026-04-20` | ✏️ **fs-bmedkouri** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23515](https://github.com/anomalyco/opencode/issues/23515)


### What happens

When the `question` tool renders a pane with multi-select options, the pane is a floating overlay that covers part of the conversation behind it. The covered text is dimmed but remains the primary source of context for the question being asked.

On top of that, notification popups (e.g. "Question -- Next steps planning a question / Go to session") can appear in the corner and overlap the question pane itself, obscuring option labels and descriptions.

Net effect: the user is asked to make a decision based on context they can no longer fully read, and sometimes can't fully read the question either.

### Why this matters

Question panes are used most heavily in planning/decision moments where the agent's preceding analysis is exactly what the user needs to weigh the options. Hiding that analysis forces the user to either:

1. Dismiss the pane, read the context, then hope to find the same pane again (not always possible);
2. Type an out-of-band answer asking the agent to wait while they read;
3. Guess and hope the recommended option is right.

### Repro

1. Have the agent produce a substantial analysis block (e.g. cost breakdown, diagnostic findings).
2. Immediately follow with a `question` tool call presenting multi-select options whose rationale depends on that analysis.
3. Observe: the analysis is dimmed and partially covered; any subsequent notification popup can further obscure the pane.

### Expected

- The question pane should not cover substantive conve

> *[Truncado — 1985 chars totais]*

---

## #23468 — How to recover a mistakenly deleted session

📅 `2026-04-20` | ✏️ **wangchong666** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/23468](https://github.com/anomalyco/opencode/issues/23468)


### Question

I use the `/sessions` command in TUI and then press `Ctrl+d` deleted a session,how to recover it?

---

## #23424 — Why must a workspace be forcibly bound to a specific directory?

📅 `2026-04-19` | ✏️ **smallevil** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23424](https://github.com/anomalyco/opencode/issues/23424)


### Question

I understand this app is "born for coding," so this question might seem a bit odd. However, I still can’t quite grasp the necessity of this hard binding. In a real-world workflow, we encounter numerous problems that don't necessarily align with the current workspace or any specific project folder.

Does it make sense that I’m forced to either create a dummy workspace for a random query or ask an irrelevant question within my current, unrelated project? Both feel quite counter-intuitive.

In my view, a Workspace should be a collection of ideas. When I’m interested in a certain direction, I should be able to create a workspace to start "working"—even if I’m just organizing preliminary thoughts and haven't written a single line of code yet. Only when the logic is clear should I bind it to a directory and begin the actual implementation.

Essentially, I’m suggesting that workspaces should function as logical isolation (based on topics/thoughts) rather than the current physical isolation (based on file paths).

This idea stems from the "friction" I’ve experienced after using the app for a while. It would be fantastic if this flexibility could be implemented.

Thanks! :)

---

## #23055 — how do i know what way i launch opencode after i use npm and bun both

📅 `2026-04-17` | ✏️ **superchangme** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/23055](https://github.com/anomalyco/opencode/issues/23055)


### Question

~$ whereis opencode
opencode: /opt/node-23/bin/opencode /home/c30012384/.bun/bin/opencode /home/c30012384/.opencode/bin/opencode /mnt/c/Users/c30012384/AppData/Roaming/nvm/v23.11.1/opencode

how do i know what way i launch opencode bun or nodejs?

---

## #22794 — Question: Is opencode server supposed to only allow ONE TUI ?

📅 `2026-04-16` | ✏️ **JavRok** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22794](https://github.com/anomalyco/opencode/issues/22794)


### Question

It's not clear in the docs, but when I run opencode as server (`opencode serve --port xxxx`) I can connect from another terminal with `opencode --port xxxx` but I cannot do it a second time. The command does nothing.

The only way to connect to a second terminal is with command `opencode attach http://localhost:xxxx` but I'm wondering if this is by design or a bug

Thanks !

(I'm on Mac)

---

## #22463 — How does Bring Your Own Key (BYOK) Work in Zen

📅 `2026-04-14` | ✏️ **KZeronimo** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/22463](https://github.com/anomalyco/opencode/issues/22463)


### Question

In my Zen subscription, I have provided an OpenAI API key that is well below it's budget limit and I can use it direcly in OpenCode  (Connect Provicer OpenAI API key). My understanding was that Zen would use this API key for OpenAI models OR when I exahausted my Zen bugdget my OpenAI API key could and would be used to continue to provide access to OpenAI models. 

That doesn't seem to be the case, when I try to use say GPT5.4 I still get a response that I've hit my Zen budget.

---

## #22452 — What is the reason `opencode plugin <new-version>` requires `--force`?

📅 `2026-04-14` | ✏️ **jumski** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22452](https://github.com/anomalyco/opencode/issues/22452)


I checked the code and tests, and this seems intentional.

## Current behavior

If a plugin is already configured, running this command without `--force`:

```bash
opencode plugin opencode-supabase@0.0.5
```

does not replace an existing `opencode-supabase@0.0.4` entry. The configured version stays unchanged unless I instead run:

```bash
opencode plugin --force opencode-supabase@0.0.5
```

## Question

What is the reason for that behavior?

I understand OpenCode is not a package manager, so it does not need to behave exactly like npm, but this differs from what many users may expect from other package tools.

## Confusing CLI output

What makes this more confusing is that the output from the non-`--force` command, which does **not** update the configured version, still says `Installed opencode-supabase@0.0.5`:

```text
❯ opencode plugin opencode-supabase@0.0.5

┌  Install plugin opencode-supabase@0.0.5
│
◇  Plugin package ready
│
◇  Detected server + tui targets
│
◇  Plugin config updated
│
●  Already configured in /home/jumski/Code/jumski/toss-bot/.opencode/opencode.jsonc
│
●  Already configured in /home/jumski/Code/jumski/toss-bot/.opencode/tui.json
│
◆  Installed opencode-supabase@0.0.5
│
●  Scope: local (/home/jumski/Code/jumski/toss-bot/.opencode)
│
└  Done
```

That reads like the plugin was upgraded, even though the config was left pinned to the previous version.

At minimum, should the CLI output be clearer when the package is fetched but the configured plugin versio

> *[Truncado — 1518 chars totais]*

---

## #22284 — Why were the two really useful features, ‘queuing’ and ‘guidance’, removed when sending messages to the LLM in previous versions?

📅 `2026-04-13` | ✏️ **dazhi666666** | 💬 2 | 🔗 [https://github.com/anomalyco/opencode/issues/22284](https://github.com/anomalyco/opencode/issues/22284)


### Question

Why were the two really useful features, ‘queuing’ and ‘guidance’, removed when sending messages to the LLM in previous versions?The feature are great

---

## #21481 — Why github copilot not support claude model？

📅 `2026-04-08` | ✏️ **zhengxiongzhu-ai** | 💬 4 | 🔗 [https://github.com/anomalyco/opencode/issues/21481](https://github.com/anomalyco/opencode/issues/21481)


### Question

yesterday i can use github copilot claude 4.6 opus
why i can't use after do the latest update?

---

## #21450 — Why is the new version so laggy?  v1.3.17 and v1.4.0

📅 `2026-04-08` | ✏️ **axwfae** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21450](https://github.com/anomalyco/opencode/issues/21450)


### Question

I've been working on a case for almost two hours now, and it still won't finish! I initially thought it was a problem with version 1.3.17, but upgrading to version 1.4.0 didn't solve the problem either.

Finally, after reverting to v1.2.10, it finished in less than 10 minutes! Is the lag issue caused by the recent update?

Which version (v.1.3.x) do you recommend as the best? I don't need the latest one, just the most stable one!

Also, how do I set it in TUI to not be updated? I was originally using v1.2.10, but after a recent system reboot, it was automatically updated to version v1.3.x!

---

## #21423 — Why Moved auto-accept permissions into Settings?

📅 `2026-04-08` | ✏️ **WangWaud** | 💬 3 | 🔗 [https://github.com/anomalyco/opencode/issues/21423](https://github.com/anomalyco/opencode/issues/21423)


### Question

I just updated v1.4.0, and I found the auto-accept permissions were moved into settings. 

It has become a global setting, and before that, it could be set for each project and can be turned off at any time, which is very convenient. So I'm curious why moved that into settings?

---

## #21291 — How to obtain session information in LLM http request header by opencode

📅 `2026-04-07` | ✏️ **hb-lee** | 💬 0 | 🔗 [https://github.com/anomalyco/opencode/issues/21291](https://github.com/anomalyco/opencode/issues/21291)


### Question

I have noticed that the opencode has put `x-session-affinity` in header in https://github.com/anomalyco/opencode/pull/20744. But when I use the tcpdump to track the package sent by opencode cli, I have not got this in http header. Does anybody know how we can get this in http header?

---
