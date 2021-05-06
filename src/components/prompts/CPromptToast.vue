<template>
  <div>
    <b-toast
      v-for="({ prompt, component, passive }) in toasts"
      :id="'wfPromptToast-'+prompt.stateID"
      :key="'wfPromptToast-'+prompt.stateID"
      :variant="pVal(prompt, 'variant', 'primary')"
      :visible="!isActive"
      solid
      :no-auto-hide="!passive"
      :auto-hide-delay="pVal(prompt, 'timeout', defaultTimeout) * 1000"
      :no-close-button="!passive"
    >
      <template #toast-title>
        <div class="d-flex flex-grow-1 align-items-baseline">
          <strong class="mr-auto">{{ pVal(prompt, 'title', 'Workflow prompt') }}</strong>
          <b-button
            variant="link"
            size="sm"
            v-if="!passive && active.length > 1"
            @click="activate(true)"
          >
            {{ active.length }} waiting
          </b-button>
        </div>
      </template>
      <component
        v-if="component"
        :is="component"
        :payload="prompt.payload"
        :loading="isLoading"
        @submit="resumeToast({ input: $event, prompt })"
      />
    </b-toast>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import definitions from './kinds/index.ts'
import { pVal } from './utils.ts'

export default {
  name: 'c-prompt-toast',

  data () {
    return {
      passive: new Set(),
    }
  },

  computed: {
    ...mapGetters({
      prompts: 'wfPrompts/all',
      isActive: 'wfPrompts/isActive',
      isLoading: 'wfPrompts/isLoading',
    }),

    withHandlers () {
      return this.prompts
        .filter(({ ref }) => !!definitions[ref] && !!definitions[ref].handler)
        .map(prompt => ({ ...definitions[prompt.ref], prompt }))
    },

    withComponents () {
      return this.prompts
        .filter(({ ref }) => !!definitions[ref] && !!definitions[ref].component)
        .map(prompt => ({ ...definitions[prompt.ref], prompt }))
    },

    /**
     * All non-passive prompts with components
     */
    active() {
      return this.withComponents.filter(({ passive }) => !passive)
    },

    /**
     * Returns list of prompts that we can interpret as toasts: display component is defined
     *
     * Toasts (prompts with components) are displayed in order received but
     * passive (no feedback or input from user required) first and the rest later
     */
    toasts () {
      return [
        ...this.passive.values(),
        ...this.active
      ]
    },

    defaultTimeout () {
      return 7
    }
  },

  watch: {
    // watch prompts with handlers and when a new one arrives
    // shift it from the stack, resume the prompt and handle it
    withHandlers (hh) {
      if (hh.length > 0) {
        const { handler, prompt } = hh.shift()
        this.resume({ input: {}, prompt }).then(() => {
          handler.call(this, prompt.payload)
        })
      }
    },

    /**
     * Make a copy of prompt if it is defined as passive
     *
     * We do this because we do not want it to be removed right away
     * but through a toast component's timeout
     */
    prompts: {
      immediate: true,
      handler () {
        this.withComponents.forEach(p => {
          if (p.passive) {
            this.passive.add(p)
          }
        })
      },
    },
  },

  methods: {
    ...mapActions({
      resume: 'wfPrompts/resume',
      activate: 'wfPrompts/activate',
    }),

    resumeToast (values) {
      // Only reset input if prompt is kept open
      if (values.input && values.input.keep) {
        values.input = {}
      } else {
        // Otherwise remove prompt from toasts
        this.toasts = this.toasts.filter(({ prompt }) => prompt.stateID !== values.prompt.stateID)
      }

      this.resume(values)
    },

    pVal (prompt, k, def = undefined) {
      return pVal(prompt.payload, k, def)
    },
  },
}
</script>
<style scoped lang="scss">
.slide-enter-active {
  transition: all .3s ease;
}
.slide-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-enter, .slide-leave-to
/* .slide-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
