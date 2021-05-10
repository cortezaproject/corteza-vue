<template>
  <div
    @mouseover="onHover(true)"
    @mouseleave="onHover(false)"
  >
    <b-sidebar
      v-model="isExpanded"
      :sidebar-class="`sidebar ${isExpanded ? 'expanded' : ''}`"
      :header-class="`d-block rounded-right ${isExpanded ? 'expanded border-bottom' : ''}`"
      :body-class="`bg-white px-2 ${isExpanded ? 'pt-2' : 'py-0'}`"
      footer-class="bg-white p-2 rounded-right"
      shadow
      no-slide
      no-close-on-route-change
    >
      <template #header>
        <div
          @mouseover.stop
          :class="`${isExpanded ? 'p-2' : 'px-2 pt-2'}`"
        >
          <div
            class="d-flex sidebar-header align-items-center justify-content-center"
          >
            <b-button
              variant="outline-light"
              size="lg"
              :block="!isExpanded"
              class="h-100 flex-shrink-1 icon-logo border-0"
              :to="{ name: 'root' }"
            />

            <h2
              v-if="isExpanded"
              class="flex-grow-1 mb-0"
            >
              Corteza
            </h2>

            <b-button
              v-if="isExpanded"
              variant="link"
              @click="pin()"
            >
              <font-awesome-icon
                :icon="['fas', 'chevron-left']"
                class="h6 mb-0"
              />
            </b-button>
          </div>

          <div
            v-if="!isExpanded"
            class="d-flex align-items-center justify-content-center my-3"
          >
            <b-button
              variant="link"
              @click="pin()"
            >
              <font-awesome-icon
                :icon="['fas', 'chevron-right']"
                class="h6 mb-0"
              />
            </b-button>
          </div>

          <div
            v-if="isExpanded"
          >
            <slot name="header-expanded" />
          </div>

          <div
            v-else
          >
            <slot name="header-collapsed" />
          </div>

          <hr
            v-if="!isExpanded"
            class="my-2"
          >
        </div>
      </template>

      <div
        v-if="isExpanded"
      >
        <slot name="body-expanded" />
      </div>

      <div
        v-else
      >
        <slot name="body-collapsed" />
      </div>

      <template #footer>
        <div
          v-if="isExpanded"
        >
          <slot name="footer-expanded" />
        </div>

        <div
          v-else
        >
          <slot name="footer-collapsed" />
        </div>
      </template>
    </b-sidebar>
  </div>
</template>

<script>
export default {
  props: {
    expanded: {
      type: Boolean,
      default: false,
    },

    pinned: {
      type: Boolean,
      default: false,
    },

    expandOnHover: {
      type: Boolean,
      default: false,
    }
  },

  computed: {
    isExpanded: {
      get () {
        return this.expanded
      },

      set (expanded) {
        this.$emit('update:expanded', expanded)
      },
    },

    isPinned: {
      get () {
        return this.pinned
      },

      set (pinned) {
        this.$emit('update:pinned', pinned)
      },
    },
  },

  methods: {
    onHover (expand) {
      if (!this.pinned && this.expandOnHover) {
        this.isExpanded = expand
      }
    },

    pin () {
      this.isPinned = !this.isPinned && !this.isExpanded
      this.isExpanded = !this.isExpanded
    },
  },
}
</script>

<style lang="scss" scoped>
$header-height: 48px;

.sidebar {
   header {
    .icon-logo {
      width: 69px;
      background-repeat: no-repeat;
      background-position: center;
    }
  }
}

.sidebar-header {
  height: $header-height;
}
</style>

<style lang="scss">
$nav-width: 320px;
$sidebar-bg: #F4F7FA;

.sidebar {
  display: flex !important;
  width: 77px !important;

  header {
    background-color: white;

    &.expanded {
      background-color: $sidebar-bg !important;
    }
  }

  &.expanded {
    width: $nav-width !important;
  }
}
</style>
