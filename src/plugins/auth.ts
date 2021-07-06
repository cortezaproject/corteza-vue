import axios, { AxiosInstance } from 'axios'
import { Make } from '../libs/url'
import { system } from '@cortezaproject/corteza-js'
import { PluginFunction } from 'vue'

const lsAuthRefreshTokenKey = 'auth.refreshToken'
const accessToken = Symbol('accessToken')
const user = Symbol('user')

/**
 * This is an endpoint of a oauth2 authorization-code flow + refresh token exchange
 * for default client.
 *
 * If you are concerned about security, this is not much different than using a dedicated backend
 * for this SPA that only redirects to a set of allowed URIs.
 */
const oauth2FlowURL = '/oauth2/default-client'
const oauth2InfoURL = '/oauth2/info'
const oauth2Scope = 'profile api'

interface AuthInfo {
  accessTokenFn: () => string | undefined;
  user: system.User;
}

interface OAuth2TokenResponse {
  aud: string;
  sub: string;
  scope: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;

  name?: string;
  handle?: string;
  email?: string;
}

interface PluginOpts {
  cortezaAuthURL: string;
  callbackURL: string;
}

interface AuthCtor {
  app: string;

  /**
   * when true, use console as a logger, no-op otherwise.
   */
  verbose: boolean;

  /**
   * where the authe backend is
   */
  cortezaAuthURL: string;

  /**
   * URL we'll be listening to for callbacksa
   */
  callbackURL: string;

  /**
   * used for redirection
   */
  location: Location;

  /**
   * used for storing
   */
  localStorage: Storage;

  /**
   * Static string with entry-point URL stored at app init
   * so that there is no risk of changes when Vue router gets it's hands on it
   */
  entrypointURL: string;

  /**
   * multiply factor for token expiration
   * this will tell internal refresh system how much
   * before the token expiration we'll refresh the access toke
   *
   * keep in mind that access token is exchanged on every app load
   */
  refreshFactor: number;
}

interface Logger {
  debug(...data: unknown[]): void;
  info(...data: unknown[]): void;
  error(...data: unknown[]): void;
}

export class Auth {
  /**
   * Access token is only stored here (in-memory)!
   * we do not want to keep it in the local store
   */
  private [accessToken]?: string
  /**
   * Access token is only stored here (in-memory)!
   * we do not want to keep it in the local store
   */
  private [user]?: system.User

  /**
   * Name of the app that is using the auth plugin
   */
  readonly app: string

  readonly refreshFactor: number
  readonly verbose: boolean
  readonly cortezaAuthURL: string
  readonly callbackURL: string
  readonly location: Location
  readonly localStorage: Storage

  /**
   * Application entrypoint URL
   */
  readonly entrypointURL: string

  /**
   * Keeps track of timeout callback in case we re-run it before it timesout
   * @private
   */
  private refreshTimeout?: number

  private $emit?: (event: string, ...args: unknown[]) => unknown

  constructor ({ app, verbose, cortezaAuthURL, callbackURL, entrypointURL, location, localStorage, refreshFactor }: AuthCtor) {
    if (refreshFactor >= 1 || refreshFactor <= 0) {
      throw new Error('refreshFactor should be between 0 and 1')
    }

    this.app = app
    this.verbose = verbose
    this.cortezaAuthURL = cortezaAuthURL
    this.callbackURL = callbackURL
    this.location = location
    this.localStorage = localStorage
    this.refreshFactor = refreshFactor
    this.entrypointURL = entrypointURL

    this.log.debug('initialized auth plugin', {
      app,
      cortezaAuthURL,
      callbackURL,
      entrypointURL,
    })
  }

  vue (vue: Vue): Auth {
    this.$emit = (event, ...args): void => { vue.$emit(event, ...args) }
    return this
  }

  get axios (): AxiosInstance {
    return axios.create({ baseURL: this.cortezaAuthURL })
  }

