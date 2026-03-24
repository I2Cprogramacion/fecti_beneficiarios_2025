import { neon as createNeon, type NeonQueryFunction } from '@neondatabase/serverless'

let _sql: NeonQueryFunction<false, false> | null = null

function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw new Error('DATABASE_URL not configured')
    }
    _sql = createNeon(url)
  }
  return _sql
}

export const sql: NeonQueryFunction<false, false> = new Proxy(
  (strings: TemplateStringsArray, ...values: unknown[]) => {
    return getSql()(strings, ...values)
  },
  {
    get: (target, prop) => {
      const fn = getSql() as any
      return fn[prop]
    },
  }
) as any
