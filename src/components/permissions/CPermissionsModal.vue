<template>
  <div>
    <b-modal
      v-model="showModal"
      hide-footer
      size="lg"
      :title="getTitle"
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
import { modalOpenEventName } from './def.ts'
import CPermissionsForm from './CPermissionsForm.vue'
import _ from 'lodash'

export default {
  i18nOptions: {
    namespaces: 'permission',
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

    getTitle () {
      if (this.resource) {
        if (this.resource.indexOf(':') > -1) {
          let [ resourceType, ...resourceRefs ] = this.resource.split('/')
          let [ ,, component, service = 'component' ] = resourceType.split(':', 4)

          resourceType = _.camelCase(`${component} ${service}`)

          let target
          if (resourceRefs.length > 0 && resourceRefs[resourceRefs.length - 1] === '*') {
            target = this.$t(`${resourceType}.all`)
          } else {
            target = this.$t(`${resourceType}.specific`, { target: this.title })
          }

          return this.$t('setFor', { target: target }).replace(/&amp;quot;|&quot;/g, '"')
        } else {
          return this.$t('setFor', { target: this.$t(`base.${this.resource}`) })
        }
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
