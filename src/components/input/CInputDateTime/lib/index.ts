import moment from 'moment'

export function getDate (value: string): string | undefined {
  if (!value) {
    return undefined
  }

  if (value === 'Invalid date') {
    // Make sure this weird value does not cause us problems
    return undefined
  }

  const dt = value.split(' ')
  if (dt.length > 1) {
    return dt[0] // we only want the date part
  } else if (dt.length === 1) {
    // If date is in the value
    if (dt[0].indexOf('-') > -1) {
      return dt[0]
    }
  }
}

export function getTime (value: string): string | undefined {
  if (!value) {
    return undefined
  }

  const dt = value.split(' ')

  if (dt.length > 1) {
    return dt[1] // we only want the time part
  } else if (dt.length === 1) {
    // If we time is in the value
    if (dt[0].indexOf(':') > -1) {
      return dt[0]
    }
  }
}

export function setDate (date: string, value: string, noDate = false, noTime = false): string | undefined {
  if (noDate || !date || !date.length) {
    return undefined
  }

  const time = getTime(value)

  if (noTime) {
    return moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD')
  }

  return moment(date + ' ' + time, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm')
}

export function setTime (time: string, value: string, noDate = false, noTime = false): string | undefined {
  if (noTime || !time || !time.length) {
    return undefined
  }

  let date = getDate(value)

  if (noDate) {
    return moment(time, 'HH:mm').format('HH:mm')
  }

  if (!date) {
    // If no date is yet set default to today
    date = moment().format('YYYY-MM-DD')
  }

  return moment(date + ' ' + time, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD HH:mm')
}
