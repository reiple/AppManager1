import { useTranslation } from 'react-i18next'
import './Header.css'

export function Header() {
  const { i18n, t } = useTranslation()

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'JD'
  }

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ]

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>{t('common.appName')}</h1>
        </div>

        <div className="header-controls">
          <div className="language-selector">
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="language-dropdown"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="header-user">
            <div className="user-avatar">{user.avatar}</div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
