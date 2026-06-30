import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Sidebar.css'

export function Sidebar({ isOpen, onToggle }) {
  const { t } = useTranslation()
  const location = useLocation()

  const menuItems = [
    { id: 1, labelKey: 'common.dashboard', icon: '📊', path: '/' },
    { id: 2, labelKey: 'common.applications', icon: '📦', path: '/applications' },
    { id: 3, labelKey: 'common.logs', icon: '📋', path: '/logs' },
    { id: 4, labelKey: 'common.monitoring', icon: '📈', path: '/monitoring' },
    { id: 5, labelKey: 'common.objectStorage', icon: '🗄️', path: '/object-storage' },
    { id: 6, labelKey: 'common.settings', icon: '⚙️', path: '/settings' },
  ]

  return (
    <>
      {/* Mobile backdrop — closes sidebar when tapped outside */}
      {isOpen && <div className="sidebar-backdrop" onClick={onToggle} />}

      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{t('common.appName')}</h2>
          <button
            className="sidebar-collapse-btn"
            onClick={onToggle}
            aria-label="Close sidebar"
          >
            ‹
          </button>
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
