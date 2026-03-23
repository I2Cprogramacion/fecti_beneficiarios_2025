import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function debug() {
  console.log('Checking database...')
  
  try {
    const users = await sql`SELECT id, email, role, must_change_password FROM users`
    console.log('Users in DB:', users)
    
    const projects = await sql`SELECT COUNT(*) as count FROM projects`
    console.log('Projects count:', projects[0])
  } catch (err) {
    console.error('Error:', err)
  }
}

debug()
