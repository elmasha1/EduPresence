import { useEffect, useMemo, useState } from 'react'
import {
  ClipboardCheck,
  Save,
  CheckCircle2,
  UserX,
  Clock,
  Users,
  ChevronDown,
  IdCard,
  Mail,
  Cake,
  GraduationCap,
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { cn } from '../utils/cn'

const STATUSES = [
  { value: 'present', label: 'Présent', icon: CheckCircle2, tone: 'bg-emerald-600 text-white', toneSubtle: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  { value: 'absent', label: 'Absent', icon: UserX, tone: 'bg-red-600 text-white', toneSubtle: 'bg-red-50 text-red-700 ring-red-200' },
  { value: 'late', label: 'Retard', icon: Clock, tone: 'bg-amber-600 text-white', toneSubtle: 'bg-amber-50 text-amber-700 ring-amber-200' },
]

const today = () => new Date().toISOString().slice(0, 10)

const calcAge = (dateStr) => {
  if (!dateStr) return null
  const birth = new Date(dateStr)
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

const formatDateFr = (dateStr) => {
  if (!dateStr) return null
  const d = new Date(dateStr)
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString('fr-FR')
}

export default function Attendance() {
  const [classrooms, setClassrooms] = useState([])
  const [classroomId, setClassroomId] = useState('')
  const [date, setDate] = useState(today())
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [existing, setExisting] = useState(false)
  const [note, setNote] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    api.get('/classrooms').then(({ data }) => {
      const list = data.data ?? data
      setClassrooms(list)
      if (list.length > 0 && !classroomId) setClassroomId(String(list[0].id))
    })
  }, [])

  useEffect(() => {
    if (!classroomId) return
    setLoading(true)
    setExpandedId(null)
    Promise.all([
      api.get('/students', { params: { classroom_id: classroomId, per_page: 100 } }),
      api.get('/attendances/lookup', { params: { classroom_id: classroomId, date } }),
    ])
      .then(([studentsRes, lookupRes]) => {
        const list = studentsRes.data.data
        setStudents(list)
        const existingAttendance = lookupRes.data?.data ?? lookupRes.data
        if (existingAttendance) {
          setExisting(true)
          setNote(existingAttendance.note ?? '')
          const map = {}
          existingAttendance.records.forEach((r) => { map[r.student_id] = r.status })
          list.forEach((s) => { if (!map[s.id]) map[s.id] = 'present' })
          setRecords(map)
        } else {
          setExisting(false)
          setNote('')
          const map = {}
          list.forEach((s) => { map[s.id] = 'present' })
          setRecords(map)
        }
      })
      .finally(() => setLoading(false))
  }, [classroomId, date])

  const counts = useMemo(() => {
    const c = { present: 0, absent: 0, late: 0 }
    Object.values(records).forEach((v) => { if (c[v] !== undefined) c[v]++ })
    return c
  }, [records])

  const markAll = (status) => {
    const map = {}
    students.forEach((s) => { map[s.id] = status })
    setRecords(map)
  }

  const save = async () => {
    if (students.length === 0) return
    setSaving(true)
    try {
      await api.post('/attendances', {
        classroom_id: Number(classroomId),
        date,
        note: note || null,
        records: students.map((s) => ({ student_id: s.id, status: records[s.id] || 'present' })),
      })
      toast.success(existing ? 'Présences mises à jour.' : 'Présences enregistrées.')
      setExisting(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Échec de l\'enregistrement.'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  if (classrooms.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={ClipboardCheck}
          title="Créez d'abord une classe"
          description="Vous devez créer au moins une classe avant de pointer les présences."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Faire l'appel</h1>
        <p className="mt-1 text-sm text-ink-600">Sélectionnez une classe et une date. Cliquez sur un élève pour voir sa fiche.</p>
      </div>

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-800">Classe</label>
            <select
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-900"
            >
              {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-800">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-900"
            />
          </div>
          <div className="flex items-end">
            <div className="flex flex-wrap gap-1.5 w-full">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => markAll(s.value)}
                  className={cn(
                    'flex-1 rounded-lg px-2 py-1.5 text-xs font-medium ring-1 transition',
                    s.toneSubtle,
                    'hover:opacity-80'
                  )}
                >
                  Tous : {s.label.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        {existing && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800 ring-1 ring-amber-200">
            Une feuille de présence existe déjà pour cette date — vos modifications la remplaceront.
          </p>
        )}
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : students.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Aucun élève dans cette classe"
            description="Les élèves sont gérés via le seeder ou via l'API. Aucun élève n'est encore rattaché à cette classe."
          />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="divide-y divide-ink-100">
              {students.map((s) => {
                const current = records[s.id] || 'present'
                const isOpen = expandedId === s.id
                const age = calcAge(s.birth_date)
                const classroomName =
                  s.classroom?.name ?? classrooms.find((c) => String(c.id) === String(classroomId))?.name

                return (
                  <div key={s.id} className="hover:bg-ink-50/40 transition">
                    {/* Main row */}
                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isOpen ? null : s.id)}
                        className="flex items-center gap-3 min-w-0 flex-1 text-left rounded-lg -mx-1 px-1 py-1 hover:bg-ink-100/40"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-700">
                          {s.first_name[0]}{s.last_name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-ink-900 truncate">{s.full_name}</span>
                            <ChevronDown
                              size={14}
                              className={cn('text-ink-400 transition-transform', isOpen && 'rotate-180')}
                            />
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-500">
                            {s.national_id && (
                              <span className="inline-flex items-center gap-1 font-mono">
                                <IdCard size={11} />{s.national_id}
                              </span>
                            )}
                            {age !== null && (
                              <span className="inline-flex items-center gap-1">
                                <Cake size={11} />{age} ans
                              </span>
                            )}
                            {s.email && (
                              <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                                <Mail size={11} />{s.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                      <div className="flex gap-1.5">
                        {STATUSES.map((opt) => {
                          const active = current === opt.value
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setRecords((r) => ({ ...r, [s.id]: opt.value }))}
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition',
                                active ? opt.tone : 'bg-white text-ink-700 ring-1 ring-ink-200 hover:bg-ink-50'
                              )}
                            >
                              <opt.icon size={13} />
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isOpen && (
                      <div className="bg-ink-50/60 border-t border-ink-100 px-5 py-4 animate-fade-in">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <DetailField icon={Users} label="Nom complet" value={s.full_name} />
                          <DetailField icon={IdCard} label="CIN" value={s.national_id} mono />
                          <DetailField icon={GraduationCap} label="Classe" value={classroomName} />
                          <DetailField icon={Cake} label="Date de naissance" value={formatDateFr(s.birth_date)} />
                          <DetailField icon={Cake} label="Âge" value={age !== null ? `${age} ans` : null} />
                          <DetailField icon={Mail} label="Email" value={s.email} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-ink-800">Note (optionnel)</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Observations sur la séance…"
                className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-900"
              />
            </Card>
            <Card className="p-5 flex flex-col justify-between">
              <div className="grid grid-cols-3 gap-2 text-center">
                <SummaryStat label="Présents" value={counts.present} tone="text-emerald-700" />
                <SummaryStat label="Absents" value={counts.absent} tone="text-red-700" />
                <SummaryStat label="Retards" value={counts.late} tone="text-amber-700" />
              </div>
              <Button onClick={save} loading={saving} className="mt-4 w-full">
                <Save size={16} /> {existing ? 'Mettre à jour' : 'Enregistrer'}
              </Button>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function DetailField({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-500">
        <Icon size={12} />
        {label}
      </div>
      <p className={cn('mt-0.5 text-sm text-ink-900', mono && 'font-mono')}>
        {value || <span className="text-ink-400">—</span>}
      </p>
    </div>
  )
}

function SummaryStat({ label, value, tone }) {
  return (
    <div>
      <p className={cn('text-2xl font-semibold', tone)}>{value}</p>
      <p className="text-xs text-ink-500">{label}</p>
    </div>
  )
}
