<template>
  <span class="text-center">
    <span v-if="!inConfirmation">
      <b-button
        :variant="variant"
        :size="size"
        :disabled="disabled"
        :class="[ borderless && 'border-0' ]"
        @click.prevent="onPrompt"
      >

        <slot />
      </b-button>

    </span>
    <span v-else>
      <b-button
        :variant="variantOk"
        :size="sizeConfirm"
        :disabled="okDisabled"
        class="mr-1"
        :class="[ borderless && 'border-0' ]"
        @click.prevent="onConfirmation()"
      >

        <slot name="yes" />
      </b-button>
      <b-button
        :variant="variantCancel"
        :size="sizeConfirm"
        :disabled="cancelDisabled"
        :class="[ borderless && 'border-0' ]"
        @click.prevent="onCancel()"
      >

        <slot name="no" />
      </b-button>
    </span>
  </span>
</template>
<script lang="js">
export default {
  props: {
    ctaClass: { type: String, default: 'btn-danger' },
    disabled: Boolean,
    okDisabled: Boolean,
    cancelDisabled: Boolean,
    noPrompt: Boolean,

    borderless: {
      type: Boolean,
      default: true,
    },
    variant: {
      type: String,
      default: 'outline-danger',
    },
    size: {
      type: String,
      default: 'sm',
    },
    variantOk: {
      type: String,
      default: 'danger',
    },
    variantCancel: {
      type: String,
      default: undefined,
    },
    sizeConfirm: {
      type: String,
      default: 'sm',
    },
  },

  data () {
    return {
      inConfirmation: false,
    }
  },

  computed: {
    btnClass () {
      if (this.disabled) {
        return 'btn-disabled'
      }

      return this.ctaClass
    },
  },

  methods: {
    onPrompt () {
      if (this.noPrompt) {
        this.$emit('confirmed')
      } else {
        this.inConfirmation = true
      }
    },

    onConfirmation () {
      this.inConfirmation = false
      this.$emit('confirmed')
    },

    onCancel () {
      this.inConfirmation = false
      this.$emit('canceled')
    },
  },
}
</script>
