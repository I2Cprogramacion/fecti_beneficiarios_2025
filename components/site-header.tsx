'use client'

import Image from 'next/image'
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
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo-f.png"
            alt="FECTI"
            width={44}
            height={44}
            className="rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
            priority
          />
          <div>
            <p className="text-base font-bold leading-tight tracking-tight">FECTI</p>
            <p className="text-xs opacity-70 leading-tight hidden sm:block">Seguimiento de Proyectos 2025</p>
          </div>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link 
            href="/proyectos" 
            className="font-medium opacity-90 hover:opacity-100 transition-opacity flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
            Proyectos
          </Link>
          {userEmail && (
            <span className="hidden md:inline text-xs opacity-60 bg-white/10 px-2 py-1 rounded">{userEmail}</span>
          )}
          {showLogout && (
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Cerrar sesión
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}
