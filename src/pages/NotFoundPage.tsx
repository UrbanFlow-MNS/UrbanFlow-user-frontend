import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[hsl(0_0%_97%)]">
      <div className="text-center max-w-sm">
        <p className="text-6xl font-semibold text-primary tracking-tight">404</p>
        <h1 className="text-2xl font-semibold text-foreground mt-3 tracking-tight">
          {t('not_found.title')}
        </h1>
        <Button asChild className="mt-6 h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to="/">
            <ArrowLeft size={16} />
            {t('not_found.back_home')}
          </Link>
        </Button>
      </div>
    </main>
  )
}

export default NotFoundPage
