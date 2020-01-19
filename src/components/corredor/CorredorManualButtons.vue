<template>
  <b-button-group>
    <b-button
      v-for="(b, i) in $UIHooks.Find(resourceType, uiSlot)"
      :key="i"
      :variant="b.variant || defaultVariant"
      :class="buttonClass"
      @click="$emit('click', b)"
    >
      {{ b.label }}
    </b-button>
  </b-button-group>
</template>

<script>
export default {
  props: {
    resourceType: {
      type: String,
      required: true,
    },

    uiSlot: {
      type: String,
      required: true,
    },

    defaultVariant: {
      type: String,
      default: () => 'link'
    },

    buttonClass: {
      type: String,
      default: () => 'mr-1'
    },
  }
}
</script>
