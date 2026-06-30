import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import './MainLayout.css'

export function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => setSidebarOpen(prev => !prev)

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <main className="main-content">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  )
}
