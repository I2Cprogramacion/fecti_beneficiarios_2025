'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SiteHeaderProps {
  userEmail?: string | null
  showLogout?: boolean
}

export function SiteHeader({ userEmail, showLogout }: SiteHeaderProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-xs font-bold text-white">
            F
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">FECTI</p>
            <p className="text-xs opacity-70 leading-tight hidden sm:block">Seguimiento de Proyectos 2024</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/proyectos" className="opacity-80 hover:opacity-100 transition-opacity">
            Proyectos
          </Link>
          {userEmail && (
            <span className="hidden md:inline text-xs opacity-60">{userEmail}</span>
          )}
          {showLogout && (
            <button
              onClick={handleLogout}
              className="bg-accent hover:bg-accent/90 text-white text-xs px-3 py-1.5 rounded transition-colors"
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
