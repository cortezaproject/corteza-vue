<template>
  <div>
    <p v-html="message"></p>
    <b-form-group
      :label="pVal('label', 'Input')"
    >
      <b-form-select
        v-if="type === 'select'"
        :options="options"
        :disabled="loading"
        v-model="value"
      >
      </b-form-select>
      <b-form-select
        v-if="type === 'radio'"
        v-model="value"
        :disabled="loading"
        :options="options"
      >
      </b-form-select>
    </b-form-group>
    <b-button
      :disabled="loading"
      @click="$emit('submit', { value: { '@value': value, '@type': 'String' }})"
    >
      {{ pVal('buttonLabel', 'Submit') }}
    </b-button>
  </div>
</template>
<script lang="js">
import base from './base.vue'

const validTypes = [
  'select',
  'radio',
]

export default {
  extends: base,
  name: 'c-prompt-options',

  data () {
    return {
      value: undefined
    }
  },

  beforeMount() {
    this.value = this.pVal('value')
  },

  computed: {
    options() {
      const out = []
      const options = this.pVal('options', {})
      for (const value in options) {
        out.push({value, text: options[value]})
      }

      return out
    },

    type() {
      const t = this.pVal('type', 'text')
      if (validTypes.indexOf(t) === -1) {
        return 'select'
      }

      return t
    },
  },
}
</script>
