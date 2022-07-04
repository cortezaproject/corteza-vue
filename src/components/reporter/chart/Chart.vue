<template>
  <v-chart
    class="position-relative h-100 w-100 p-2 bg-white"
    :option="option"
  />
</template>

<script>
import * as echarts from 'echarts'
import VChart from 'vue-echarts'

export default {
  name: 'Chart',

  components: {
    echarts,
    VChart,
  },

  props: {
    option: {
      type: Object,
      required: true,
    },
  },
}
</script>
