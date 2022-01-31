// stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
function toNFD (s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function Assert (obj: any, query: string, field: string, ...fields: Array<string>): boolean {
  if (!obj) {
    return false
  }

  query = toNFD(query.trim().toLowerCase())

  return fields.concat([field])
    .some(f => toNFD(obj[f].trim().toLowerCase()).includes(query))
}
