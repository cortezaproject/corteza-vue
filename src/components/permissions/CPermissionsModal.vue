<template>
  <div>
    <b-modal
      v-model="showModal"
      hide-footer
      size="lg"
      :title="getTitle"
      lazy
      @hide="onHide"
    >
      <c-permissions-form
        v-if="resource"
        :resource="resource"
        :target="title"
      />
    </b-modal>
  </div>
</template>
<script lang="js">
import { modalOpenEventName } from './def.ts'
import CPermissionsForm from './CPermissionsForm.vue'

export default {
  name: 'permissions-modal',

  components: {
    CPermissionsForm,
  },

  data () {
    return {
      resource: undefined,
      title: undefined,
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

    getTitle () {
      if (this.resource) {
        if (this.resource.indexOf(':') > -1) {
          let [, targetName, target] = this.resource.split(':')
          if (target === '*') {
            target = this.$t(`permission.${targetName}.all`)
          } else {
            target = this.$t(`permission.${targetName}.specific`, { target: this.title })
          }
          return this.$t('permission.setFor', { target: target }).replace(/&amp;quot;|&quot;/g, '"')
        } else {
          return this.$t('permission.setFor', { target: this.$t(`permission.base.${this.resource}`) })
        }
      }

      return undefined
    },
  },

  mounted () {
    this.$root.$on(modalOpenEventName, ({ resource, title }) => {
      this.resource = resource
      this.title = title
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
    },
  },
}
</script>
