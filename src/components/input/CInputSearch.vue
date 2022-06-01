<template>
  <b-input-group
    class="h-100 mw-100"
  >
    <b-input
      v-model="value"
      data-test-id="input-search"
      class="border-light border-right-0 pr-0 h-100 text-truncate"
      type="search"
      name="search"
      :disabled="disabled"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      @input="search($event)"
    />
    <b-input-group-append>
      <b-input-group-text
        class="text-primary bg-white border-left-0"
      >
        <font-awesome-icon
          v-if="!hideIcon"
          :icon="['fas', 'search']"
        />
      </b-input-group-text>
    </b-input-group-append>
  </b-input-group>
</template>

<script>
import { debounce } from 'lodash'

export default {
  name: 'CInputSearch',

  props: {
    placeholder: {
      type: String,
      default: '',
    },

    disabled: {
      type: Boolean,
    },

    hideIcon: {
      type: Boolean,
    },

    autocomplete: {
      type: String,
      default: 'on',
    },

    onKeyUp: {
      type: Boolean,
    },
  },

  data () {
    return {
      value: '',
    }
  },

  methods: {
    search: debounce(function (e) {
      this.$emit('input', e)
      if (this.onKeyUp) {
        this.$emit('keyup', e)
      }
    }, 300)
  }
}
</script>
<style scoped>
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  height: 13px;
  width: 13px;
  background: url("data:image/svg+xml;charset=UTF-8,%3csvg viewPort='0 0 12 12' version='1.1' xmlns='http://www.w3.org/2000/svg'%3e%3cline x1='1' y1='11' x2='11' y2='1' stroke='black' stroke-width='2'/%3e%3cline x1='1' y1='1' x2='11' y2='11' stroke='black' stroke-width='2'/%3e%3c/svg%3e");
}
</style>
