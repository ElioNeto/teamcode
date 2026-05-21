import { Wildcard } from "@/util/wildcard"

type Rule = {
  permission: string
  pattern: string
  action: "allow" | "deny" | "ask"
}

export function evaluate(permission: string, pattern: string, ...rulesets: Rule[][]): Rule {
  const rules = rulesets.flat()
  let match: Rule | undefined
  for (let i = rules.length - 1; i >= 0; i--) {
    const rule = rules[i]
    if (rule && Wildcard.match(permission, rule.permission) && Wildcard.match(pattern, rule.pattern)) {
      match = rule
      break
    }
  }
  return match ?? { action: "ask", permission, pattern: "*" }
}
