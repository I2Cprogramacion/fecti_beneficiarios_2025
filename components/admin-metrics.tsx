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

interface InactiveProject {
  clave: string
  titulo: string
  componente: string
  monto: number
  assigned_email: string
  user_created_at: string
  days_since_assigned: number
}

interface DailySubmission {
  date: string
  count: number
}

interface ResponseTime {
  avg_days: number
  min_days: number
  max_days: number
  total_with_both: number
}

interface AmountRange {
  rango: string
  total: number
  submitted: number
  monto_total: number
}

interface AdminMetricsProps {
  componentMetrics: ComponentMetric[]
  userAssignment: UserAssignment
  recentActivity: RecentActivityItem[]
  financial: Financial
  inactiveProjects: InactiveProject[]
  dailySubmissions: DailySubmission[]
  responseTime: ResponseTime
  amountDistribution: AmountRange[]
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

const COMPONENTE_COLORS: Record<string, string> = {
  'C01-INFRA': '#2563eb',
  'C02-IBA': '#7c3aed',
  'C03-FT': '#059669',
  'C04-IYE': '#d97706',
}

function DonutChart({ percentage, size = 120, stroke = 12, color = '#2563eb' }: { percentage: number; size?: number; stroke?: number; color?: string }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-secondary" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
    </svg>
  )
}

