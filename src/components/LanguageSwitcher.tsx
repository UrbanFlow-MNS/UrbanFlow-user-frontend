import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = i18n.language.startsWith('fr') ? 'fr' : 'en'

  return (
    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <button
        onClick={() => i18n.changeLanguage('fr')}
        className={cn(
          'px-2 py-1 rounded-md transition-colors',
          current === 'fr'
            ? 'text-primary bg-accent'
            : 'hover:text-foreground hover:bg-secondary',
        )}
      >
        FR
      </button>
      <span className="opacity-30">|</span>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={cn(
          'px-2 py-1 rounded-md transition-colors',
          current === 'en'
            ? 'text-primary bg-accent'
            : 'hover:text-foreground hover:bg-secondary',
        )}
      >
        EN
      </button>
    </div>
  )
}
