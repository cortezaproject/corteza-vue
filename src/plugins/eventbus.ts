import { PluginFunction } from 'vue'
import { EventBus } from '@cortezaproject/corteza-js'

export default function (): PluginFunction<object> {
  return function (Vue): void {
    Vue.prototype.$EventBus = new EventBus()
  }
}