export function AdminMetrics({
  componentMetrics,
  userAssignment,
  recentActivity,
  financial,
  inactiveProjects,
  dailySubmissions,
  responseTime,
  amountDistribution,
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

  const assignmentPercent = userAssignment.total_projects > 0
    ? Math.round((userAssignment.assigned / userAssignment.total_projects) * 100)
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
        {/* ═══════ RESUMEN GENERAL CON DONUTS ═══════ */}
        <h2 className="text-lg font-bold text-foreground mb-4">Resumen General</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Donut: Avance de entregas */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex items-center gap-5">
            <div className="relative shrink-0">
              <DonutChart percentage={completionPercent} color="#16a34a" />
              <div className="absolute inset-0 flex items-center justify-center rotate-90">
                <span className="text-2xl font-bold text-foreground">{completionPercent}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-2">Avance de Entregas</p>
              <p className="text-xs text-green-700">✓ {financial.total_submitted} entregados</p>
              <p className="text-xs text-amber-700">◷ {financial.total_projects - financial.total_submitted} pendientes</p>
              <p className="text-xs text-muted-foreground mt-1">{financial.total_projects} proyectos totales</p>
            </div>
          </div>

          {/* Donut: Asignación de usuarios */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex items-center gap-5">
            <div className="relative shrink-0">
              <DonutChart percentage={assignmentPercent} color="#2563eb" />
              <div className="absolute inset-0 flex items-center justify-center rotate-90">
                <span className="text-2xl font-bold text-foreground">{assignmentPercent}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-2">Cobertura de Asignación</p>
              <p className="text-xs text-blue-700">✓ {userAssignment.assigned} asignados</p>
              <p className="text-xs text-amber-700">◷ {userAssignment.unassigned} sin asignar</p>
              <p className="text-xs text-muted-foreground mt-1">{userAssignment.pending_password_change} pendientes de cambiar contraseña</p>
            </div>
          </div>

          {/* Resumen financiero */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
            <p className="text-sm font-bold text-foreground mb-3">Resumen Financiero</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total aprobado</span>
                <span className="font-mono font-bold text-foreground">{formatMoney(financial.monto_total_aprobado)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-700">Con entrega</span>
                <span className="font-mono font-semibold text-green-700">{formatMoney(financial.monto_con_entrega)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-amber-700">Pendiente</span>
                <span className="font-mono font-semibold text-amber-700">{formatMoney(financial.monto_pendiente)}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden mt-1">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${financial.monto_total_aprobado > 0 ? (Number(financial.monto_con_entrega) / Number(financial.monto_total_aprobado)) * 100 : 0}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground text-right">
                {financial.monto_total_aprobado > 0 ? `${((Number(financial.monto_con_entrega) / Number(financial.monto_total_aprobado)) * 100).toFixed(1)}% del presupuesto con entrega` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* ═══════ AVANCE POR COMPONENTE: BARRAS + TABLA ═══════ */}
        <h2 className="text-lg font-bold text-foreground mb-4">Avance por Componente</h2>
        <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-8">
          {/* Barras horizontales */}
          <div className="space-y-3 mb-6">
            {componentMetrics.map((c) => {
              const pct = c.total > 0 ? (c.submitted / c.total) * 100 : 0
              const color = COMPONENTE_COLORS[c.componente] || '#6b7280'
              return (
                <div key={c.componente} className="flex items-center gap-3">
                  <div className="w-24 shrink-0">
                    <span className="text-xs font-bold" style={{ color }}>{c.componente}</span>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-secondary rounded-full h-7 overflow-hidden relative">
                      <div className="h-full rounded-full transition-all duration-500 flex items-center px-2" style={{ width: `${Math.max(pct, 3)}%`, background: color, minWidth: pct > 0 ? '32px' : '0' }}>
                        {pct > 12 && <span className="text-white text-[10px] font-bold">{Math.round(pct)}%</span>}
                      </div>
                      {pct <= 12 && pct > 0 && <span className="absolute text-[10px] font-bold text-foreground" style={{ left: `calc(${Math.max(pct, 3)}% + 6px)`, top: '50%', transform: 'translateY(-50%)' }}>{Math.round(pct)}%</span>}
                      {pct === 0 && <span className="absolute text-[10px] font-bold text-muted-foreground left-2 top-1/2 -translate-y-1/2">0%</span>}
                    </div>
                  </div>
                  <div className="w-36 text-right shrink-0 hidden sm:block">
                    <span className="text-xs text-muted-foreground font-mono">{c.submitted}/{c.total} · {formatMoney(Number(c.monto_total))}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tabla detallada */}
          <div className="border-t border-border pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-2 text-xs font-semibold text-muted-foreground">Componente</th>
                  <th className="text-center pb-2 text-xs font-semibold text-muted-foreground">Proyectos</th>
                  <th className="text-center pb-2 text-xs font-semibold text-muted-foreground">Entregados</th>
                  <th className="text-center pb-2 text-xs font-semibold text-muted-foreground">Pendientes</th>
                  <th className="text-right pb-2 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Monto Aprobado</th>
                  <th className="text-right pb-2 text-xs font-semibold text-muted-foreground hidden md:table-cell">Monto con Entrega</th>
                  <th className="text-right pb-2 text-xs font-semibold text-muted-foreground hidden lg:table-cell">% del Total</th>
                </tr>
              </thead>
              <tbody>
                {componentMetrics.map((c, i) => {
                  const pctOfTotal = financial.monto_total_aprobado > 0 ? ((Number(c.monto_total) / Number(financial.monto_total_aprobado)) * 100).toFixed(1) : '0'
                  return (
                    <tr key={c.componente} className={`border-b border-border last:border-0 ${i % 2 !== 0 ? 'bg-secondary/30' : ''}`}>
                      <td className="py-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: COMPONENTE_COLORS[c.componente] || '#6b7280' }} />
                          <span className="font-semibold">{c.componente}</span>
                          <span className="text-muted-foreground hidden lg:inline">– {COMPONENTE_LABELS[c.componente]}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-xs text-center font-mono">{c.total}</td>
                      <td className="py-2.5 text-xs text-center"><span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">{c.submitted}</span></td>
                      <td className="py-2.5 text-xs text-center"><span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-mono">{c.pending}</span></td>
                      <td className="py-2.5 text-xs text-right font-mono hidden sm:table-cell">{formatMoneyFull(Number(c.monto_total))}</td>
                      <td className="py-2.5 text-xs text-right font-mono hidden md:table-cell">{formatMoneyFull(Number(c.monto_entregado))}</td>
                      <td className="py-2.5 text-xs text-right font-mono hidden lg:table-cell">{pctOfTotal}%</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr className="font-semibold bg-secondary/50">
                  <td className="py-2.5 text-xs">Total</td>
                  <td className="py-2.5 text-xs text-center font-mono">{financial.total_projects}</td>
                  <td className="py-2.5 text-xs text-center font-mono">{financial.total_submitted}</td>
                  <td className="py-2.5 text-xs text-center font-mono">{financial.total_projects - financial.total_submitted}</td>
                  <td className="py-2.5 text-xs text-right font-mono hidden sm:table-cell">{formatMoneyFull(Number(financial.monto_total_aprobado))}</td>
                  <td className="py-2.5 text-xs text-right font-mono hidden md:table-cell">{formatMoneyFull(Number(financial.monto_con_entrega))}</td>
                  <td className="py-2.5 text-xs text-right font-mono hidden lg:table-cell">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ═══════ TIEMPO DE RESPUESTA + ENTREGAS POR DÍA (LADO A LADO) ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Tiempo de respuesta */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-5 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Tiempo de Respuesta</h2>
              <p className="text-xs text-muted-foreground">Días entre asignación de usuario y entrega</p>
            </div>
            <div className="p-5">
              {responseTime.total_with_both > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <p className="text-2xl font-bold text-foreground">{responseTime.avg_days}</p>
                    <p className="text-xs text-muted-foreground">Promedio</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-700">{responseTime.min_days}</p>
                    <p className="text-xs text-muted-foreground">Más rápido</p>
                  </div>
                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-700">{responseTime.max_days}</p>
                    <p className="text-xs text-muted-foreground">Más lento</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">Aún no hay datos suficientes.</p>
              )}
              <p className="text-[10px] text-muted-foreground text-center mt-3">
                Basado en {responseTime.total_with_both} entrega{responseTime.total_with_both !== 1 ? 's' : ''} con usuario asignado
              </p>
            </div>
          </div>

          {/* Entregas por día - gráfico */}
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-5 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Entregas por Día</h2>
              <p className="text-xs text-muted-foreground">
                {dailySubmissions.length > 0
                  ? `${dailySubmissions.reduce((s, d) => s + d.count, 0)} entregas en ${dailySubmissions.length} día${dailySubmissions.length !== 1 ? 's' : ''}`
                  : 'Sin entregas aún'}
              </p>
            </div>
            <div className="p-5">
              {dailySubmissions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Aún no hay entregas registradas.</p>
              ) : (
                <>
                  <div className="flex items-end gap-[3px] h-36">
                    {(() => {
                      const maxCount = Math.max(...dailySubmissions.map(d => d.count))
                      return dailySubmissions.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 min-w-0 group relative">
                          <span className="text-[9px] font-mono text-foreground font-bold opacity-70 group-hover:opacity-100">{d.count}</span>
                          <div className="w-full rounded-t transition-all duration-300 group-hover:opacity-80 min-h-[3px]" style={{ height: `${(d.count / maxCount) * 100}%`, background: 'linear-gradient(to top, #2563eb, #60a5fa)' }} />
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {new Date(d.date + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}: {d.count}
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                  <div className="flex gap-[3px] mt-1">
                    {dailySubmissions.map((d, i) => (
                      <div key={i} className="flex-1 text-center min-w-0">
                        <span className="text-[8px] text-muted-foreground font-mono block truncate">
                          {new Date(d.date + 'T12:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ═══════ DISTRIBUCIÓN POR RANGO DE MONTO ═══════ */}
        <h2 className="text-lg font-bold text-foreground mb-4">Distribución por Rango de Monto</h2>
        <div className="bg-card border border-border rounded-lg shadow-sm mb-8 p-5">
          {/* Barras visuales */}
          <div className="space-y-3 mb-5">
            {amountDistribution.map((r, i) => {
              const barColors = ['#2563eb', '#7c3aed', '#059669', '#d97706']
              const maxTotal = Math.max(...amountDistribution.map(a => a.total))
              return (
                <div key={r.rango} className="flex items-center gap-3">
                  <div className="w-28 text-xs font-semibold text-foreground shrink-0">{r.rango}</div>
                  <div className="flex-1">
                    <div className="w-full bg-secondary rounded-full h-7 overflow-hidden relative">
                      <div className="h-full rounded-full transition-all duration-500 flex items-center px-2" style={{ width: `${maxTotal > 0 ? (r.total / maxTotal) * 100 : 0}%`, background: barColors[i % barColors.length], minWidth: r.total > 0 ? '32px' : '0' }}>
                        <span className="text-white text-[10px] font-bold">{r.total}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-32 text-right shrink-0 hidden sm:block">
                    <span className="text-xs text-green-700 font-mono">{r.submitted}/{r.total}</span>
                    <span className="text-xs text-muted-foreground"> · </span>
                    <span className="text-xs text-muted-foreground font-mono">{formatMoney(Number(r.monto_total))}</span>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Tabla detalle */}
          <table className="w-full text-sm border-t border-border">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 pt-3 text-xs font-semibold text-muted-foreground">Rango</th>
                <th className="text-center pb-2 pt-3 text-xs font-semibold text-muted-foreground">Proyectos</th>
                <th className="text-center pb-2 pt-3 text-xs font-semibold text-muted-foreground">Entregados</th>
                <th className="text-center pb-2 pt-3 text-xs font-semibold text-muted-foreground">% Avance</th>
                <th className="text-right pb-2 pt-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {amountDistribution.map((r, i) => (
                <tr key={r.rango} className={`border-b border-border last:border-0 ${i % 2 !== 0 ? 'bg-secondary/30' : ''}`}>
                  <td className="py-2.5 text-xs font-semibold">{r.rango}</td>
                  <td className="py-2.5 text-xs text-center font-mono">{r.total}</td>
                  <td className="py-2.5 text-xs text-center"><span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-mono">{r.submitted}</span></td>
                  <td className="py-2.5 text-xs text-center font-mono">{r.total > 0 ? `${Math.round((r.submitted / r.total) * 100)}%` : '—'}</td>
                  <td className="py-2.5 text-xs text-right font-mono hidden sm:table-cell">{formatMoneyFull(Number(r.monto_total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ═══════ PROYECTOS SIN ACTIVIDAD ═══════ */}
        <h2 className="text-lg font-bold text-foreground mb-1">
          Proyectos Sin Actividad
          {inactiveProjects.length > 0 && (
            <span className="ml-2 text-xs font-normal bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {inactiveProjects.length} alerta{inactiveProjects.length !== 1 ? 's' : ''}
            </span>
          )}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Usuarios asignados que aún no han subido su archivo</p>
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden mb-8">
          {inactiveProjects.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              🎉 Todos los usuarios asignados han entregado su archivo.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Proyecto</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Correo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Componente</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Monto</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Días</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground">Semáforo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactiveProjects.map((p, i) => {
                      const isUrgent = p.days_since_assigned >= 14
                      const isWarning = p.days_since_assigned >= 7
                      return (
                        <tr key={p.clave} className={`border-b border-border last:border-0 ${i % 2 !== 0 ? 'bg-secondary/30' : ''}`}>
                          <td className="px-4 py-3 text-xs max-w-xs">
                            <span className="font-mono text-[10px] text-muted-foreground block">{p.clave}</span>
                            <span className="line-clamp-1">{p.titulo}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{p.assigned_email}</td>
                          <td className="px-4 py-3 text-xs hidden sm:table-cell">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ background: COMPONENTE_COLORS[p.componente] || '#6b7280' }}>{p.componente}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-right font-mono hidden lg:table-cell">{formatMoney(Number(p.monto))}</td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs font-mono font-bold">{p.days_since_assigned}d</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block w-4 h-4 rounded-full ${isUrgent ? 'bg-red-500' : isWarning ? 'bg-amber-400' : 'bg-blue-400'}`} title={isUrgent ? 'Urgente (≥14 días)' : isWarning ? 'Atención (≥7 días)' : 'Reciente (<7 días)'} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 bg-secondary/50 border-t border-border flex gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> ≥14 días (urgente)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> ≥7 días (atención)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" /> &lt;7 días (reciente)</span>
              </div>
            </>
          )}
        </div>

        {/* ═══════ ACTIVIDAD RECIENTE ═══════ */}
        <h2 className="text-lg font-bold text-foreground mb-4">Actividad Reciente</h2>
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden mb-8">
          {recentActivity.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Aún no hay entregas registradas.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Proyecto</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Componente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Archivo</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((a, i) => (
                    <tr key={i} className={`border-b border-border last:border-0 ${i % 2 !== 0 ? 'bg-secondary/30' : ''}`}>
                      <td className="px-4 py-3 text-xs max-w-xs">
                        <span className="font-mono text-[10px] text-primary font-semibold block">{a.clave}</span>
                        <span className="line-clamp-1 text-foreground">{a.titulo}</span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white" style={{ background: COMPONENTE_COLORS[a.componente] || '#6b7280' }}>{a.componente}</span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-muted-foreground hidden md:table-cell truncate max-w-[200px]">{a.file_name}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="text-xs text-foreground block">{new Date(a.uploaded_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        <span className="text-[10px] text-muted-foreground">{new Date(a.uploaded_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
