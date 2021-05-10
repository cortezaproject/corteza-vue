<template>
  <aside
    class="CSidebar d-flex flex-column vh-100"
    :class="[ position, visible ? 'visible' : null ]"
    :style="getStyle"
  >
    <portal
      v-if="!disableToggle"
      :to="`name-${name}`"
    >
      <b-button
        variant="link"
        class="p-0 text-dark"
        @click="toggle"
      >
        <font-awesome-icon :icon="['fas', 'bars']" />
      </b-button>
    </portal>

    <header
      v-if="$slots.header"
      class="p-0 border-0 border-bottom-primary"
    >
      <slot name="header" />
    </header>

    <div class="bg-white overflow-auto flex-grow-1 overflow-auto">
      <slot />
    </div>

    <footer
      v-if="$slots.footer"
      class="p-0 border-0 border-bottom-primary"
    >
      <slot name="footer" />
    </footer>
  </aside>
</template>

<script lang="js">
export default {
  props: {
    name: {
      type: String,
      required: true,
      default: undefined,
    },

    position: {
      type: String,
      required: false,
      default: 'left',
    },

    width: {
      type: Number,
      required: false,
      default: 200,
    },

    visible: {
      type: Boolean,
      required: false,
      default: false,
    },

    disableToggle: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  computed: {
    getStyle () {
      return {
        width: `${this.width}px`,
        [`margin-${this.position}`]: this.visible ? '0px' : `-${this.width}px`,
      }
    },
  },

  methods: {
    toggle () {
      if (!this.disableToggle) {
        this.$emit('update:visible', !this.visible)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.CReminderSidebar {
  transition: margin .3s;
}
</style>
