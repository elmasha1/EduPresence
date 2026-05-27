import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GraduationCap, Plus, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'

const schema = z.object({
  name: z.string().min(2, 'Nom trop court').max(120),
  level: z.string().max(60).optional().or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
})

export default function Classes() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = closed, {} = create, {id,...} = edit
  const [deleting, setDeleting] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/classrooms')
      setItems(data.data ?? data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    try {
      await api.delete(`/classrooms/${deleting.id}`)
      toast.success('Classe supprimée.')
      setDeleting(null)
      load()
    } catch {
      toast.error('Suppression impossible.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Mes classes</h1>
          <p className="mt-1 text-sm text-ink-600">Organisez vos groupes d'élèves.</p>
        </div>
        <Button onClick={() => setEditing({})}>
          <Plus size={16} /> Nouvelle classe
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon={GraduationCap}
            title="Aucune classe pour l'instant"
            description="Créez votre première classe pour commencer à ajouter des élèves."
            action={<Button onClick={() => setEditing({})}><Plus size={16} /> Créer une classe</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <Card key={c.id} className="p-5 transition hover:shadow-card">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                  <GraduationCap size={18} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(c)}
                    className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => setDeleting(c)}
                    className="rounded-lg p-1.5 text-ink-500 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink-900">{c.name}</h3>
              {c.level && <p className="text-xs text-ink-500">{c.level}</p>}
              {c.description && <p className="mt-2 text-sm text-ink-600 line-clamp-2">{c.description}</p>}
              <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs">
                <span className="text-ink-500">Élèves</span>
                <span className="font-semibold text-ink-900">{c.students_count ?? 0}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ClassroomFormModal
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load() }}
      />

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Supprimer cette classe ?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleting(null)}>Annuler</Button>
            <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          <strong className="text-ink-900">{deleting?.name}</strong> sera supprimée définitivement.
          Tous les élèves et les présences associées seront également supprimés.
        </p>
      </Modal>
    </div>
  )
}

function ClassroomFormModal({ item, onClose, onSaved }) {
  const open = item !== null
  const isEdit = !!item?.id
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (open) {
      reset({
        name: item?.name ?? '',
        level: item?.level ?? '',
        description: item?.description ?? '',
      })
    }
  }, [open, item, reset])

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      if (isEdit) {
        await api.put(`/classrooms/${item.id}`, values)
        toast.success('Classe mise à jour.')
      } else {
        await api.post('/classrooms', values)
        toast.success('Classe créée.')
      }
      onSaved()
    } catch (err) {
      const fieldErrors = err.response?.data?.errors
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([f, m]) => setError(f, { message: m[0] }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Modifier la classe' : 'Nouvelle classe'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSubmit(onSubmit)} loading={submitting}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Nom de la classe" placeholder="Mathématiques CM2" error={errors.name?.message} {...register('name')} />
        <Input label="Niveau" placeholder="Primaire, Collège, ..." error={errors.level?.message} {...register('level')} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-800">Description</label>
          <textarea
            rows={3}
            className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ink-900/10 focus:border-ink-900"
            placeholder="Notes ou objectifs de la classe…"
            {...register('description')}
          />
          {errors.description && <span className="mt-1 block text-xs text-red-600">{errors.description.message}</span>}
        </div>
      </form>
    </Modal>
  )
}
