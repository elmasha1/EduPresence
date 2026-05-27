import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ClipboardCheck } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      await login(values)
      toast.success('Connexion réussie !')
      navigate('/', { replace: true })
    } catch (err) {
      const fieldErrors = err.response?.data?.errors
      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, msgs]) =>
          setError(field, { message: msgs[0] })
        )
      } else {
        toast.error('Échec de la connexion.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-ink-50 to-ink-100">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white">
            <ClipboardCheck size={18} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink-900">EduPresence</span>
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
          <h1 className="text-xl font-semibold text-ink-900">Bon retour</h1>
          <p className="mt-1 text-sm text-ink-600">Connectez-vous pour gérer vos classes.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Adresse email"
              type="email"
              autoComplete="email"
              placeholder="teacher@edupresence.test"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Se connecter
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-600">
            Pas de compte ?{' '}
            <Link to="/register" className="font-medium text-ink-900 hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-ink-500">
          Démo : <code className="font-mono">teacher@edupresence.test</code> / <code className="font-mono">password</code>
        </p>
      </div>
    </div>
  )
}
