import { useTranslation } from 'react-i18next'
import logo from '@/assets/logo.png'

function HomePage() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <img src={logo} alt={t('common.app_name')} className="w-32 h-32 object-contain" />
      <h1 className="text-4xl font-semibold text-primary">{t('common.app_name')}</h1>
      <p className="text-muted-foreground">{t('home.welcome')}</p>
    </main>
  )
}

export default HomePage
