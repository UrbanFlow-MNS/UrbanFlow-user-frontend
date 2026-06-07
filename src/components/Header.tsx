import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAuth } from '@/hooks/useAuth'
import logo from '@/assets/logo.png'

export function Header() {
  const { t } = useTranslation()
  const { isAuthenticated, login } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt={t('common.app_name')} className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-base font-semibold text-foreground tracking-tight">
            {t('common.app_name')}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {!isAuthenticated && (
            <Button
              onClick={login}
              size="sm"
              className="h-9 rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_2px_8px_rgba(105,18,226,0.25)]"
            >
              <LogIn size={14} />
              {t('header.sign_in')}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
