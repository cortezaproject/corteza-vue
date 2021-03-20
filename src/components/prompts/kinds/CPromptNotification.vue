<template>
  <div>
    <p v-html="message"></p>
    <div
      class="text-center m-2"
    >
    </div>
  </div>
</template>
<script lang="js">
import base from './base.vue'

export default {
  extends: base,
  name: 'c-prompt-notification',

  mounted () {
    // Non blocking, return to workflow right away
    this.$emit('submit', {})

    const message = this.pVal('message', undefined)
    const variant = this.pVal('variant', undefined)
    const sticky = this.pVal('sticky', false)
    const timeout = this.pVal('timeout', 0)
    if (message !== undefined) {

    }
  }
}
</script>
