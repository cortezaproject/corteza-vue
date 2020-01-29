import { PluginFunction } from 'vue'
import { eventbus } from '@cortezaproject/corteza-js'

export default function (options: object): PluginFunction<object> {
  return function (Vue): void {
    Vue.prototype.$EventBus = new eventbus.EventBus(options)
  }
}
