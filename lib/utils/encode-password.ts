const KEY = (gid: string) => `pp_grpwd_${gid}`
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

function encode(plain: string): string {
  return btoa(plain.split("").reverse().join(""))
}
function decode(encoded: string): string {
  return atob(encoded).split("").reverse().join("")
}

export function cacheGroupPassword(gid: string, plain: string) {
  localStorage.setItem(
    KEY(gid),
    JSON.stringify({ expires: Date.now() + SEVEN_DAYS, pwd: encode(plain) }),
  )
}

export function getCachedPassword(gid: string): string | null {
  try {
    const raw = localStorage.getItem(KEY(gid))
    if (!raw) return null
    const { expires, pwd } = JSON.parse(raw)
    if (Date.now() > expires) {
      localStorage.removeItem(KEY(gid))
      return null
    }
    return decode(pwd)
  } catch {
    return null
  }
}

export function clearGroupPassword(gid: string) {
  localStorage.removeItem(KEY(gid))
}