  /**
   * wrapper for console (when in debug mode) or a simple no-op obj
   */
  get log (): Logger {
    if (this.verbose) {
      return console
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const noop = (): void => {}

    return {
      debug: noop,
      info: noop,
      error: noop,
    }
  }

  /**
   * Returns prefixed key
   * @param key
   */
  localStorageKey (key: string): string {
    return `${this.app}.${key}`
  }

  /**
   * Returns function that returns current access token
   */
  get accessTokenFn (): () => string | undefined {
    return (): string | undefined => { return this[accessToken] }
  }

  /**
   * Handles initial authentication check
   *
   * handle function should be called immediately when application is created
   * it checks whether app was requested on an URL with /auth/callback at the end
   * if there is an error or code passed and handles that request appropriately:
   *
   *  .../auth/callback?code=... exchanged authorization code for access token
   *  .../auth/callback?error=... renders an error that we got from the oauth2 provider
   *
   * If handle was called without /auth/callback or without params mentioned above:
   *   if user is not authorized, redirect to the configured path to start oauth2 flow
   *   if user is authorized, continue with execution
   */
  async handle (req: URL = new URL(this.entrypointURL)): Promise<AuthInfo | null> {
    this.log.info('handling authentication')
    if (/\/auth\/callback$/.test(req.pathname)) {
      this.log.info('handling authentication callback')

      const params = new URLSearchParams(req.search)
      if (params.has('error')) {
        throw new Error(params.get('error') || 'authentication flow failed with error')
      }

      if (params.has('code')) {
        let finalLocation: string | null = null

        if (params.has('state')) {
          const state = params.get('state') || ''
          const lsKey = this.localStorageKey(`state.${state}.location`)
          this.log.info('state received', state)

          finalLocation = this.localStorage.getItem(lsKey)
          if (!finalLocation) {
            throw Error('state does not match')
          }

          if (/auth\/callback/.test(finalLocation)) {
            // if by some coincidence we got callback URL to finalLocation
            // we'll silently ignore it
            finalLocation = null
          } else {
            this.log.info('location before auth flow start', finalLocation)
          }

          this.localStorage.removeItem(lsKey)
        }

        const code = params.get('code') || ''
        this.log.info('authorization code received', code)
        await this.exchangeCode(code)

        if (finalLocation) {
          this.location.assign(finalLocation)
        }
      }
    }

    return this.check()
  }

  /**
   * Checks current auth state; is access token loaded OR do we have a refresh token we can use
   *
   * check uses system API client verify given/current JWT
   *
   * If JWT is valid, it is stored into local storage alongside
   * loaded user.
   *
   * We're explicitly passing systemAPI to minimize plugin initialization complexity
   *
   * Function will throw null when user is unauthenticated
   */
  async check (): Promise<AuthInfo | null> {
    this.log.info('checking authentication')

    if (this[accessToken]) {
      this.log.info('access token found')

      const headers = { Authorization: `Bearer ${this[accessToken]}` }

      this.log.info('fetching authentication info from ' + oauth2InfoURL)

      return this.axios.get(oauth2InfoURL, { headers }).then(({ data }) => {
        this.log.info('data fetch form info endpoint', { oauth2InfoURL, headers, data })
        this[user] = new system.User({
          userID: data.sub,
          name: data.name,
          email: data.email,
          handle: data.username,
        })

        return data
      }).catch((error) => {
        this.log.info('data fetch form info endpoint failed', { oauth2InfoURL, headers, error })
        // assume invalid JWT and remove it
        this[accessToken] = undefined
        throw new Error('Unauthenticated')
      })
    }

    const refreshToken = this.localStorage.getItem(this.localStorageKey(lsAuthRefreshTokenKey))
    if (refreshToken) {
      this.log.info('refresh token found, exchanging it for new access token')

      /**
       * Refresh token found in the storage,
       * let's use it to get new access token
       */
      return this.exchangeRefresh(refreshToken)
    }

    throw new Error('Unauthenticated')
  }

  logout (): void {
    this[accessToken] = undefined
    this[user] = undefined
    this.pruneStore()

    this.location.assign(Make({
      url: `${this.cortezaAuthURL}/logout`,
      query: { back: this.location.toString() },
    }))
  }

  /**
   * Starts new authentication flow
   *
   * It generates simple rand state to harden security and to
   * keep track of before-flow-start location of the user
   */
  startAuthenticationFlow (): void {
    this.log.debug('starting new authentication flow')
    const state = Math.random().toString(36).substring(2)
    this.localStorage.setItem(this.localStorageKey(`state.${state}.location`), this.location.toString())

    this.location.assign(Make({
      url: `${this.cortezaAuthURL}` + oauth2FlowURL,
      query: {
        // eslint-disable-next-line @typescript-eslint/camelcase
        redirect_uri: this.callbackURL,
        scope: oauth2Scope,
        state,
      },
    }))
  }

  /**
   * Exchanges authorization code for access and refresh tokens
   */
  private async exchangeCode (code = ''): Promise<AuthInfo> {
    return this.oauth2token({
      code: code,
      scope: oauth2Scope,
      // eslint-disable-next-line @typescript-eslint/camelcase
      redirect_uri: this.callbackURL,
    }).then((oa2tr) => this.procTokenResponse(oa2tr))
  }

  /**
   * Exchanges refresh token for new access and new refresh token
   *
   * After successful token exchange, we call response processing function
   * to update internals & stored values
   *
   * @param refreshToken
   */
  private async exchangeRefresh (refreshToken: string): Promise<AuthInfo | null> {
    return this.oauth2token({
      // eslint-disable-next-line @typescript-eslint/camelcase
      refresh_token: refreshToken || '',
    }).then((oa2tr) => this.procTokenResponse(oa2tr))
      .catch((err) => {
        const { response: { data: { error = undefined } = {} } = {} } = err
        if (error === 'invalid_grant') {
          this.pruneStore()
          throw new Error('Unauthenticated')
        }
        throw err
      })
  }

  /**
   * Processes fetched token and stores it
   *
   * Access token is stored only to instance of this object
   * Refresh token is stored only to local store
   *
   * @param oa2tkn OAuth2 token response
   * @private
   */
  private procTokenResponse (oa2tkn: OAuth2TokenResponse): AuthInfo {
    this.log.debug('new token', oa2tkn)

    if (this.refreshTimeout) {
      window.clearTimeout(this.refreshTimeout)
    }

    const timeout = oa2tkn.expires_in * this.refreshFactor

    this.log.debug('setting up refresh timeout callback', {
      // eslint-disable-next-line @typescript-eslint/camelcase
      expires_in: oa2tkn.expires_in,
      timeout,
    })

    // Schedule next refresh
    this.refreshTimeout = window.setTimeout(async () => {
      this.log.debug('refreshing token')
      this.exchangeRefresh(oa2tkn.refresh_token)
        .catch((err) => {
          this.log.error('refresh token exchange failed', err)
          this.startAuthenticationFlow()
        })
    }, 1000 * timeout)

    this.localStorage.setItem(this.localStorageKey(lsAuthRefreshTokenKey), oa2tkn.refresh_token)

    const newUser = new system.User({
      userID: oa2tkn.sub,
      name: oa2tkn.name,
      handle: oa2tkn.handle,
      email: oa2tkn.email,
    })

    this[accessToken] = oa2tkn.access_token
    this[user] = newUser

    if (this.$emit) {
      this.$emit('auth-token-processed', {
        user: newUser,
        accessToken: this[accessToken],
      })
    }

    return {
      accessTokenFn: (): string | undefined => { return this[accessToken] },
      user: newUser,
    }
  }

  /**
   * oauth2token exchanges authorization code or refresh token for (new) access token
   *
   * @param payload
   * @private
   */
  private async oauth2token (payload: Record<string, string>): Promise<OAuth2TokenResponse> {
    const data = new URLSearchParams()

    this.log.debug('exchanging for token', payload)

    Object.entries(payload).forEach(([key, value]) => {
      data.set(key, value)
    })

    const config = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }

    return this.axios.post(oauth2FlowURL, data, config).then(({ data }) => data)
  }

