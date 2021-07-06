/* eslint-disable @typescript-eslint/ban-ts-ignore */
import qs from 'qs'

const baseQsConfig = {
  arrayFormat: 'brackets',
  encode: false,
}

/**
 * Little URL helper
 *
 * We need it to handle relative URLs, especially ones w/o schema
 */
export function Make ({ url = '', query = {}, hash = '', ref = window.location.toString(), config = {} }): string {
  let newUrl

  if (/^http(s)?:\/\//.test(url)) {
    newUrl = new URL(url)
  } else if (/^\/\//.test(url)) {
    newUrl = new URL(ref)
    newUrl.href = `${newUrl.protocol}${url}`
  } else {
    // Construct full relative URL from path
    newUrl = new URL(ref)
    newUrl.pathname = url
  }

  if (hash) {
    newUrl.hash = hash
  }

  // TypeScript somehow thinks that 'brackets' is not a string.
  // @ts-ignore
  newUrl.search = qs.stringify(query, {
    ...baseQsConfig,
    ...config,
  })

  return newUrl.toString()
}
