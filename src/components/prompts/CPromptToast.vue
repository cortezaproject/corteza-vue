<template>
  <div>
    <b-toast
      id="wfPromptToast"
      :visible="visible"
      variant="primary"
      solid
      no-auto-hide
      no-close-button
    >
      <template #toast-title>
        <div class="d-flex flex-grow-1 align-items-baseline">
          <strong class="mr-auto">{{ title }}</strong>
          <b-button
            variant="link"
            size="sm"
            @click="activate(true)"
          >
            {{ prompts.length }} waiting
          </b-button>
        </div>
      </template>
      <component
        v-if="component"
        :is="component"
        :payload="nextLight.payload"
        :loading="isLoading"
        @submit="resume({ input: $event, prompt: nextLight })"
      />
      <div
        v-else-if="nextLight"
        class="bg-danger"
      >
        Unknown prompt ref: {{ nextLight.ref }}
      </div>
    </b-toast>
  </div>
</template>
<script>
import CPromptChoice from './kinds/CPromptChoice.vue'
import { mapGetters, mapActions } from 'vuex'
import * as promptKinds from './kinds/index.ts'
import { pVal } from './utils.ts'

export default {
  name: 'c-prompt-toast',
  components: {
    CPromptChoice
  },

  computed: {
    ...mapGetters({
      prompts: 'wfPrompts/all',
      isActive: 'wfPrompts/isActive',
      nextLight: 'wfPrompts/nextLight',
      isLoading: 'wfPrompts/isLoading',
    }),

    /**
     * Toast is visible when there is at least one prompt loading and modal is not open (active)
     * @returns {boolean}
     */
    visible () {
      return this.prompts.length > 0 && !this.isActive
    },

    component () {
      if (!this.nextLight) {
        return
      }

      switch (this.nextLight.ref) {
        case 'alert':
          return promptKinds.CPromptAlert
        case 'choice':
          return promptKinds.CPromptChoice
        case 'input':
          return promptKinds.CPromptInput
        case 'options':
          return promptKinds.CPromptOptions
      }
    },

    /**
     * Toast title frmo payload (if set)
     * @returns {string}
     */
    title () {
      return pVal(this.nextLight, 'title', 'Workflow prompt')
    },
  },

  methods: {
    ...mapActions({
      resume: 'wfPrompts/resume',
      activate: 'wfPrompts/activate',
    }),
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