  private pruneStore (): void {
    this[accessToken] = undefined
    this[user] = undefined
    this.localStorage.clear()
  }

  get accessToken (): string | undefined {
    return this[accessToken]
  }

  get user (): system.User | undefined {
    return this[user]
  }
}

export default function (): PluginFunction<PluginOpts> {
  return function (Vue, opts): void {
    let {
      app = '',
      rootApp = false,
      cortezaAuthURL = '',
      callbackURL = '',
      verbose = undefined,
      refreshFactor = 0.75,
      entrypointURL = window.location.toString(),
      location = window.location,
      localStorage = window.localStorage,
    } = (opts || {}) as Partial<AuthCtor & { rootApp: boolean }>

    if (!cortezaAuthURL) {
      /**
       * cortezaAuthURL not explicitly set, try to auto-configure from properties set on window variable
       * (most likely through config.js)
       */

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const { CortezaAPI = undefined, CortezaAuth = undefined } = window

      switch (true) {
        case !!CortezaAuth:
          /**
           * Corteza authentication endpoints location is set explicitly:
           */
          cortezaAuthURL = CortezaAuth
          break
        case !!CortezaAPI && /\/api$/.test(CortezaAPI):
          /**
           * Corteza API base-url is explicitly set and string ends with /api,
           * do a leap of faith and replace it with /auth, so that
           * corteza.example.tld/api becomes corteza.example.tld/auth
           */
          cortezaAuthURL = CortezaAPI.replace('/api', '/auth')
          break
        case !!CortezaAPI:
          /**
           * Corteza API base-url is explicitly set. Since it does not end with /api
           * we will assume api is served directly on root of that domain and we'll just append the /auth suffix
           * so that corteza.example.tld becomes corteza.example.tld/auth
           */
          cortezaAuthURL = CortezaAPI + '/auth'
          break
        default:
          throw new Error('failed to configure auth cortezaAuthURL')
      }
    }

    if (!callbackURL) {
      if (!app) {
        throw new Error('can not construct callbackURL; specify \'callbackURL\' or \'app\' property')
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const { CortezaWebapp = undefined } = window
      const callbackPath = 'auth/callback'

      if (CortezaWebapp) {
        // construct redirect URL fallback from configured corteza webapp
        callbackURL = Make({ url: `${CortezaWebapp}` })
      } else {
        // Try to get callbackURL from <base> tag's href value
        const baseTags = document.getElementsByTagName('base')
        if (baseTags.length === 1) {
          callbackURL = baseTags[0].href
        }

        if (!callbackURL) {
          // construct redirect URL fallback from current location
          // note: host contains port, hostname does not!
          const { protocol, host } = location
          callbackURL = `${protocol}//${host}`
        }
      }

      if (!rootApp) {
        callbackURL = callbackURL.replace(/\/$/, '') + `/${app}`
      }

      callbackURL = callbackURL.replace(/\/$/, '') + `/${callbackPath}`
    }

    if (verbose === undefined) {
      // enable debug (when not expl. disabled on localhost)
      verbose = location.hostname === 'localhost' ||
        window.location.search.includes('verboseAuth') ||
        !!window.localStorage.getItem('auth.verbose')
    }

    if (verbose) {
      console.debug({
        app,
        verbose,
        cortezaAuthURL,
        callbackURL,
        location,
        localStorage,
        entrypointURL,
        refreshFactor,
      })
    }

    Vue.prototype.$auth = new Auth({
      app,
      verbose,
      cortezaAuthURL,
      callbackURL,
      location,
      localStorage,
      entrypointURL,
      refreshFactor,
    })
  }
}
