import moment, { Moment } from 'moment'

export function isoDate (d: Moment | Date | string | number): string {
  return moment(d).format()
}

export function isoDateOnly (d: Moment | Date | string | number): string {
  return moment(d).format()
}

export function locDate (d: Moment | Date | string | number): string {
  return moment(d).format('lll')
}

export function locLongDate (d: Moment | Date | string | number): string {
  return moment(d).format('LLLL')
}

export function locDateOnly (d: Moment | Date | string | number): string {
  return moment(d).format('L')
}

export function locLongDateOnly (d: Moment | Date | string | number): string {
  return moment(d).format('LL')
}

export function locTimeOnly (d: Moment | Date | string | number): string {
  return moment(d).format('LT')
}

export function locLongTimeOnly (d: Moment | Date | string | number): string {
  return moment(d).format('LTS')
}

export function relTime (d: Moment | Date | string | number, s?: boolean): string {
  return moment(d).fromNow(s)
}
