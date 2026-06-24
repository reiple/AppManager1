import './Dashboard.css'

export function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <p>Welcome to Application Manager</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>Total Applications</h3>
          </div>
          <div className="card-content">
            <div className="stat-value">12</div>
            <div className="stat-label">Active applications</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>System Status</h3>
          </div>
          <div className="card-content">
            <div className="stat-value status-ok">●</div>
            <div className="stat-label">All systems operational</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Recent Deployments</h3>
          </div>
          <div className="card-content">
            <div className="stat-value">3</div>
            <div className="stat-label">Last 7 days</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Users</h3>
          </div>
          <div className="card-content">
            <div className="stat-value">48</div>
            <div className="stat-label">Total users</div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-time">2 hours ago</div>
            <div className="activity-text">App deployment completed</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">5 hours ago</div>
            <div className="activity-text">User John Doe added to system</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">1 day ago</div>
            <div className="activity-text">System backup completed</div>
          </div>
        </div>
      </div>
    </div>
  )
}
