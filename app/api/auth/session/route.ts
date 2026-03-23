import { getUserById } from '@/lib/auth'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('session')?.value

    if (!sessionId) {
      return NextResponse.json(null)
    }

    const user = await getUserById(sessionId)
    return NextResponse.json(user)
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(null)
  }
}
