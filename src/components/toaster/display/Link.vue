<template>
  <div>
    <a
      v-if="toast.link"
      v-bind="toast.linkOpts"
      v-html="toast.linkLabel"
    />

    <router-link
      v-else-if="toast.routerLink"
      v-bind="toast.linkOpts"
      :to="toast.routerLink"
    >
      <span v-html="toast.linkLabel" />
    </router-link>
  </div>
</template>

<script lang="js">
export default {
  props: {
    toast: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  methods: {
    fallbackLabel (resource = '') {
      if (resource.toLowerCase().startsWith('compose:record')) {
        return 'Record View'
      }
      return 'Link'
    },
  },
}
</script>
