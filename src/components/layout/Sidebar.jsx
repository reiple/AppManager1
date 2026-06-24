import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Sidebar.css'

export function Sidebar() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()

  const menuItems = [
    { id: 1, labelKey: 'common.dashboard', icon: '📊', path: '/' },
    { id: 2, labelKey: 'common.applications', icon: '📦', path: '/applications' },
    { id: 3, labelKey: 'common.logs', icon: '📋', path: '/logs' },
    { id: 4, labelKey: 'common.monitoring', icon: '📈', path: '/monitoring' },
    { id: 5, labelKey: 'common.settings', icon: '⚙️', path: '/settings' },
  ]

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>{t('common.appName')}</h2>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="label">{t(item.labelKey)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
