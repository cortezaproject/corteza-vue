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
  page?: string
  slot?: string

  constructor (s: Script, t: Trigger) {
    const ui = opt2map(t.ui)

    if (!t.eventTypes?.includes('onManual')) {
      throw new Error('expecting onManual event type')
    }

    if (t.resourceTypes?.length !== 1) {
      throw new Error('expecting exactly one resource type on trigger')
    }

    this.label = ui.label ?? s.label
    this.script = s.name
    this.weight = t.weight || 0
    this.resourceType = t.resourceTypes[0]
    this.page = ui.page
    this.slot = ui.slot
    this.variant = ui.variant
  }
}

/**
 * Consumes explciitly triggered scripts and converts it to list of buttons
 */
export class UIHooks {
  readonly app: string
  protected set: Button[] = []

  constructor (app: string) {
    this.app = app
  }

  /**
   * Takes one or more scripts and converts them to buttons
   *
   * With every script added it removes ALL
   * buttons that use the same script
   */
  Register (...scripts: Script[]): void {
    scripts
      .filter(s => s.triggers)
      .forEach(s => {
        this.Unregister(s)

        s.triggers
          .filter(t => t.eventTypes?.includes('onManual'))
          .forEach(t => {
            if (opt2map(t.ui).app !== this.app) {
              // Ignore triggers that do not belong to this app.
              return
            }

            this.set.push(new Button(s, t))
          })
      })

    // Keep buttons sorted
    this.set.sort(sorter)
  }

  /**
   * Remove all buttons that match a script
   * @param name
   * @constructor
   */
  Unregister ({ name }: Script): void {
    this.set = this.set.filter(({ script }) => name !== script)
  }

  /**
   * Searches for buttons that match the requirements
   *
   * @param resourceType
   * @param page
   * @param slot
   * @constructor
   */
  Find (resourceType: string|string[], page: string, slot: string): Button[] {
    if (!resourceType) {
      resourceType = []
    } else if (typeof resourceType === 'string') {
      resourceType = [resourceType]
    }

    resourceType.push('ui:' + this.app)

    return this.set
      .filter(b => {
        if (!resourceType.includes(b.resourceType)) {
          return false
        }

        return page === b.page && slot === b.slot
      })
  }
}

export default function (app: string): PluginFunction<object> {
  return function (Vue): void {
    Vue.prototype.$UIHooks = new UIHooks(app)
  }
}
