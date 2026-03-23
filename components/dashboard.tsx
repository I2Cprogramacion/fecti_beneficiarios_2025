'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SessionUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">FECTI Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session.email}</span>
            {session.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Panel de Admin
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {session.role === 'admin' ? 'Todos los proyectos' : 'Mi proyecto'}
          </h2>
          <p className="text-slate-600">
            {session.role === 'admin'
              ? 'Visualiza y gestiona todos los proyectos FECTI'
              : 'Accede a tu proyecto y sube tus reportes'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Cargando proyectos...</p>
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-slate-600 mb-4">No hay proyectos disponibles</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full">
                  <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 mb-1">
                    <span className="font-medium">Investigador:</span> {project.principal_investigator}
                  </p>
                  <p className="text-sm text-slate-600 mb-4">
                    <span className="font-medium">Institución:</span> {project.institution}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        project.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {project.status === 'active' ? 'Activo' : 'Completado'}
                    </span>
                    <span className="text-xs text-slate-500">ID: {project.id}</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
