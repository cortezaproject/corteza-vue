<template>
  <div class="inline">
    <main>
      <component
        :is="previewType"
        inline
        v-bind="$attrs"
        :max-pages="1"
        :initial-scale="2"
        v-on="$listeners"
      />
    </main>
  </div>
</template>

<script lang="js">
import { InlineIMG as IMG, PDF } from './common/types'
import base from './common/base.vue'

export default {
  components: {
    IMG,
    PDF,
  },

  extends: base,
}
</script>
