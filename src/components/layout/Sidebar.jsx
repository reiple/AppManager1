import { useState } from 'react'
import './Sidebar.css'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)

  const menuItems = [
    { id: 1, label: 'Dashboard', icon: '📊' },
    { id: 2, label: 'Applications', icon: '📦' },
    { id: 3, label: 'Settings', icon: '⚙️' },
    { id: 4, label: 'Analytics', icon: '📈' },
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
          <h2>Manager</h2>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
              <li key={item.id}>
                <a href="#" className="nav-link">
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}
