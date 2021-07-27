<template>
  <div>
    <div
      @mouseleave="onHover(false)"
    >
      <b-sidebar
        v-model="isExpanded"
        :sidebar-class="`sidebar ${isExpanded ? 'expanded' : ''}`"
        :header-class="`d-block sidebar-header ${isExpanded ? 'expanded border-bottom p-2' : ''}`"
        :body-class="`bg-white ${isExpanded ? 'py-2 px-3' : ''}`"
        :footer-class="`bg-white rounded-right ${isExpanded ? 'p-2' : ''}`"
        :no-header="!isExpanded"
        :backdrop="isMobile"
        shadow
        no-slide
        no-close-on-route-change
      >
        <template #header>
          <div
            class="d-flex align-items-center justify-content-center"
          >
            <!-- <b-button
              variant="outline-light"
              size="lg"
              :block="!isExpanded"
              class="flex-shrink-1 icon-logo border-0"
              :to="{ name: 'root' }"
            /> -->

            <div
              class="flex-shrink-1 icon-logo border-0"
            />

            <h2
              class="flex-grow-1 mb-0"
            >
              Corteza
            </h2>

            <b-button
              v-if="isMobile"
              variant="outline-light border-0"
              class="d-flex align-items-center justify-content-center p-2"
              style="margin-right: 7px; margin-top: 4px;"
              @click="closeSidebar()"
            >
              <font-awesome-icon
                :icon="['fas', 'times']"
                class="h6 mb-0 text-dark"
              />
            </b-button>

            <b-button
              v-else
              variant="outline-light border-0"
              class="d-flex align-items-center justify-content-center p-2"
              style="margin-right: 7px; margin-top: 4px;"
              @click="pin()"
            >
              <font-awesome-icon
                :icon="['fas', 'thumbtack']"
                :class="`h6 mb-0 ${isPinned ? 'text-primary' : 'text-secondary'}`"
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
            class="px-2"
          >
            <slot
              name="header-expanded"
            />
          </div>


          <hr
            v-if="!isExpanded"
            class="my-2"
          >
        </template>

        <slot
          v-if="isExpanded"
          name="body-expanded"
        />

        <template #footer>
          <slot
            v-if="isExpanded"
            name="footer-expanded"
          />
        </template>
      </b-sidebar>
    </div>

    <div
      class="d-flex align-items-center justify-content-center tab position-absolute p-2"
    >
      <b-button
        v-if="expandOnHover && !disabledRoutes.includes($route.name)"
        variant="outline-light"
        size="lg"
        class="d-flex align-items-center border-0"
        @mouseover="onHover(true)"
      >
        <font-awesome-icon
          :icon="['fas', 'bars']"
          class="h4 mb-0 text-primary"
        />
      </b-button>

      <b-button
        v-else-if="!disabledRoutes.includes($route.name)"
        variant="outline-light"
        size="lg"
        class="d-flex align-items-center p-2 border-0"
        :to="{ name: 'root' }"
      >
        <font-awesome-icon
          :icon="['fas', 'home']"
          class="h4 mb-0 text-primary"
        />
      </b-button>

      <div
        v-else
        class="icon-logo border-0"
      />
    </div>
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
    },

    disabledRoutes: {
      type: Array,
      default: () => [],
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

    isMobile () {
      return window.innerWidth < 576
    },
  },

  created () {
    this.$root.$on('close-sidebar', () => {
      this.isExpanded = false
      this.isPinned = false
    })
  },

  beforeDestroy () {
    this.$root.$off('close-sidebar')
  },

  watch: {
    '$route.name': {
      immediate: true,
      handler (name) {
        // If sidebar should be disabled on route, close and unpin when navigating to route
        if (this.disabledRoutes.includes(name)) {
          this.isPinned = false
          this.isExpanded = false
        }
      },
    },
  },

  methods: {
    onHover (expand) {
      if (!this.pinned && this.expandOnHover) {
        setTimeout(() => {
          this.isExpanded = expand
        }, expand ? 0 : 100)
      }
    },

    pin () {
      this.isPinned = !this.isPinned
      // this.isExpanded = !this.isExpanded
    },

    closeSidebar () {
      this.isPinned = false
      this.isExpanded = false
    },
  },
}
</script>

<style lang="scss" scoped>
$header-height: 64px;

.tab {
  z-index: 1021;
  top: 0;
  height: $header-height;
  width: 66px;
}

.icon-logo {
  width: 50px;
  height: 50px;
  background-repeat: no-repeat;
  background-position: center;
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
  left: calc(-#{$nav-width}) !important;
  -webkit-transition: left 0.15s ease-in-out;
  -moz-transition: left 0.15s ease-in-out;
  -o-transition: left 0.15s ease-in-out;
  transition: left 0.15s ease-in-out;

  header {
    background-color: white;

    &.expanded {
      background-color: $sidebar-bg !important;
    }
  }

  &.expanded {
    left: 0 !important;
    -webkit-transition: left 0.2s ease-in-out;
    -moz-transition: left 0.2s ease-in-out;
    -o-transition: left 0.2s ease-in-out;
    transition: left 0.2s ease-in-out;
  }
}
</style>
