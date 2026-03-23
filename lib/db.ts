import { neon as createNeon, type NeonQueryFunction } from '@neondatabase/serverless'

let _sql: NeonQueryFunction<false, false> | null = null

function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL
    if (!url) {
      // During build, DATABASE_URL might not be available
      // Return a dummy function that throws when called
      return ((strings: TemplateStringsArray, ...values: unknown[]) => {
        throw new Error('DATABASE_URL not configured')
      }) as NeonQueryFunction<false, false>
    }
    _sql = createNeon(url)
  }
  return _sql
}

export const sql = (strings: TemplateStringsArray, ...values: unknown[]) => {
  return getSql()(strings, ...values)
}
