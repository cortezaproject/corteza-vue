<template>
  <b-sidebar
    v-model="isVisible"
    header-class="reminder-sidebar-header px-2 py-3 border-bottom"
    body-class="bg-white px-2"
    :title="title"
    :backdrop="isMobile"
    no-footer
    right
    shadow
    no-close-on-route-change
    no-close-on-esc
  >
    <slot />
  </b-sidebar>
</template>

<script lang="js">
export default {
  props: {
    title: {
      type: String,
      default: '',
    },

    visible: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    isVisible: {
      get () {
        return this.visible
      },

      set (visible) {
        this.$emit('update:visible', visible)
      },
    },

    isMobile () {
      return window.innerWidth < 576
    },
  },
}
</script>

<style lang="scss">
.reminder-sidebar-header {
  height: 64px;
  background-color: #F4F7FA;
}
</style>
