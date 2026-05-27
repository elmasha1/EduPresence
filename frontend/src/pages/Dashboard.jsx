import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  TrendingUp,
  UserX,
  Clock,
  CheckCircle2,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react'
import api from '../services/api'
import Card from '../components/ui/Card'
import Spinner from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  }

  const cards = [
    {
      label: 'Total élèves',
      value: stats.total_students,
      icon: Users,
      hint: 'Tous vos élèves',
    },
    {
      label: 'Total classes',
      value: stats.total_classrooms,
      icon: GraduationCap,
      hint: 'Classes actives',
    },
    {
      label: "Absences aujourd'hui",
      value: stats.absent_today,
      icon: UserX,
      hint: stats.marked_today > 0 ? `${stats.marked_today} élèves pointés` : 'Aucun pointage aujourd\'hui',
      accent: stats.absent_today > 0 ? 'danger' : 'neutral',
    },
    {
      label: 'Taux de présence',
      value: `${stats.attendance_rate}%`,
      icon: TrendingUp,
      hint: `Absentéisme : ${stats.absence_rate}%`,
      accent: 'success',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Bonjour, {user?.name?.split(' ')[0] || 'Enseignant'} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-600">Voici un aperçu de votre journée.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{c.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">{c.value}</p>
                <p className="mt-1 text-xs text-ink-500">{c.hint}</p>
              </div>
              <div
                className={
                  c.accent === 'success'
                    ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700'
                    : c.accent === 'danger'
                    ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-700'
                    : 'flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-700'
                }
              >
                <c.icon size={18} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-ink-900">Pointage du jour</h2>
          <p className="mt-1 text-sm text-ink-600">Répartition des présences enregistrées aujourd'hui.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatLine icon={CheckCircle2} tone="success" label="Présents" value={stats.present_today} />
            <StatLine icon={UserX} tone="danger" label="Absents" value={stats.absent_today} />
            <StatLine icon={Clock} tone="warning" label="Retards" value={stats.late_today} />
          </div>
          <Link
            to="/presences"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-ink-900 hover:underline"
          >
            Pointer une classe <ArrowRight size={14} />
          </Link>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-ink-900">Actions rapides</h2>
          <div className="mt-4 space-y-2">
            <QuickAction to="/classes" label="Gérer mes classes" icon={GraduationCap} />
            <QuickAction to="/presences" label="Faire l'appel" icon={ClipboardCheck} />
          </div>
        </Card>
      </div>
    </div>
  )
}

function StatLine({ icon: Icon, tone, label, value }) {
  const tones = {
    success: 'bg-emerald-50 text-emerald-700',
    danger: 'bg-red-50 text-red-700',
    warning: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className="rounded-xl border border-ink-100 bg-ink-50/50 p-4">
      <div className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={15} />
      </div>
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold text-ink-900">{value}</p>
    </div>
  )
}

function QuickAction({ to, label, icon: Icon }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2.5 text-sm font-medium text-ink-800 hover:border-ink-300 hover:bg-ink-50 transition"
    >
      <span className="flex items-center gap-2"><Icon size={15} className="text-ink-500" /> {label}</span>
      <ArrowRight size={14} className="text-ink-400" />
    </Link>
  )
}
