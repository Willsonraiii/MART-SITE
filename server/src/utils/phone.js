export function normalizePhone(raw) {
  let phone = String(raw || '').replace(/[\s-]/g, '')
  if (phone.startsWith('+977')) phone = phone.slice(4)
  else if (phone.startsWith('00977')) phone = phone.slice(5)
  else if (phone.startsWith('977') && phone.length >= 13) phone = phone.slice(3)
  return phone
}

export const PHONE_RE = /^9\d{9}$/
