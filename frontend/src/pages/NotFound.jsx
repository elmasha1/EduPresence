import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-bold tracking-tight text-ink-900">404</p>
      <h1 className="mt-3 text-lg font-semibold text-ink-900">Page introuvable</h1>
      <p className="mt-1 text-sm text-ink-600">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link to="/" className="mt-6">
        <Button>Retour au tableau de bord</Button>
      </Link>
    </div>
  )
}
