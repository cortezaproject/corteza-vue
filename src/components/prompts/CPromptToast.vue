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
      :auto-hide-delay="pVal(prompt, 'timeout', 7) * 1000"
      :no-close-button="!passive"
    >
      <template #toast-title>
        <div class="d-flex flex-grow-1 align-items-baseline">
          <strong class="mr-auto">{{ pVal(prompt, 'title', 'Workflow prompt') }}</strong>
          <b-button
            variant="link"
            size="sm"
            v-if="!passive && waiting.length > 1"
            @click="activate(true)"
          >
            {{ waiting.length }} waiting
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
      toasts: []
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
     * Display all toasts that can be displayed:
     *   - show only prompts with components
     *   - show passive components first
     *   - show only one non-passive component (at the end
     */
    newToasts () {
      const pp = this.withComponents.filter(({ passive }) => passive)
      const nonPassive = this.withComponents.find(({ passive }) => !passive)
      if (!!nonPassive) {
        pp.unshift(nonPassive)
      }

      return pp
    },

    waiting () {
      return this.withComponents.filter(({ passive }) => !passive)
    },
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

    newToasts: {
      immediate: true,
      handler (newToasts = []) {
        // Add prompts with unique stateIDs to toasts
        const stateIDs = new Set([...this.toasts.map(({ prompt }) => prompt.stateID)]) 
        newToasts.forEach(toast => {
          if (!stateIDs.has(toast.prompt.stateID)) {
            this.toasts.push(toast)
          }
        })
      }
    }
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
