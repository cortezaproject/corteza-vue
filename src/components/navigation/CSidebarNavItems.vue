<template>
  <div class="nav-sidebar">
    <b-button
      v-for="({page = {}, params = {}, children = []}, index) of items"
      :key="index"
      variant="link"
      class="w-100 text-left text-dark text-decoration-none p-0 pt-2 nav-item"
      active-class="nav-active"
      exact-active-class="nav-active"
      :to="{ name: page.name || defaultRouteName, params }"
    >
      <span
        class="d-inline-block w-75 text-nowrap text-truncate"
        @click="closeSidebar()"
      >
        <font-awesome-icon
          v-if="page.icon"
          class="icon"
          :icon="page.icon"
        />
        <span
          class="title"
        >
          {{ page.title }}
        </span>
      </span>

      <template
        v-if="children.length"
      >
        <b-button
          variant="link"
          class="p-0 float-right"
          :disabled="showChildren(page, children)"
          @click.self.stop.prevent="toggle(page)"
        >
          <font-awesome-icon
            v-if="!collapses[pageIndex(page)]"
            class="pointer-none"
            :icon="['fas', 'chevron-down']"
          />
          <font-awesome-icon
            v-else
            class="pointer-none"
            :icon="['fas', 'chevron-up']"
          />
        </b-button>

        <b-collapse
          :visible="collapses[pageIndex(page)] || showChildren(page, children)"
          @click.stop.prevent
        >
          <c-sidebar-nav-items
            class="ml-2"
            :items="children"
            :start-expanded="startExpanded"
            :default-route-name="defaultRouteName"
            v-on="$listeners"
          />
        </b-collapse>
      </template>
    </b-button>
  </div>
</template>

<script>
export default {
  name: 'CSidebarNavItems',

  props: {
    /*
    * {
        page: { name, title }
        params: {...}
      }
    */
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
    defaultRouteName: {
      type: String,
      required: true,
    },
    startExpanded: {
      type: Boolean,
      required: false,
    },
  },

  data () {
    return {
      collapses: {},
    }
  },

  watch: {
    items: {
      handler: function (items) {
        for (const i of items) {
          this.setState(i.page, this.startExpanded)
        }
      },
      immediate: true,
    },
  },

  methods: {
    closeSidebar () {
      if (window.innerWidth < 576) {
        this.$root.$emit('close-sidebar')
      }
    },

    pageIndex (p) {
      return p.pageID || p.name || p.title
    },

    toggle (p) {
      const px = this.pageIndex(p)
      this.$set(this.collapses, px, !this.collapses[px])
    },

    setState (p, state = false) {
      const px = this.pageIndex(p)
      this.$set(this.collapses, px, state)
    },

    // Recursively check for child pages that are open, so that parents can open aswell
    showChildren (page = {}, children = []) {
      if (page.pageID === this.$route.params.pageID) {
        return page.pageID === this.$route.params.pageID
      }

      return children.map(({ page, children }) => this.showChildren(page, children)).some(isOpen => isOpen)
    },
  },
}
</script>

<style scoped lang="scss">
// This has to be there, so chevrons are clickable inside the button
.pointer-none {
  pointer-events: none;
}

.svg-inline--fa {
  width: 30px;
}

.nav-active > span > {
  .icon {
    color: #4D7281;
  }

  .title {
    font-size: 1.05rem;
    font-family: 'nunito_sansbold';
  }
}
</style>
