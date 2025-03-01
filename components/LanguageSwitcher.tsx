import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

const LanguageSwitcher = () => {
  const router = useRouter()
  const { i18n } = useTranslation()

  const changeLanguage = (locale: string) => {
    router.push(router.pathname, router.asPath, { locale })
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${
          i18n.language === 'en'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('zh')}
        className={`px-2 py-1 rounded ${
          i18n.language === 'zh'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-700'
        }`}
      >
        中文
      </button>
    </div>
  )
}

export default LanguageSwitcher 