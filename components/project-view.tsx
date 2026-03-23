'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SessionUser } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import FileUploadForm from '@/components/file-upload-form'

interface Project {
  id: number
  title: string
  principal_investigator: string
  institution: string
  status: string
  funding_amount: number
  start_date: string
  end_date: string
  description: string
}

export default function ProjectView({
  session,
  project,
}: {
  session: SessionUser
  project: Project
}) {
  const [showUpload, setShowUpload] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <Button variant="ghost">← Volver</Button>
          </Link>
          <span className="text-sm text-slate-600">{session.email}</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Project Info */}
        <Card className="p-8 mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.title}</h1>
          <p className="text-slate-600 mb-6">{project.description}</p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-slate-600 font-medium">Investigador Principal</p>
              <p className="text-lg text-slate-900">{project.principal_investigator}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Institución</p>
              <p className="text-lg text-slate-900">{project.institution}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Monto de Financiamiento</p>
              <p className="text-lg text-slate-900">
                ${project.funding_amount.toLocaleString('es-MX')}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 font-medium">Estado</p>
              <p
                className={`text-lg font-semibold ${
                  project.status === 'active' ? 'text-green-600' : 'text-slate-600'
                }`}
              >
                {project.status === 'active' ? 'Activo' : 'Completado'}
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-slate-600 font-medium mb-2">Periodo del proyecto</p>
            <p className="text-slate-900">
              {new Date(project.start_date).toLocaleDateString('es-MX')} -{' '}
              {new Date(project.end_date).toLocaleDateString('es-MX')}
            </p>
          </div>
        </Card>

        {/* Upload Section - Only for beneficiary of this project */}
        {session.role === 'beneficiary' && session.projectId === project.id && (
          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Subir Reportes</h2>
            {showUpload ? (
              <FileUploadForm projectId={project.id} onComplete={() => setShowUpload(false)} />
            ) : (
              <Button onClick={() => setShowUpload(true)} className="w-full">
                Seleccionar archivo para subir
              </Button>
            )}
          </Card>
        )}

        {/* Admin Info */}
        {session.role === 'admin' && (
          <Card className="p-8 bg-blue-50 border-blue-200">
            <p className="text-sm text-slate-600 mb-2">ID del Proyecto</p>
            <p className="text-lg font-mono text-slate-900">{project.id}</p>
          </Card>
        )}
      </main>
    </div>
  )
}
