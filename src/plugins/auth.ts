import { Make } from '../libs/url'
import { system, apiClients } from '@cortezaproject/corteza-js'
import { PluginFunction } from 'vue'

const lsAuthJWTKey = 'auth.jwt'
const lsAuthUserKey = 'auth.user'

const jwt = Symbol('jwt')
const user = Symbol('user')

interface AuthCheckResult {
  user: object;
  jwt: string;
}

interface PluginOpts {
  api: apiClients.System;
}

export class Auth {
  [jwt]?: string
  [user]?: system.User

  private api: apiClients.System
  private location: Location
  private localStorage: Storage

  constructor (api: apiClients.System, { location, localStorage } = window) {
    this.api = api
    console.log(api)
    this.location = location
    this.localStorage = localStorage
  }

  /**
   * check uses system API client verify given/current JWT
   *
   * If JWT is valid, it is stored into local storage alongside
   * loaded user.
   *
   * We're explicitly passing systemAPI to minimize plugin initialization complexity
   */
  async check (_jwt: string | undefined = this.JWT): Promise<system.User> {
    if (!_jwt) {
      // purge stored jwt and user if any
      this[user] = undefined
      this[jwt] = undefined
      throw new Error('jwt undefined')
    }

    return this.api.setJWT(_jwt).authCheck().then((r: unknown) => {
      const { user, jwt = _jwt } = (r as unknown) as AuthCheckResult
      if (!user) {
        throw new Error('unexpected auth check response')
      }

      this.JWT = jwt
      this.user = new system.User(user)

      return this.user
    })
  }

  async logout (): Promise<unknown> {
    return this.api.setJWT(this.JWT).authLogout().finally(() => {
      this.JWT = undefined
      this.user = undefined
    })
  }

  is (): boolean {
    return !!this.JWT
  }

  goto (url = '/auth', ref = this.location.toString()): void {
    this.location.replace(Make({ url, ref }))
  }

  open (): void {
    this.goto('/auth')
  }

  get JWT (): string|undefined {
    if (!this[jwt]) {
      this[jwt] = this.localStorage.getItem(lsAuthJWTKey) || undefined
    }

    return this[jwt]
  }

  set JWT (JWT: string|undefined) {
    if (!JWT) {
      this[jwt] = undefined
      this.localStorage.removeItem(lsAuthJWTKey)
    } else if (this[jwt] !== JWT) {
      this[jwt] = JWT
      this.localStorage.setItem(lsAuthJWTKey, JWT)
    }
  }

  get user (): system.User|undefined {
    if (this[user] === null) {
      const userJson = this.localStorage.getItem(lsAuthUserKey)
      if (!userJson) {
        return
      }

      this[user] = new system.User(JSON.parse(userJson))
    }

    return this[user]
  }

  set user (u: system.User|undefined) {
    if (!u) {
      this[user] = undefined
      this.localStorage.removeItem(lsAuthUserKey)
    } else if (this[user] !== u) {
      this[user] = u
      this.localStorage.setItem(lsAuthUserKey, JSON.stringify(u))
    }
  }
}

export default function (): PluginFunction<PluginOpts> {
  return function (Vue, opts): void {
    if (opts === undefined) {
      opts = { api: Vue.prototype.$SystemAPI }
    }

    Vue.prototype.$auth = new Auth(opts.api)
  }
}
