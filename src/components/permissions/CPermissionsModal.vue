<template>
  <div>
    <b-modal
      v-model="showModal"
      hide-footer
      size="lg"
      :title="translatedTitle"
      lazy
      scrollable
      @hide="onHide"
    >
      <c-permissions-form
        v-if="resource"
        :resource="resource"
        :target="target"
      />
    </b-modal>
  </div>
</template>
<script lang="js">
import {modalOpenEventName, split} from './def.ts'
import CPermissionsForm from './CPermissionsForm.vue'

export default {
  i18nOptions: {
    namespaces: 'permissions',
  },

  components: {
    CPermissionsForm,
  },

  data () {
    return {
      resource: undefined,
      title: undefined,
      target: undefined,
    }
  },

  computed: {
    showModal: {
      get () {
        return !!this.resource
      },

      set (open) {
        if (!open) {
          this.clear()
        }
      },
    },

    translatedTitle () {
      if (this.resource) {
        const { i18nPrefix } = split(this.resource)

        let target
        if (this.title) {
          target = this.$t(`permissions:${i18nPrefix}.specific`, { target: this.title })
        } else {
          target = this.$t(`permissions:${i18nPrefix}.all`)
        }

        return this.$t('permissions:ui.set-for', { target: target }).replace(/&amp;quot;|&quot;/g, '"')
      }

      return undefined
    },
  },

  mounted () {
    this.$root.$on(modalOpenEventName, ({ resource, title, target }) => {
      this.resource = resource
      this.title = title
      this.target = target
    })
  },

  destroyed () {
    this.$root.$off(modalOpenEventName)
  },

  methods: {
    onHide () {
      this.clear()
    },

    clear () {
      this.resource = undefined
      this.title = undefined
      this.target = undefined
    },
  },
}
</script>
