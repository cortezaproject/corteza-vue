<script lang="js">
import { getComponent } from 'corteza-vue/src/libs/preview-file.ts'

export default {
  inheritAttrs: false,

  computed: {
    previewType () {
      const component = getComponent({ type: this.$attrs.mime, src: this.$attrs.src, name: this.$attrs.name })
      if (!component) {
        this.$emit('previewUnavailable', { type: this.$attrs.mime })
      }
      return component
    },
  },
}
</script>
