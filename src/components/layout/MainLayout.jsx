import { Sidebar } from './Sidebar'
import { Header } from './Header'
import './MainLayout.css'

export function MainLayout({ children }) {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  )
}
