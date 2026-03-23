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

interface Submission {
  id: number
  project_id: number
  user_id: number
  file_type: string
  uploaded_at: string
}

export default function AdminPanel({ session }: { session: SessionUser }) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await fetch('/api/admin/projects')
        const subRes = await fetch('/api/admin/submissions')

        if (projRes.ok) {
          const proj = await projRes.json()
          setProjects(proj)
        }
        if (subRes.ok) {
          const subs = await subRes.json()
          setSubmissions(subs)
        }
      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Panel de Administrador</h1>
            <p className="text-sm text-slate-600">FECTI</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{session.email}</span>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <p className="text-3xl font-bold text-blue-900">{projects.length}</p>
            <p className="text-sm text-blue-700">Proyectos totales</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
            <p className="text-3xl font-bold text-green-900">{submissions.length}</p>
            <p className="text-sm text-green-700">Reportes subidos</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100">
            <p className="text-3xl font-bold text-amber-900">
              {projects.length - submissions.length}
            </p>
            <p className="text-sm text-amber-700">Pendientes</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Proyectos</h2>
            {loading ? (
              <p className="text-slate-600">Cargando...</p>
            ) : projects.length === 0 ? (
              <p className="text-slate-600">No hay proyectos</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="p-3 bg-slate-50 hover:bg-slate-100 rounded cursor-pointer transition">
                      <p className="font-medium text-slate-900 line-clamp-1">{project.title}</p>
                      <p className="text-xs text-slate-600">{project.principal_investigator}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Submissions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Reportes recientes</h2>
            {loading ? (
              <p className="text-slate-600">Cargando...</p>
            ) : submissions.length === 0 ? (
              <p className="text-slate-600">No hay reportes</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {submissions.slice(0, 10).map((sub) => (
                  <div key={sub.id} className="p-3 bg-slate-50 rounded">
                    <p className="text-sm font-medium text-slate-900">
                      Proyecto #{sub.project_id}
                    </p>
                    <p className="text-xs text-slate-600">
                      {sub.file_type} - {new Date(sub.uploaded_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
