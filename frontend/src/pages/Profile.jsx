import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Mon profil</h1>
        <p className="mt-1 text-sm text-ink-600">Informations de votre compte enseignant.</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink-900 text-xl font-semibold text-white">
            {(user?.name || '?').slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-semibold text-ink-900">{user?.name}</p>
            <p className="text-sm text-ink-600">{user?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Nom complet" value={user?.name} />
          <Field label="Adresse email" value={user?.email} />
          <Field
            label="Membre depuis"
            value={user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
          />
          <Field label="Identifiant" value={`#${user?.id}`} />
        </div>
      </Card>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-ink-50/40 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink-900">{value || '—'}</p>
    </div>
  )
}
