import moment, { Moment } from 'moment'

export function isoDate (date: Moment | Date | string | number): string {
  return moment(date).format()
}

export function isoDateOnly (date: Moment | Date | string | number): string {
  return moment(date).format()
}

export function locDate (date: Moment | Date | string | number): string {
  return moment(date).format('lll')
}

export function locLongDate (date: Moment | Date | string | number): string {
  return moment(date).format('LLLL')
}

export function locDateOnly (date: Moment | Date | string | number): string {
  return moment(date).format('L')
}

export function locLongDateOnly (date: Moment | Date | string | number): string {
  return moment(date).format('LL')
}

export function locTimeOnly (date: Moment | Date | string | number): string {
  return moment(date).format('LT')
}

export function locLongTimeOnly (date: Moment | Date | string | number): string {
  return moment(date).format('LTS')
}

export function relTime (date: Moment | Date | string | number, suffix?: boolean): string {
  return moment(date).fromNow(suffix)
}
