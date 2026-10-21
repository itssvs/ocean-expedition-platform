import { Contours } from './ui'

// Shared split layout for the Login and Register pages.
export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-deep lg:block">
        <Contours className="absolute inset-0 h-full w-full" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="h-9 w-9" aria-hidden="true">
              <circle cx="16" cy="16" r="15" fill="#12293a" stroke="#3fe0cf" strokeWidth="1.5" />
              <path d="M5 18c3-4 5-4 8 0s5 4 8 0 4-3 6-1" fill="none" stroke="#3fe0cf" strokeWidth="2" strokeLinecap="round" />
              <circle cx="16" cy="9" r="2.2" fill="#f4a63c" />
            </svg>
            <span className="font-display text-2xl font-semibold text-foam">OceanOps</span>
          </div>
          <div className="max-w-md">
            <h2 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-foam">
              One logbook for every voyage.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-mist">
              Plan expeditions, assign vessels and instruments, and keep every sampling station in one place.
            </p>
          </div>
          <p className="text-sm text-mist/70">Oceanographic research expedition management</p>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-foam">{title}</h1>
          <p className="mb-8 mt-1.5 text-sm text-mist">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
