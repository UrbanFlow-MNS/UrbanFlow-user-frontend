import { useTranslation } from 'react-i18next'

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <h1 className="text-3xl font-semibold">{t('not_found.title')}</h1>
    </main>
  )
}

export default NotFoundPage
