<template>
  <div
    class="d-flex"
  >
    <b-form-datepicker
      v-if="!noDate"
      v-model="date"
      label-help=""
      :placeholder="labels.none"
      today-variant="info"
      selected-variant="secondary"
      boundary="window"
      :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
      :min="minDate"
      :max="maxDate"
      hide-header
      reset-button
      :class="{ 'd-inline-flex w-50': !noTime }"
      class="word-break-keep-all"
    />

    <b-form-timepicker
      v-if="!noTime"
      v-model="time"
      :placeholder="labels.none"
      boundary="window"
      hide-header
      no-close-button
      reset-button
      :class="{ 'd-inline-flex w-50': !noDate, 'ml-1': !noDate }"
      class="word-break-keep-all"
    />
  </div>
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
    },

    labels: {
      type: Object,
      required: true,
    },
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
.word-break-keep-all > .form-control {
  word-break: keep-all !important;
}
</style>