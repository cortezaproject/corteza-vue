/* eslint-disable @typescript-eslint/explicit-function-return-type */

import moment from 'moment'
import { system } from '@cortezaproject/corteza-js'

async function sleep (t) {
  return new Promise(resolve => setTimeout(resolve, t))
}

function intervalToMS (from, to) {
  if (!from || !to) {
    throw new Error('intervalToMS.invalidArgs')
  }
  return to.diff(from)
}

export class ReminderService {
  constructor ({ api, poolInterval = 1000 * 60 * 5, resource = null, emitter } = {}) {
    if (!api) {
      throw new Error('reminderService.invalidParams')
    }

    this.emitter = emitter
    this.api = api
    this.poolInterval = poolInterval
    this.running = false
    this.resource = resource

    this.set = []
    this.nextRemindAt = null
    this.tHandle = null
  }

  init ({ emitter, filter = {} }) {
    if (emitter) {
      this.emitter = emitter
    }
    this.filter = filter
    if (!this.emitter) {
      throw new Error('pool.noEmitter')
    }
    this.pool()
  }

  stop () {
    this.running = false
    if (this.tHandle) {
      window.clearTimeout(this.tHandle)
      this.tHandle = null
    }
  }

  /**
   * Pools for reminders & schedules them
   */
  async pool () {
    this.running = true

    while (this.running) {
      const { set = [] } = await this.api.reminderList({
        limit: 0,
        resource: this.resource,
        toTime: moment().add(this.poolInterval, 'min').toISOString(),
        ...this.filter,
      }).catch(() => ({ set: [] }))

      this.enqueue(set.map(r => new system.Reminder(r)))
      await sleep(this.poolInterval)
      if (this.emitter) {
        this.emitter.$emit('reminders.pull')
      }
    }
  }

  /**
   * Enqueue a given set of reminders
   * @param {<Reminder>Array} set Set of reminderIDs to enqueue
   */
  enqueue (set = []) {
    set.forEach(r => {
      // New or replace
      const i = this.set.findIndex(({ reminderID }) => reminderID === r.reminderID)
      if (i > -1) {
        this.set.splice(i, 1, r)
      } else {
        this.set.push(r)
      }
    })

    // Should watcher restart
    const { changed, time } = this.findNextProcessTime(this.set, this.nextRemindAt)
    if (changed) {
      this.nextRemindAt = time
      this.scheduleReminderProcess(this.nextRemindAt)
    }
  }

  /**
   * Dequeue a given set of reminders
   * @param {Array} set Set of reminderIDs to remove
   */
  dequeue (IDs = []) {
    this.set = this.set.filter(({ reminderID }) => !IDs.includes(reminderID))

    // don't reuse time, since it could have been removed
    const { changed, time } = this.findNextProcessTime(this.set, null)
    if (changed) {
      this.nextRemindAt = time
      this.scheduleReminderProcess(this.nextRemindAt)
    }
  }

  /**
   * Determines we should use a new time
   * @param {Array} set Set of reminders to chose from
   * @param {Object|null} time Reference point
   * @private
   */
  findNextProcessTime (set = [], time = null) {
    let changed = false
    set.forEach(r => {
      if (!time || r.remindAtTime.isBefore(time)) {
        time = r.remindAtTime
        changed = true
      }
    })

    return { changed, time }
  }

  /**
   * Schedules processor ro run at the given time
   * @param {Moment} at When it should be ran
   * @param {Moment} now Ref to now; used for tests
   * @private
   */
  scheduleReminderProcess (at, now = moment()) {
    // Determine ms until next reminder should be processed
    const t = intervalToMS(now, at)

    if (this.tHandle != null) {
      window.clearTimeout(this.tHandle)
    }
    this.tHandle = window.setTimeout(this.processQueue.bind(this), t)
  }

  /**
   * Processes the reminder queue. Emits due reminders &
   * removes them from state
   * @param {Moment} now Ref to now; used for tests
   * @private
   */
  processQueue (now = moment()) {
    let nextRemindAt = null

    this.set.forEach(r => {
      if (now.isSameOrAfter(r.remindAtTime)) {
        if (this.emitter) {
          this.emitter.$emit('reminder.show', r)
        } else {
          throw new Error('pool.noEmitter')
        }
        r.processed = true
      } else if (now.isBefore(r.remindAtTime) && (!nextRemindAt || r.remindAtTime.isBefore(nextRemindAt))) {
        nextRemindAt = r.remindAtTime
      }
    })

    this.nextRemindAt = nextRemindAt
    this.set = this.set.filter(({ processed }) => !processed)
    if (this.nextRemindAt === null) {
      this.tHandle = null
    } else {
      this.scheduleReminderProcess(this.nextRemindAt)
    }
  }
}

export default {
  install (Vue, opts) {
    Vue.prototype.$Reminder = new ReminderService(opts)
  },
}
