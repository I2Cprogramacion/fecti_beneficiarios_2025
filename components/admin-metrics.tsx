'use client'

import { useRouter } from 'next/navigation'

interface ComponentMetric {
  componente: string
  total: number
  submitted: number
  pending: number
  progress: number
  monto_total: number
  monto_entregado: number
}

interface UserAssignment {
  total_projects: number
  assigned: number
  unassigned: number
  pending_password_change: number
}

interface RecentActivityItem {
  uploaded_at: string
  file_name: string
  clave: string
  titulo: string
  componente: string
}

interface Financial {
  monto_total_aprobado: number
  monto_con_entrega: number
  monto_pendiente: number
  total_projects: number
  total_submitted: number
}

interface AdminMetricsProps {
  componentMetrics: ComponentMetric[]
  userAssignment: UserAssignment
  recentActivity: RecentActivityItem[]
  financial: Financial
  adminEmail: string
}

const COMPONENTE_LABELS: Record<string, string> = {
  'C01-INFRA': 'Infraestructura',
  'C02-IBA': 'Investigación Básica y Aplicada',
  'C03-FT': 'Formación de Talento',
  'C04-IYE': 'Innovación y Emprendimiento',
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

function formatMoneyFull(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(n)
}

export function AdminMetrics({
  componentMetrics,
  userAssignment,
  recentActivity,
  financial,
  adminEmail,
}: AdminMetricsProps) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  const completionPercent = financial.total_projects > 0
    ? Math.round((financial.total_submitted / financial.total_projects) * 100)
    : 0

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center text-xs font-bold text-white">F</div>
            <div>
              <p className="text-sm font-semibold leading-tight">FECTI – Métricas</p>
              <p className="text-xs opacity-70 hidden sm:block">{adminEmail}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="/admin/dashboard"
              className="text-xs font-medium opacity-90 hover:opacity-100 transition-opacity"
            >
              ← Panel principal
            </a>
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
        {/* Resumen financiero */}
        <h2 className="text-lg font-bold text-foreground mb-4">Resumen General</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
          <MetricCard
            value={formatMoney(financial.monto_total_aprobado)}
            label="Monto total aprobado"
            className="bg-primary text-primary-foreground col-span-2 lg:col-span-1"
          />
          <MetricCard
            value={formatMoney(financial.monto_con_entrega)}
            label="Monto con entrega"
            className="bg-green-600 text-white"
          />
          <MetricCard
            value={formatMoney(financial.monto_pendiente)}
            label="Monto pendiente"
            className="bg-amber-500 text-white"
          />
          <MetricCard
            value={`${financial.total_submitted} / ${financial.total_projects}`}
            label="Proyectos entregados"
            className="bg-accent text-white"
          />
          <MetricCard
            value={`${completionPercent}%`}
            label="Avance global"
            className="bg-secondary text-foreground"
          />
        </div>

        {/* Estado de asignación */}
        <h2 className="text-lg font-bold text-foreground mb-4">Estado de Asignaciones</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <MetricCard
            value={userAssignment.assigned}
            label="Usuarios asignados"
            className="bg-green-50 text-green-800 border border-green-200"
          />
          <MetricCard
            value={userAssignment.unassigned}
            label="Sin usuario asignado"
            className="bg-amber-50 text-amber-800 border border-amber-200"
          />
          <MetricCard
            value={userAssignment.pending_password_change}
            label="Pendientes de cambiar contraseña"
            className="bg-blue-50 text-blue-800 border border-blue-200"
          />
          <MetricCard
            value={`${userAssignment.total_projects > 0 ? Math.round((userAssignment.assigned / userAssignment.total_projects) * 100) : 0}%`}
            label="Cobertura de asignación"
            className="bg-secondary text-foreground"
          />
        </div>

        {/* Avance por componente */}
        <h2 className="text-lg font-bold text-foreground mb-4">Avance por Componente</h2>
        <div className="grid gap-4 mb-8">
          {componentMetrics.map((c) => (
            <div key={c.componente} className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                <div>
                  <span className="inline-block bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded text-xs mr-2">
                    {c.componente}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {COMPONENTE_LABELS[c.componente] || c.componente}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1 sm:mt-0">
                  {formatMoneyFull(Number(c.monto_total))} aprobado
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-secondary rounded-full h-4 mb-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Number(c.progress)}%`,
                    background: Number(c.progress) === 100
                      ? '#16a34a'
                      : Number(c.progress) >= 50
                        ? '#2563eb'
                        : '#f59e0b',
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className="text-foreground font-semibold">{Number(c.progress)}% completado</span>
                <span className="text-green-700">
                  ✓ {c.submitted} entregado{c.submitted !== 1 ? 's' : ''}
                </span>
                <span className="text-amber-700">
                  ◷ {c.pending} pendiente{c.pending !== 1 ? 's' : ''}
                </span>
                <span className="text-muted-foreground">
                  {c.total} proyecto{c.total !== 1 ? 's' : ''}
                </span>
                <span className="text-muted-foreground hidden sm:inline">
                  | {formatMoney(Number(c.monto_entregado))} con entrega
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Distribución de monto por componente */}
        <h2 className="text-lg font-bold text-foreground mb-4">Distribución de Monto por Componente</h2>
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Componente</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Proyectos</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Monto Aprobado</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">% del Total</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Monto con Entrega</th>
              </tr>
            </thead>
            <tbody>
              {componentMetrics.map((c, i) => {
                const pctOfTotal = financial.monto_total_aprobado > 0
                  ? ((Number(c.monto_total) / Number(financial.monto_total_aprobado)) * 100).toFixed(1)
                  : '0'
                return (
                  <tr key={c.componente} className={`border-b border-border last:border-0 ${i % 2 === 0 ? '' : 'bg-secondary/30'}`}>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-semibold text-primary">{c.componente}</span>
                      <span className="text-muted-foreground ml-2 hidden lg:inline">{COMPONENTE_LABELS[c.componente]}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-right font-mono">{c.total}</td>
                    <td className="px-4 py-3 text-xs text-right font-mono">{formatMoneyFull(Number(c.monto_total))}</td>
                    <td className="px-4 py-3 text-xs text-right font-mono hidden sm:table-cell">{pctOfTotal}%</td>
                    <td className="px-4 py-3 text-xs text-right font-mono hidden md:table-cell">{formatMoneyFull(Number(c.monto_entregado))}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-secondary font-semibold">
                <td className="px-4 py-3 text-xs">Total</td>
                <td className="px-4 py-3 text-xs text-right font-mono">{financial.total_projects}</td>
                <td className="px-4 py-3 text-xs text-right font-mono">{formatMoneyFull(Number(financial.monto_total_aprobado))}</td>
                <td className="px-4 py-3 text-xs text-right font-mono hidden sm:table-cell">100%</td>
                <td className="px-4 py-3 text-xs text-right font-mono hidden md:table-cell">{formatMoneyFull(Number(financial.monto_con_entrega))}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Actividad reciente */}
        <h2 className="text-lg font-bold text-foreground mb-4">Actividad Reciente</h2>
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden mb-8">
          {recentActivity.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Aún no hay entregas registradas.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentActivity.map((a, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-700 text-xs">✓</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-primary font-semibold">{a.clave}</span>
                      <span className="bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded text-[10px]">
                        {a.componente}
                      </span>
                    </div>
                    <p className="text-xs text-foreground mt-0.5 line-clamp-1">{a.titulo}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {a.file_name}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(a.uploaded_at).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(a.uploaded_at).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        FECTI &copy; 2025 &mdash; Métricas del sistema
      </footer>
    </div>
  )
}

function MetricCard({
  value,
  label,
  className = '',
}: {
  value: number | string
  label: string
  className?: string
}) {
  return (
    <div className={`rounded-lg p-4 shadow-sm ${className}`}>
      <p className="text-xl font-bold leading-tight">{value}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  )
}
