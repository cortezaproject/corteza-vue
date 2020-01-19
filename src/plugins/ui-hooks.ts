import { PluginFunction } from 'vue'

interface KV { [_: string]: string }
interface UIOption { name: string; value: string }

interface Trigger {
  resourceTypes: string[];
  eventTypes: string[];
  ui: UIOption[];
  weight?: number;
}

interface Script {
  name: string;
  label: string;
  triggers: Trigger[];
}

function sorter (a: Button, b: Button): number {
  if (a.weight === b.weight) {
    return a.script.localeCompare(b.script)
  } else {
    return a.weight - b.weight
  }
}

function opt2map (uiopts: UIOption[]): KV {
  return uiopts.reduce((m: KV, { name, value }) => { m[name] = value; return m }, {})
}

export class Button {
  label: string
  script: string
  resourceType: string
  weight: number
  variant?: string
  slot?: string

  constructor (s: Script, t: Trigger) {
    const ui = opt2map(t.ui)

    if (!t.eventTypes || !t.eventTypes.includes('onManual')) {
      throw new Error('expecting onManual event type')
    }

    if (!t.resourceTypes || t.resourceTypes.length !== 1) {
      throw new Error('expecting exactly one resource type on trigger')
    }

    this.label = ui.label ?? s.label
    this.script = s.name
    this.weight = t.weight || 0
    this.resourceType = t.resourceTypes[0]
    this.variant = ui.variant
    this.slot = ui.slot
  }
}

/**
 * Consumes explciitly triggered scripts and converts it to list of buttons
 */
export class UIHooks {
  protected set: Button[] = []

  /**
   * Takes one or more scripts and converts them to buttons
   */
  Register (...ss: Script[]): void {
    ss.forEach(s => {
      // @todo remove all buttons with this script
      s.triggers.forEach(t => {
        if (!t.eventTypes || !t.eventTypes.includes('onManual')) {
          // Manual events is all we're interested in.
          return
        }

        this.set.push(new Button(s, t))
      })
    })

    // Keep buttons sorted
    this.set.sort(sorter)
  }

  Find (resourceType: string, slot?: string): Button[] {
    return this.set
      .filter(b => b.resourceType === resourceType && b.slot === slot)
  }
}

export default function (): PluginFunction<object> {
  return function (Vue): void {
    Vue.prototype.$UIHooks = new UIHooks()
  }
}
