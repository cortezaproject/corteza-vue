<template>
  <b-modal
    v-model="isOpened"
    size="lg"
    lazy
    :hide-footer="!current"
    :title="title"
    :busy="isLoading"

    @hide="deactivate()"
  >
    <div
      v-if="current"
    >
      <component
        v-if="component"
        :is="component"
        :payload="current.payload"
        :loading="isLoading"
        @submit="resume({ input: $event, prompt: current })"
      />
      <div
        v-else
        class="bg-danger"
      >
        Unknown prompt ref: {{ ref }}
      </div>
    </div>
    <div
      v-else
    >
        <div
          class="d-flex flex-grow-1 align-items-baseline"
          v-for="({ key, title, age, prompt }) in list"
          :key="key"
        >
          <span
            class="mr-auto"
            @click="activate(prompt)"
          >
            {{ title }}
            <time
              class="muted small"
              :datetime="prompt.createdAt"
            >
              {{ age }}
            </time>
          </span>
          <b-button
            variant="link"
            size="sm"
            @click="remove(prompt)"
            :disabled="isLoading"
            v-if="false"
          >Remove</b-button>
        </div>
    </div>
    <template
      v-if="current"
      #modal-footer
    >
      <b-button
        variant="link"
        @click="activate(true)"
      >
        &laquo; Back to list
      </b-button>
    </template>
  </b-modal>
</template>
<script lang="js">
import { mapGetters, mapActions } from 'vuex'
import * as promptKinds from './kinds/index.ts'
import { pVal } from './utils.ts'
import moment from 'moment'

export default {
  name: 'c-prompt-modal',
  computed: {
    ...mapGetters({
      isLoading: 'wfPrompts/isLoading',
      isActive: 'wfPrompts/isActive',
      current: 'wfPrompts/current',
      all: 'wfPrompts/all',
    }),

    isOpened: {
      get () {
        return this.isActive
      },

      set (open) {
        if (!open) {
          this.deactivate()
        } else {
          this.activate()
        }
      },
    },

    list () {
      return this.all.map((prompt) => ({
        key: prompt.stateID,
        title: pVal(prompt.payload, 'title', 'Workflow prompt'),
        age: moment(prompt.createdAt).fromNow(),
        prompt,
      }))
    },

    component () {
      if (!this.current) {
        return
      }

      switch (this.current.ref) {
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

    title () {
      if (!this.current) {
        return 'Workflow prompts'
      }

      return pVal(this.current, 'title', 'Workflow prompt')
    },
  },

  methods: {
    ...mapActions({
      remove: 'wfPrompts/remove',
      resume: 'wfPrompts/resume',
      activate: 'wfPrompts/activate',
      deactivate: 'wfPrompts/deactivate',
    }),

    clear () {
      this.deactivate()
    },
  }
}
</script>
