import { neon as createNeon } from '@neondatabase/serverless'

let _sql: ReturnType<typeof createNeon> | null = null

export function getSql() {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not configured')
    }
    _sql = createNeon(process.env.DATABASE_URL)
  }
  return _sql
}

export const sql = new Proxy({}, {
  get: (target, prop) => {
    return getSql()[prop as keyof ReturnType<typeof createNeon>]
  }
}) as ReturnType<typeof createNeon>
