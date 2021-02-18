import axios from 'axios'
import { Make } from '../libs/url'
import { system } from '@cortezaproject/corteza-js'
import { PluginFunction } from 'vue'

const lsAuthJWTKey = 'auth.jwt'
const lsAuthUserKey = 'auth.user'
const lsAuthRefreshTokenKey = 'auth.refreshToken'

const jwt = Symbol('jwt')
const user = Symbol('user')
const refreshToken = Symbol('refreshToken')

interface AuthCheckResult {
  user: object;
  jwt: string;
  refreshToken: string;
}

interface PluginOpts {
  baseURL: string;
  redirectURI: string;
}

export class Auth {
  [jwt]?: string
  [user]?: system.User
  [refreshToken]?: string

  private baseURL: string
  private redirectURI: string
  private location: Location
  private localStorage: Storage

  constructor (baseURL: string, redirectURI: string, { location, localStorage } = window) {
    this.baseURL = baseURL
    this.redirectURI = redirectURI
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
  async check (_jwt: string | undefined = this.JWT): Promise<system.User|undefined> {
    if (!_jwt) {
      // purge stored jwt and user if any
      this[user] = undefined
      this[jwt] = undefined
      this[refreshToken] = undefined

      if (this.JWT) {
        // Raise error only when internal JWT is set
        // and someone wants to change it to undefined
        throw new Error('jwt undefined')
      }
    }

    return axios.get(`${this.baseURL}/oauth2/info`, {
      params: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        access_token: _jwt,
      },
    }).then(({ data }) => {
      this.user = new system.User({
        userID: data.sub.split(' ')[0],
        name: data.name,
        email: data.email,
        username: data.username,
      })
      return data
    })
  }

  logout (): void {
    this.JWT = undefined
    this.user = undefined

    this.location.assign(Make({ url: `${this.baseURL}/logout` }))
  }

  is (): boolean {
    return !!this.JWT
  }

  goto (url = '', ref = this.location.toString()): void {
    if (url) {
      // eslint-disable-next-line @typescript-eslint/camelcase
      this.location.assign(Make({ url, query: { redirect_uri: this.redirectURI }, ref }))
    }
  }

  open (): void {
    this.location.assign(Make({
      url: `${this.baseURL}/oauth2/default-client`,
      query: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        redirect_uri: this.redirectURI,
        scope: 'profile api',
      },
    }))
  }

  async useCode (code = ''): Promise<unknown> {
    return axios.post(`${this.baseURL}/oauth2/default-client`, null, {
      params: {
        code,
        // eslint-disable-next-line @typescript-eslint/camelcase
        redirect_uri: this.redirectURI,
        scope: 'profile api',
      },
    }).then(({ data }) => {
      this.JWT = data.access_token
      this.refreshToken = data.refresh_token
      return data
    })
  }

  async refresh (refreshToken: string | undefined = this.refreshToken): Promise<unknown> {
    return axios.post(`${this.baseURL}/oauth2/default-client`, null, {
      params: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        refresh_token: refreshToken,
      },
    }).then(({ data }) => {
      this.JWT = data.access_token
      this.refreshToken = data.refresh_token
      return data
    })
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
    if (!this[user]) {
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

  get refreshToken (): string|undefined {
    if (!this[refreshToken]) {
      this[refreshToken] = this.localStorage.getItem(lsAuthRefreshTokenKey) || undefined
    }

    return this[refreshToken]
  }

  set refreshToken (rt: string|undefined) {
    if (!rt) {
      this[refreshToken] = undefined
      this.localStorage.removeItem(lsAuthRefreshTokenKey)
    } else if (this[refreshToken] !== rt) {
      this[refreshToken] = rt
      this.localStorage.setItem(lsAuthRefreshTokenKey, rt)
    }
  }
}

export default function (): PluginFunction<PluginOpts> {
  return function (Vue, opts): void {
    if (opts) {
      Vue.prototype.$auth = new Auth(opts.baseURL, opts.redirectURI)
    }
  }
}
