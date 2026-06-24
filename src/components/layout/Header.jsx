import './Header.css'

export function Header() {
  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'JD'
  }

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>Application Manager</h1>
        </div>

        <div className="header-user">
          <div className="user-avatar">{user.avatar}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
