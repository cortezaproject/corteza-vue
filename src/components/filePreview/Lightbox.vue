<template>
  <lightbox v-on="$listeners">
    <!-- Proxy slots -->
    <template
      v-for="(_, slot) of $scopedSlots"
      v-slot:[slot]="scope"
    >
      <slot
        :name="slot"
        v-bind="scope"
        v-on="$listeners"
      />
    </template>

    <component
      :is="previewType"
      slot="main"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </lightbox>
</template>

<script lang="js">
import { LightboxIMG as IMG, PDF } from './common/types'
import Lightbox from '../lightbox'
import base from './common/base.vue'

export default {
  components: {
    Lightbox,
    IMG,
    PDF,
  },

  extends: base,
}
</script>
