import { automation } from '@cortezaproject/corteza-js'

export function pVal<T = unknown> (vars: automation.Vars, k: string, def?: T): T | undefined {
  if (vars && vars[k] && vars[k]['@value'] !== undefined) {
    return vars[k]['@value']
  }

  return def
}
