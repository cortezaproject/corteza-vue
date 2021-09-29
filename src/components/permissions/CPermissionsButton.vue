<template>
  <a
    v-if="link"
    class="pointer"
    @click="onClick"
  >
    <font-awesome-icon :icon="['fas', 'lock']" />
  </a>
  <b-button
    v-else
    :variant="buttonVariant"
    @click="onClick"
  >
    <slot>
      <font-awesome-icon v-if="showButtonIcon" :icon="['fas', 'lock']" />
      <span v-if="buttonLabel">
        {{ buttonLabel }}
      </span>
    </slot>
  </b-button>
</template>
<script lang="js">
import { modalOpenEventName } from './def.ts'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLock } from '@fortawesome/free-solid-svg-icons'

library.add(faLock)

export default {
  props: {
    link: {
      type: Boolean,
    },

    buttonVariant: {
      type: String,
      default: undefined,
    },

    resource: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: undefined,
    },

    buttonLabel: {
      type: String,
      default: undefined,
    },

    modalOpenEvent: {
      type: String,
      default: modalOpenEventName,
    },

    target: {
      type: String,
      required: false,
      default: undefined,
    },

    showButtonIcon: {
      type: Boolean,
      default: true,
    }
  },

  methods: {
    onClick () {
      this.$root.$emit(this.modalOpenEvent, {
        target: this.target,
        resource: this.resource,
        title: this.title,
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.pointer {
  cursor: pointer;
}
</style>
