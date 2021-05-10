<template>
  <div class="header-navigation d-flex align-items-center justify-content-between position-absolute sticky-top">
    <div
      class="d-flex text-nowrap flex-grow-1 align-items-center header px-2"
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
        class="m-0 px-2 mr-auto"
      >
        <slot name="title" />
      </h2>
      <b-form-input
        type="text"
        name="search"
        placeholder="Search..."
        class="ml-3"
      />

      <b-dropdown
        size="lg"
        variant="outline-light"
        toggle-class="text-decoration-none text-dark border-0"
        menu-class="border-0 shadow-sm text-dark font-weight-bold mt-2"
        right
        no-caret
      >
        <template #button-content>
          <font-awesome-icon
            class="m-0 h5"
            :icon="['far', 'question-circle']"
          />
          <span class="sr-only">
            Help
          </span>
        </template>
        <b-dropdown-item
          href="https://forum.cortezaproject.org/"
          target="_blank"
        >
          {{ $t('navigation.help.forum') }}
        </b-dropdown-item>
        <b-dropdown-item
          href="https://docs.cortezaproject.org/corteza-docs/2021.3/index.html"
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
      </b-dropdown>

      <b-dropdown
        size="lg"
        variant="outline-light"
        toggle-class="text-decoration-none text-dark border-0"
        menu-class="border-0 shadow-sm text-dark font-weight-bold mt-2"
        right
        no-caret
      >
        <template #button-content>
          <font-awesome-icon
            class="m-0 h5"
            :icon="['fas', 'user-cog']"
          />
          <span class="sr-only">
            {{ $t('navigation.help.forum') }}
          </span>
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
        <b-dropdown-item
          href=""
          @click="$auth.logout()"
        >
          {{ $t('navigation.userSettings.logout') }}
        </b-dropdown-item>
      </b-dropdown>
      <b-btn
        variant="outline-light"
        to="#"
        size="lg"
        class="text-dark border-0"
      >
        <font-awesome-icon
          class="m-0 h5"
          :icon="['fas', 'grip-horizontal']"
        />
      </b-btn>
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
  }
}
</script>

<style lang="scss" scoped>
$header-height: 64px;
$nav-width: 320px;

input[type=text] {
  width: 90px;
  -webkit-transition: width 0.4s ease-in-out;
  transition: width 0.4s ease-in-out;
  background: transparent;
  border: none;

  /* When the input field gets focus, change its width to 100% */
  &:focus {
    width: 100%;
    background: white;
    border: 2px solid #4D7281;
  }
}

.icon-logo {
  height: calc(#{$header-height} / 2);
  background-repeat: no-repeat;
  background-position: center;
}

.header-navigation {
  width: 100vw;
  height: $header-height;
}

.spacer {
  min-width: 77px;
  transition: width 0.1s ease-in-out;

  &.expanded {
    min-width: $nav-width;
  }
}
</style>
