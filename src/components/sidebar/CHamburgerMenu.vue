<template>
  <portal-target :name="`name-${name}`" />
</template>

<script lang="js">
export default {
  props: {
    name: {
      type: String,
      required: true,
      default: undefined,
    },
  },
}
</script>
