/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { apiClients } from '@cortezaproject/corteza-js'
import { PluginFunction } from 'vue'

interface JWTFetcher {
  (): string|null;
}

interface Options {
  baseURL?: string;
  jwt?: string|JWTFetcher;
}

function getJWT (): string|null {
  return window.localStorage.getItem('auth.jwt')
}

/**
 * Generic Corteza API plugin
 *
 * Install a specific plugin:
 * Vue.use(plugins.CortezaAPI('compose'))
 *
 * @constructor
 */
export function CortezaAPI (service: string, opt: Options = {}): PluginFunction<object> {
  service = service.substring(0, 1).toUpperCase() + service.substring(1)

  if (!opt.baseURL) {
    // @ts-ignore
    opt.baseURL = window[`${service}API`]
  }

  if (!opt.jwt) {
    opt.jwt = getJWT() || ''
  } else if (typeof opt.jwt === 'function') {
    opt.jwt = opt.jwt() || ''
  }

  return function (Vue): void {
    // @ts-ignore
    // make  Vue.$<service>API (Vue.$SystemAPI, Vue.$CompsoeAPI, Vue.$MessagingAPI) available
    Vue.prototype[`$${service}API`] = new apiClients[service](opt)
  }
}
