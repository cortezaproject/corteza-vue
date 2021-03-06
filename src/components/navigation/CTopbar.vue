<template>
  <div class="header-navigation d-flex align-items-center justify-content-between sticky-top pr-3 pl-5 ">
    <div
      class="d-flex text-nowrap flex-grow-1 align-items-center header h-100"
    >
      <template>
        <div
          class="spacer"
          :class="{
            'expanded': sidebarPinned,
          }"
        />
      </template>

      <h2
        class="d-flex align-items-center mb-0 ml-2 mr-auto h-100"
      >
        <slot name="title" />
      </h2>

      <div>
        <slot name="tools" />
      </div>

      <b-button
        v-if="!hideAppSelector"
        variant="outline-light"
        :href="appSelectorURL"
        size="lg"
        class="d-flex align-items-center justify-content-center text-dark border-0 nav-icon rounded-circle p-2 ml-2"
      >
        <font-awesome-icon
          class="m-0 h5"
          :icon="['fas', 'grip-horizontal']"
        />
      </b-button>

      <b-dropdown
        size="lg"
        variant="outline-light"
        class="nav-icon mx-1"
        toggle-class="text-decoration-none text-dark rounded-circle border-0 p-2"
        menu-class="border-0 shadow-sm text-dark font-weight-bold mt-2"
        right
        no-caret
      >
        <template #button-content>
          <div
            class="d-flex align-items-center justify-content-center"
          >
            <font-awesome-icon
              class="m-0 h5"
              :icon="['far', 'question-circle']"
            />
            <span class="sr-only">
              Help
            </span>
          </div>
        </template>
        <b-dropdown-item
          href="https://forum.cortezaproject.org/"
          target="_blank"
        >
          {{ $t('navigation.help.forum') }}
        </b-dropdown-item>
        <b-dropdown-item
          :href="documentationURL"
          target="_blank"
        >
          {{ $t('navigation.help.documentation') }}
        </b-dropdown-item>
        <b-dropdown-item
          href="mailto:info@crust.tech"
          target="_blank"
        >
          {{ $t('navigation.help.feedback') }}
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item
          disabled
          class="small"
        >
          {{ $t('navigation.help.version') }}
          <br>
          {{ frontendVersion }}
        </b-dropdown-item>
      </b-dropdown>

      <b-dropdown
        size="lg"
        variant="outline-light"
        class="nav-user-icon"
        toggle-class="nav-icon p-0 text-decoration-none text-dark rounded-circle border"
        menu-class="border-0 shadow-sm text-dark font-weight-bold mt-2"
        right
        no-caret
      >
        <template #button-content>
          <div
            class="d-flex align-items-center justify-content-center"
          >
            <font-awesome-icon
              class="m-0 h5"
              :icon="['far', 'user']"
            />
            <span class="sr-only">
              {{ $t('navigation.help.forum') }}
            </span>
          </div>
        </template>
        <b-dropdown-text class="text-muted mb-2">
          {{ $t('navigation.userSettings.loggedInAs', { user: userLabel }) }}
        </b-dropdown-text>
        <b-dropdown-item
          :href="userProfileURL"
          target="_blank"
        >
          {{ $t('navigation.userSettings.profile') }}
        </b-dropdown-item>
        <b-dropdown-item
          :href="changePasswordURL"
          target="_blank"
        >
          {{ $t('navigation.userSettings.changePassword') }}
        </b-dropdown-item>
        <b-dropdown-divider />
        <b-dropdown-item
          href=""
          @click="$auth.logout()"
          class="mt-2"
        >
          {{ $t('navigation.userSettings.logout') }}
        </b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    sidebarPinned: {
      type: Boolean,
      required: true,
      default: false,
    },

    hideAppSelector: {
      type: Boolean,
      required: false,
      default: false,
    },

    appSelectorURL: {
      type: String,
      default: '/..'
    }
  },

  computed: {
    user () {
      return this.$auth.user || {}
    },

    userLabel () {
      return this.user.name || this.user.handle || this.user.email || ''
    },

    userProfileURL () {
      return this.$auth.cortezaAuthURL
    },

    changePasswordURL () {
      return `${this.$auth.cortezaAuthURL}/change-password`
    },

    documentationURL () {
      const [year, month] = VERSION.split('.')
      return `https://docs.cortezaproject.org/corteza-docs/${year}.${month}/index.html`
    },

    frontendVersion () {
      /* eslint-disable no-undef */
      return VERSION
    },
  }
}
</script>

<style lang="scss" scoped>
$header-height: 64px;
$nav-width: 320px;
$nav-icon-size: 40px;
$nav-user-icon-size: 50px;

.icon-logo {
  height: calc(#{$header-height} / 2);
  background-repeat: no-repeat;
  background-position: center;
}

.nav-icon {
  width: $nav-icon-size;
  height: $nav-icon-size;
}

.nav-user-icon {
  width: $nav-user-icon-size;
  height: $nav-user-icon-size;
}

.header-navigation {
  width: 100vw;
  height: $header-height;
  background-color: #F3F3F5 !important;

  h2 {
    padding-left: calc(0.5rem + 2px);
  }
}

.spacer {
  min-width: 0px;
  -webkit-transition: min-width 0.15s ease-in-out;
  -moz-transition: min-width 0.15s ease-in-out;
  -o-transition: min-width 0.15s ease-in-out;
  transition: min-width 0.15s ease-in-out;

  &.expanded {
    min-width: calc(#{$nav-width} - 42px);
    -webkit-transition: min-width 0.2s ease-in-out;
    -moz-transition: min-width 0.2s ease-in-out;
    -o-transition: min-width 0.2s ease-in-out;
    transition: min-width 0.2s ease-in-out;
  }
}
</style>
