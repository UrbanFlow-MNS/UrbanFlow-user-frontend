import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { Header } from '@/components/Header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function LineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[hsl(0_0%_97%)]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 pt-10 sm:pt-14">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/lines')}
          className="mb-6 -ml-2 h-9 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} />
          {t('lines.back')}
        </Button>

        <div
          className={cn(
            'bg-white rounded-2xl px-5 py-8 text-center',
            'border border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
          )}
        >
          <p className="text-sm font-semibold text-foreground">{t('lines.detail_placeholder_title')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('lines.detail_placeholder_subtitle', { id })}
          </p>
        </div>
      </main>
    </div>
  )
}

export default LineDetailPage
