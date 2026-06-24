import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()

  const menuItems = [
    { id: 1, label: 'Dashboard', icon: '📊', path: '/' },
    { id: 2, label: 'Applications', icon: '📦', path: '/applications' },
    { id: 3, label: 'Logs', icon: '📋', path: '/logs' },
    { id: 4, label: 'Monitoring', icon: '📈', path: '/monitoring' },
    { id: 5, label: 'Settings', icon: '⚙️', path: '/settings' },
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
          <h2>AppManager</h2>
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
                  <span className="label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
