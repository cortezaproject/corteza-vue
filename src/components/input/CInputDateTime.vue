<template>
  <b-form-group :label="label">
    <b-form-input
      v-if="!noDate"
      v-model="date"
      type="date"
      class="d-inline w-50"
    />

    <b-form-input
      v-if="!noTime"
      v-model="time"
      type="time"
      class="d-inline w-50"
    />
  </b-form-group>
</template>
<script lang="js">
import base from './base.vue'
import moment from 'moment'

export default {
  extends: base,

  props: {
    noTime: {
      type: Boolean,
      default: false,
    },
    noDate: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    date: {
      get () {
        return this.getDate()
      },
      set (d) {
        this.setDate(d)
      },
    },
    time: {
      get () {
        return this.getTime()
      },
      set (t) {
        this.setTime(t)
      },
    },
  },

  methods: {
    getTime () {
      if (!this.value) {
        return undefined
      }

      let dt = this.value.split(' ')

      if (dt.length > 1) {
        return dt[1] // we only want the time part
      } else if (dt.length === 1) {
        // If we time is in the value
        if (dt[0].indexOf(':') > -1) {
          return dt[0]
        }
      }
    },

    setTime (t) {
      if (this.noTime || !t || !t.length) {
        return
      }

      let tm = moment()
      let date = this.getDate()
      if (this.noDate) {
        tm = moment(t, 'HH:mm')
        tm = tm.format('HH:mm')
      } else {
        if (!date) {
          // If no date is yet set default to today
          date = moment().format('YYYY-MM-DD')
        }
        tm = moment(date + ' ' + t, 'YYYY-MM-DD HH:mm')
        tm = tm.format('YYYY-MM-DD HH:mm')
      }

      this.$emit('input', tm)
    },

    getDate () {
      if (!this.value) {
        return undefined
      }

      if (this.value === 'Invalid date') {
        // Make sure this weird value does not cause us problems
        return undefined
      }

      let dt = this.value.split(' ')
      if (dt.length > 1) {
        return dt[0] // we only want the date part
      } else if (dt.length === 1) {
        // If date is in the value
        if (dt[0].indexOf('-') > -1) {
          return dt[0]
        }
      }
    },

    setDate (d) {
      if (this.noDate || !d || !d.length) {
        return
      }

      let dm = moment()
      const time = this.getTime()
      if (this.noTime) {
        dm = moment(d, 'YYYY-MM-DD')
        dm = dm.format('YYYY-MM-DD')
      } else {
        dm = moment(d + ' ' + time, 'YYYY-MM-DD HH:mm')
        dm = dm.format('YYYY-MM-DD HH:mm')
      }

      this.$emit('input', dm)
    },
  },
}
</script>
