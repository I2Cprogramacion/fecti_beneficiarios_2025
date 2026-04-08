'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SessionUser } from '@/lib/auth'

interface Project {
  id: number
  title: string
  principal_investigator: string
  institution: string
  status: string
}

export default function Dashboard({ session }: { session: SessionUser }) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = await res.json()
          setProjects(data)
        }
      } catch (err) {
        console.error('Error fetching projects:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [session])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-xs font-bold text-white">F</div>
            <div>
              <p className="text-sm font-semibold leading-tight">FECTI – Dashboard</p>
              <p className="text-xs opacity-70 hidden sm:block">{session.email}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            {session.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className="text-xs font-medium opacity-90 hover:opacity-100 transition-opacity"
              >
                Panel de Admin
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-accent hover:bg-accent/90 text-white text-xs px-3 py-1.5 rounded transition-colors"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {session.role === 'admin' ? 'Todos los proyectos' : 'Mi proyecto'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {session.role === 'admin'
              ? 'Visualiza y gestiona todos los proyectos FECTI'
              : 'Accede a tu proyecto y sube tus reportes'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Cargando proyectos...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center shadow-sm">
            <p className="text-muted-foreground">No hay proyectos disponibles</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <div className="bg-card border border-border rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full group">
                  <h3 className="font-bold text-base text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-1">
                    <span className="font-semibold text-foreground">Investigador:</span> {project.principal_investigator}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    <span className="font-semibold text-foreground">Institución:</span> {project.institution}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      {project.status === 'active' ? 'Activo' : 'Completado'}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">ID: {project.id}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        FECTI &copy; 2025 &mdash; Plataforma de seguimiento
      </footer>
    </div>
  )
}
