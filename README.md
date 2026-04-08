# FECTI Beneficiarios 2025

Plataforma de reporteo para beneficiarios del **Fondo Estatal de Ciencia, Tecnología e Innovación (FECTI) 2025**, operada por el **Instituto de Innovación y Competitividad (I2C)** del Gobierno del Estado de Chihuahua.

## Descripción

Sistema web que permite a los beneficiarios de los 62 proyectos aprobados del FECTI 2025 subir sus reportes financieros en formato Excel, y a los administradores del I2C revisar, descargar y dar seguimiento al avance de entrega por componente.

### Componentes del FECTI

| Clave | Componente | Proyectos |
|-------|-----------|-----------|
| C01-INFRA | Infraestructura | 15 |
| C02-IBA | Investigación Básica y Aplicada | 15 |
| C03-FT | Formación de Talento | 12 |
| C04-IYE | Innovación y Emprendimiento | 20 |

### Funcionalidades

- **Panel de administración** — Gestión de usuarios beneficiarios, asignación de credenciales, descarga de archivos, vista previa de Excel en línea, métricas de avance.
- **Portal de beneficiarios** — Login por proyecto, carga de archivo Excel (.xls/.xlsx), reemplazo de entregas previas.
- **Métricas** — Dashboard con gráficas de dona, barras horizontales y tablas por componente: tasa de entrega, montos, actividad reciente.
- **Gestión de administradores** — Crear y eliminar cuentas admin (restringido al superadmin).

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router, Turbopack) |
| Base de datos | [Neon](https://neon.tech) PostgreSQL (serverless) |
| Almacenamiento | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (privado) |
| Autenticación | Cookies HTTP-only firmadas con HMAC-SHA256 |
| Hashing | bcryptjs (cost 10–12) |
| UI | Tailwind CSS + Radix UI + componentes shadcn/ui |
| Excel preview | [Handsontable](https://handsontable.com) v12.4.0 (CDN) |
| Deploy | [Vercel](https://vercel.com) |

## Requisitos previos

- Node.js ≥ 18
- pnpm (recomendado) o npm
- Cuenta en Neon (PostgreSQL)
- Cuenta en Vercel (Blob Storage + Deploy)

## Instalación local

```bash
git clone https://github.com/I2Cprogramacion/FECTI-BENEFICIARIOS-2025.git
cd FECTI-BENEFICIARIOS-2025
pnpm install
```

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
DATABASE_URL=postgresql://...          # Connection string de Neon
SESSION_SECRET=<hex-64-chars>          # Secreto HMAC para firmar cookies de sesión
MIGRATION_KEY=<clave-secreta>          # Clave requerida para ejecutar migraciones
BLOB_READ_WRITE_TOKEN=vercel_blob_...  # Token de Vercel Blob (se configura automáticamente en Vercel)
```

> **Importante:** Estas mismas variables deben estar configuradas en **Vercel → Settings → Environment Variables**.

## Ejecución

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
app/
  admin/         → Páginas del panel administrativo
  api/           → API Routes (auth, archivos, admin, métricas)
  login/         → Página de login genérica
  proyectos/     → Páginas de proyectos para beneficiarios
components/      → Componentes React (dashboard, formularios, UI)
lib/
  auth.ts        → Sesiones firmadas con HMAC-SHA256
  db.ts          → Conexión lazy a Neon PostgreSQL
  rate-limit.ts  → Rate limiter in-memory para login
  utils.ts       → Utilidades generales
```

## Seguridad

- Cookies de sesión firmadas con HMAC-SHA256 (`crypto.timingSafeEqual`)
- Rate limiting (10 intentos/min por IP) en endpoints de login
- Validación de propiedad de archivos (IDOR protection)
- Endpoints de migración protegidos con sesión admin + clave secreta
- Errores sanitizados — sin filtración de información interna
- Flags de cookie: `httpOnly`, `secure`, `sameSite`, `maxAge: 8h`

## Licencia

[BSD 3-Clause](LICENSE) — Copyright © 2025 Gobierno del Estado de Chihuahua, Instituto de Innovación y Competitividad (I2C).
