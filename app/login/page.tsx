import LoginForm from '@/components/login-form'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">FECTI</h1>
          <p className="text-slate-600">Fondo Especial de Ciencia y Tecnología e Innovación</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
