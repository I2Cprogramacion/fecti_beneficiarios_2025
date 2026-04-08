import { getSession } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const session = await getSession()
    return NextResponse.json(session)
  } catch {
    return NextResponse.json(null)
  }
}
