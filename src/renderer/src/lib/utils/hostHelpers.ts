/**
 * Shared logic for the Swarm OS platform
 * Moving this here keeps our Stores and Components "DRY"
 */

export const getFlair = (role: string = 'member') => {
  const flairs = {
    admin: { label: '💀MILKY', color: 'warning', score: 100 },
    host: { label: '⚡MEGASERVER HOST', color: 'info', score: 50 },
    creator: { label: '📼CREATOR', color: 'secondary', score: 30 },
    member: { label: null, color: 'white', score: 10 }
  }
  return flairs[role as keyof typeof flairs] || flairs.member
}

export const getSessionTime = (startedAt: any, now: number) => {
  if (!startedAt) return 'JUST NOW' // Better than 'LIVE' for that split second
  const start = startedAt.toMillis?.() || startedAt.seconds * 1000 || startedAt

  // If the server time is slightly ahead of local time, diff could be negative
  const diffMs = Math.max(0, now - start)
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'NEW'
  if (diffMins < 60) return `${diffMins}m`
  return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`
}

export const sortUsers = (users: any[], now: number) => {
  return [...users].sort((a, b) => {
    // Tier 1: Role Priority (Admin > Host > Creator > Member)
    const scoreA = getFlair(a.role).score
    const scoreB = getFlair(b.role).score
    if (scoreB !== scoreA) return scoreB - scoreA

    // Tier 2: Session Prestige (Oldest first)
    // This ensures new users are "larger" numbers and end up at the BOTTOM
    const getTime = (u: any) => {
      const val = u.startedAt?.toMillis?.() || u.startedAt?.seconds * 1000 || u.startedAt
      return val || now // If null/undefined, it becomes the largest value
    }

    const timeA = getTime(a)
    const timeB = getTime(b)

    if (timeA !== timeB) return timeA - timeB

    // Tier 3: Hard Tie-breaker
    return a.id.localeCompare(b.id)
  })
}
