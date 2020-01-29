/**
 * Corredor automation mixin
 */

export default {
  methods: {
    /**
     * Creates a function for registering server automation scripts to UIHooks and EventBus plugins
     *
     * API should be corteza API Client class that is passed as a first arg to serverScriptHandler
     */
    makeAutomationScriptsRegistrator (api, serverScriptHandler) {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      return ({ set }) => {
        /**
         * Process all known automation scripts
         */
        // @todo add ui prop on trigger
        this.$UIHooks.Register(...set)

        /**
         * Register only server-side scripts (!bundle) and only triggers with onManual eventType
         *
         *  1. client-scripts (bundled) are registered in the bundle's boot loader
         *  2. onManual only -- other kinds (implicit, deferred) are handled directly in/by the Corteza API backend
         */
        set
          .filter(({ bundle }) => !bundle)
          .forEach(s => {
            s.triggers
              .filter(({ eventTypes = [] }) => eventTypes.includes('onManual'))
              .forEach(t => {
                // We are (ab)using eventbus for dispatching onManual scripts as well
                // and since it does not know about script structs (only triggers), we need
                // to modify trigger we're passing to it by adding script name
                t.scriptName = s.name
                try {
                  this.$EventBus.Register(ev => serverScriptHandler(api, ev, s.name), t)
                } catch (e) {
                  console.error(e)
                }
              })
          })
      }
    },
  },
}
