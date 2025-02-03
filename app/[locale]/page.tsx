import { useTranslations } from 'next-intl'
import LocaleSwitcher from '../components/LocaleSwitcher'

export default function HomePage() {
  const t = useTranslations('HomePage')
  return (
    <div>
      <h1>{t('title')}</h1>
      {/* <LocaleSwitcher /> */}
    </div>
  )
}
