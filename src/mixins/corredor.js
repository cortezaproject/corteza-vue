/**
 * Corredor automation mixin
 */

export default {
  methods: {
    /**
     * Creates a function for registering automation scripts to UIHooks and EventBus plugins
     *
     * @param {function} serverScriptHandler translates onManual events to API calls
     * @returns {function(...[*]=)}
     */
    makeAutomationScriptsRegistrator (serverScriptHandler) {
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
                this.$EventBus.Register(ev => serverScriptHandler(this.$SystemAPI, ev, s.name), t)
              })
          })
      }
    },
  },
}
