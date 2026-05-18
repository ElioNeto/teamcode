import { EOL } from "os"
import { Effect } from "effect"
import { Skill } from "../../../skill"
import { effectCmd } from "../../effect-cmd"

export const SkillCommand = effectCmd({
  command: "skill",
  describe: "list all available skills",
  builder: (yargs) => yargs,
  handler: Effect.fn("Cli.debug.skill")(function* () {
    const skill = yield* Skill.Service
    const skills = yield* skill.all()
    const json = JSON.stringify(skills, null, 2) + EOL
    yield* Effect.callback<void>((resume) => {
      if (process.stdout.write(json)) {
        resume(Effect.void)
      } else {
        process.stdout.once("drain", () => resume(Effect.void))
      }
    })
  }),
})
