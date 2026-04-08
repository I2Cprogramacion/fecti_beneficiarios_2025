'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ExcelPreviewInline } from './excel-preview-inline'

interface Project {
  id: number
  num: number
  clave: string
  componente: string
  titulo: string
  monto: string
  assigned_email: string | null
  file_name: string | null
  uploaded_at: string | null
  submitted: boolean
}

interface AdminDashboardProps {
  projects: Project[]
  templatePathname: string | null
  totalSubmitted: number
  adminEmail: string
  manageUsersUrl?: string
}

export function AdminDashboard({
  projects,
  templatePathname,
  totalSubmitted,
  adminEmail,
  manageUsersUrl,
}: AdminDashboardProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'submitted' | 'pending'>('all')

  // Template upload
  const templateRef = useRef<HTMLInputElement>(null)
  const [templateLoading, setTemplateLoading] = useState(false)
  const [templateMsg, setTemplateMsg] = useState('')

  // User assignment modal
  const [assignModal, setAssignModal] = useState<Project | null>(null)
  const [assignEmail, setAssignEmail] = useState('')
  const [assignPassword, setAssignPassword] = useState('')
  const [assignError, setAssignError] = useState('')
  const [assignLoading, setAssignLoading] = useState(false)


  // Reset submission confirmation
  const [resetModal, setResetModal] = useState<Project | null>(null)
  const [resetLoading, setResetLoading] = useState(false)

  // Delete user confirmation
  const [deleteUserModal, setDeleteUserModal] = useState<Project | null>(null)
  const [deleteUserLoading, setDeleteUserLoading] = useState(false)

  // Excel preview modal
  const [previewModal, setPreviewModal] = useState<Project | null>(null)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  async function handleTemplateUpload(file: File) {
    setTemplateMsg('')
    setTemplateLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/template', { method: 'POST', body: fd })
    const data = await res.json()
    setTemplateLoading(false)
    setTemplateMsg(res.ok ? `Plantilla "${data.fileName}" cargada correctamente.` : (data.error || 'Error al cargar.'))
    if (res.ok) startTransition(() => router.refresh())
  }

  function openAssignModal(project: Project) {
    setAssignModal(project)
    setAssignEmail(project.assigned_email ?? '')
    setAssignPassword('')
    setAssignError('')
  }

  async function handleResetSubmission() {
    if (!resetModal) return
    setResetLoading(true)
    const res = await fetch('/api/admin/reset-submission?projectId=' + resetModal.id, {
      method: 'DELETE',
    })
    setResetLoading(false)
    if (!res.ok) {
      alert('Error al reiniciar envío')
      return
    }
    setResetModal(null)
    startTransition(() => router.refresh())
  }

  async function handleDeleteUser() {
    if (!deleteUserModal) return
    setDeleteUserLoading(true)
    const res = await fetch('/api/admin/delete-user?projectId=' + deleteUserModal.id, {
      method: 'DELETE',
    })
    setDeleteUserLoading(false)
    if (!res.ok) {
      alert('Error al eliminar usuario')
      return
    }
    setDeleteUserModal(null)
    startTransition(() => router.refresh())
  }

  async function handleAssignSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!assignModal) return
    setAssignError('')
    setAssignLoading(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: assignEmail, password: assignPassword, projectId: assignModal.id }),
    })
    const data = await res.json()
    setAssignLoading(false)
    if (!res.ok) { setAssignError(data.error || 'Error.'); return }
    setAssignModal(null)
    startTransition(() => router.refresh())
  }

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.clave.toLowerCase().includes(search.toLowerCase()) ||
      p.titulo.toLowerCase().includes(search.toLowerCase()) ||
      (p.assigned_email ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all' ||
      (filter === 'submitted' && p.submitted) ||
      (filter === 'pending' && !p.submitted)
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-xs font-bold text-white">F</div>
            <div>
              <p className="text-sm font-semibold leading-tight">FECTI – Administrador</p>
              <p className="text-xs opacity-70 hidden sm:block">{adminEmail}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            {manageUsersUrl && (
              <a
                href={manageUsersUrl}
                className="text-xs font-medium opacity-90 hover:opacity-100 transition-opacity"
              >
                Gestionar administradores
              </a>
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

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard value={projects.length} label="Proyectos totales" dark />
          <StatCard value={totalSubmitted} label="Archivos subidos" accent />
          <StatCard value={projects.length - totalSubmitted} label="Pendientes" />
          <StatCard
            value={`${Math.round((totalSubmitted / projects.length) * 100)}%`}
            label="Completado"
          />
        </div>

        {/* Template management */}
        <div className="bg-card border border-border rounded-lg p-5 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-1">Plantilla Excel</h2>
          <p className="text-xs text-muted-foreground mb-3">
            {templatePathname
              ? 'Hay una plantilla activa. Puedes reemplazarla subiendo un nuevo archivo.'
              : 'Aún no hay plantilla. Sube un archivo .xls o .xlsx para que los beneficiarios puedan descargarlo.'}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => templateRef.current?.click()}
              disabled={templateLoading}
              className="bg-primary text-primary-foreground text-xs font-medium px-4 py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {templateLoading ? 'Subiendo...' : templatePathname ? 'Reemplazar plantilla' : 'Subir plantilla'}
            </button>
            {templatePathname && (
              <a
                href="/api/template"
                className="text-xs text-accent hover:underline"
                target="_blank"
              >
                Descargar actual
              </a>
            )}
            <input
              ref={templateRef}
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleTemplateUpload(f) }}
            />
          </div>
          {templateMsg && (
            <p className={`text-xs mt-2 ${templateMsg.includes('correctamente') ? 'text-green-700' : 'text-destructive'}`}>
              {templateMsg}
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por clave, título o correo..."
            className="flex-1 border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            {(['all', 'submitted', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-2 rounded transition-colors font-medium ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {f === 'all' ? 'Todos' : f === 'submitted' ? 'Subidos' : 'Pendientes'}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary border-b border-border">
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">#</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Componente</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Clave / Título</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Correo asignado</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground">Estatus</th>
                  <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Fecha</th>
                  <th className="text-right px-3 py-3 text-xs font-semibold text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-secondary/30'}`}>
                    <td className="px-3 py-3 text-xs font-bold text-primary">{p.num}</td>
                    <td className="px-3 py-3 text-xs hidden sm:table-cell">
                      <span className="bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                        {p.componente}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-foreground max-w-xs">
                      <span className="font-mono text-[10px] text-muted-foreground block mb-0.5">{p.clave}</span>
                      <span className="line-clamp-2">{p.titulo}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {p.assigned_email ?? <span className="italic opacity-50">Sin asignar</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.submitted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {p.submitted ? 'Subido' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                      {p.uploaded_at
                        ? new Date(p.uploaded_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {!p.assigned_email && (
                          <button
                            onClick={() => openAssignModal(p)}
                            className="text-xs text-primary hover:underline"
                            title="Asignar nuevo usuario"
                          >
                            Asignar
                          </button>
                        )}
                        {p.assigned_email && !p.submitted && (
                          <button
                            onClick={() => setDeleteUserModal(p)}
                            className="text-xs text-red-600 hover:underline"
                            title="Reiniciar (eliminar usuario)"
                          >
                            Reiniciar
                          </button>
                        )}
                        {p.submitted && (
                          <>
                            <button
                              onClick={() => setPreviewModal(p)}
                              className="text-xs text-accent hover:underline"
                              title="Ver archivo editable"
                            >
                              Ver
                            </button>
                            <a
                              href={`/api/admin/download?projectId=${p.id}`}
                              className="text-xs text-accent hover:underline"
                              title="Descargar archivo"
                            >
                              Descargar
                            </a>
                            <button
                              onClick={() => setResetModal(p)}
                              className="text-xs text-red-600 hover:underline"
                              title="Reiniciar envío"
                            >
                              Reiniciar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No se encontraron proyectos.
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Mostrando {filtered.length} de {projects.length} proyectos
        </p>
      </main>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">Asignar acceso</h3>
            <p className="text-xs text-muted-foreground mb-4 text-pretty">
              <span className="font-mono text-accent">{assignModal.clave}</span> — {assignModal.titulo}
            </p>
            <form onSubmit={handleAssignSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Correo electrónico</label>
                <input
                  type="email"
                  value={assignEmail}
                  onChange={(e) => setAssignEmail(e.target.value)}
                  required
                  className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="beneficiario@ejemplo.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Contraseña</label>
                <input
                  type="text"
                  value={assignPassword}
                  onChange={(e) => setAssignPassword(e.target.value)}
                  required
                  className="w-full border border-input rounded px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Contraseña para el beneficiario"
                />
              </div>
              {assignError && (
                <p className="text-xs text-destructive bg-destructive/10 rounded px-3 py-2">{assignError}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAssignModal(null)}
                  className="flex-1 border border-border text-foreground text-sm py-2 rounded hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={assignLoading}
                  className="flex-1 bg-primary text-primary-foreground text-sm py-2 rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {assignLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Submission Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">Reiniciar envío</h3>
            <p className="text-xs text-muted-foreground mb-4">
              ¿Estás seguro de que deseas reiniciar el envío de este proyecto? Se eliminará el archivo actual y volverá a mostrar como pendiente.
            </p>
            <p className="text-xs text-pretty mb-4">
              <span className="font-mono text-accent">{resetModal.clave}</span> — {resetModal.titulo}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setResetModal(null)}
                className="flex-1 border border-border text-foreground text-sm py-2 rounded hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetSubmission}
                disabled={resetLoading}
                className="flex-1 bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {resetLoading ? 'Reiniciando...' : 'Reiniciar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-sm font-semibold text-foreground mb-1">Eliminar usuario</h3>
            <p className="text-xs text-muted-foreground mb-4">
              ¿Estás seguro de que deseas eliminar el usuario asignado a este proyecto?
            </p>
            <p className="text-xs text-pretty mb-4">
              <span className="font-mono text-accent">{deleteUserModal.clave}</span> — {deleteUserModal.titulo}
              <br />
              <span className="text-xs opacity-75">{deleteUserModal.assigned_email}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteUserModal(null)}
                className="flex-1 border border-border text-foreground text-sm py-2 rounded hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteUserLoading}
                className="flex-1 bg-red-600 text-white text-sm py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteUserLoading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Excel Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-2 py-2">
          <div className="bg-card border border-border rounded-lg shadow-2xl w-full h-full max-w-6xl flex flex-col">
            {/* Modal Header */}
            <div className="bg-primary text-primary-foreground p-4 flex-shrink-0 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{previewModal.clave}</h3>
                <p className="text-xs opacity-75">{previewModal.titulo}</p>
              </div>
              <button
                onClick={() => setPreviewModal(null)}
                className="text-white hover:bg-white/20 p-2 rounded transition-colors"
                title="Cerrar"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - Excel Preview */}
            <div className="flex-1 overflow-hidden">
              <ExcelPreviewInline projectId={previewModal.id} />
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        FECTI &copy; 2025 &mdash; Panel de administración
      </footer>
    </div>
  )
}

function StatCard({
  value,
  label,
  dark,
  accent,
}: {
  value: number | string
  label: string
  dark?: boolean
  accent?: boolean
}) {
  const bg = dark ? 'bg-primary text-primary-foreground' : accent ? 'bg-accent text-white' : 'bg-secondary text-foreground'
  return (
    <div className={`${bg} rounded-lg p-4 shadow-sm`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-75">{label}</p>
    </div>
  )
}
