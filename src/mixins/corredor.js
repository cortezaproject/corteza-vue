import { corredor } from '@cortezaproject/corteza-js'

/**
 * Corredor automation mixin
 */

/**
 * With this prefix we distinguish script type
 * @type {string}
 */
const serverScriptPrefix = '/server-scripts/'

export default {
  methods: {
    /**
     * Creates a function for registering server automation scripts to UIHooks and EventBus plugins
     *
     * API should be corteza API Client class that is passed as a first arg to serverScriptHandler
     */
    makeAutomationScriptsRegistrator (serverScriptHandler) {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      return ({ set }) => {
        /**
         * Process all known automation scripts
         */
        this.$UIHooks.Register(...set)

        /**
         * Register only server-side scripts (!bundle) and only triggers with onManual eventType
         *
         *  1. client-scripts (bundled) are registered in the bundle's boot loader
         *  2. onManual only -- other kinds (implicit, deferred) are handled directly in/by the Corteza API backend
         */
        set
          .filter(({ name }) => name.substring(0, serverScriptPrefix.length) === serverScriptPrefix)
          .forEach(s => {
            s.triggers
              .filter(({ eventTypes = [] }) => eventTypes.includes('onManual'))
              .forEach(t => {
                // We are (ab)using eventbus for dispatching onManual scripts as well
                // and since it does not know about script structs (only triggers), we need
                // to modify trigger we're passing to it by adding script name
                t.scriptName = s.name
                try {
                  this.$EventBus.Register(ev => serverScriptHandler(ev, s.name), t)
                } catch (e) {
                  console.error(e)
                }
              })
          })
      }
    },

    /**
     * Loads bundle from system API and registers
     * @return {Promise<T>}
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    loadBundle ({ bundle, type = 'client-scripts', ext = 'js', verbose = false, ctx = undefined } = {}) {
      const ep = this.$SystemAPI.automationBundleEndpoint({ bundle, type, ext })

      if (ctx === undefined) {
        throw new Error('can not load bundle and register scripts without context')
      }

      if (typeof ctx.withArgs !== 'function') {
        throw new Error('invalid context object, expecting withArgs function')
      }

      return this.$SystemAPI.api().get(ep)
        .then(({ data }) => {
          if (!data) {
            if (verbose) {
              console.debug('bundle empty', { bundle, type, ext })
            }
            return
          }

          if (verbose) {
            console.debug('bundle loaded', { bundle, type, ext })
          }

          // eval loaded bundle
          // eslint-disable-next-line no-new-func
          (new Function(data))()

          // call script registrator on bundle
          window[`${bundle}ClientScripts`].Register({
            verbose,
            eventbus: this.$EventBus,
            uiHooks: this.UIHooks,

            // Generic event handler
            exec: (script, ev) => {
              const args = new corredor.Args(ev.args)
              corredor.Exec(script, args, ctx.withArgs(args))
            },
          })
        })
        .catch(({ message }) => {
          console.warn(`could not load client scripts bundle (bundle: ${bundle}, type: ${type}): ${message}`)
        })
    },
  },
}
