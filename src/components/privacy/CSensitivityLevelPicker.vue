<template>
  <vue-select
    key="type"
    :value="value"
    :options="sensitivityLevels"
    :get-option-label="getLabel"
    :placeholder="placeholder"
    :reduce="l => l.sensitivityLevelID"
    append-to-body
    class="bg-white"
    @input="$emit('input', $event)"
  />
</template>

<script>
import { VueSelect } from 'vue-select'

export default {
  components: {
    VueSelect,
  },

  props: {
    value: {
      type: String,
      default: '',
    },

    placeholder: {
      type: String,
      default: '',
    },

    // ID of sensitivityLevel with the maximum allowed level
    maxLevel: {
      type: String,
      default: undefined
    },
  },

  data () {
    return {
      allSensitivityLevels: [],
    }
  },

  computed: {
    sensitivityLevels () {
      if (this.maxLevel) {
        const maxLevelConnection = this.allSensitivityLevels.find(({ sensitivityLevelID }) => sensitivityLevelID === this.maxLevel)
        if (maxLevelConnection) {
          return this.allSensitivityLevels.filter(({ level }) => level <= maxLevelConnection.level)
        }
      }

      return this.allSensitivityLevels
    },
  },

  mounted () {
    this.$SystemAPI.dalSensitivityLevelList()
      .then(({ set }) => {
        this.allSensitivityLevels = set
      })
  },

  methods: {
    getLabel ({ handle, meta = {} }) {
      return meta.name || handle
    },
  }
}
</script>

<style>

</style>