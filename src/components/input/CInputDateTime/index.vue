<template>
  <b-input-group
    :size="size"
  >
    <b-form-datepicker
      v-if="!noDate"
      v-model="date"
      label-help=""
      menu-class="bg-white"
      today-variant="info"
      selected-variant="secondary"
      placeholder="dd/mm/yyy"
      :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
      :min="minDate"
      :max="maxDate"
      hide-header
      reset-button
    />

    <b-form-timepicker
      v-if="!noTime"
      v-model="time"
      placeholder="--:--"
      hide-header
      no-close-button
      reset-button
    />
  </b-input-group>
</template>
<script lang="js">
import moment from 'moment'
import { getDate, setDate, getTime, setTime } from './lib/index.ts'

export default {
  props: {
    value: {
      type: String,
      required: false,
    },

    noTime: {
      type: Boolean,
      default: false,
    },

    noDate: {
      type: Boolean,
      default: false,
    },

    onlyFuture: {
      type: Boolean,
      default: false,
    },

    onlyPast: {
      type: Boolean,
      default: false,
    },

    size: {
      type: String,
      default: 'md',
    }
  },

  computed: {
    date: {
      get () {
        return getDate(this.value)
      },

      set (date) {
        this.$emit('input', setDate(date, this.value, this.noDate, this.noTime))
      },
    },

    time: {
      get () {
        return getTime(this.value)
      },

      set (time) {
        this.$emit('input', setTime(time, this.value, this.noDate, this.noTime))
      },
    },

    minDate () {
      return this.onlyFuture ? new Date() : undefined
    },

    maxDate () {
      return this.onlyPast ? new Date() : undefined
    },
  },
}
</script>

<style lang="scss">
.b-calendar-inner {
  background: white;
}
</style>
