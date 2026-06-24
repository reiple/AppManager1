import { useState } from 'react'
import './ApplicationManagement.css'

export function ApplicationManagement() {
  const [applications, setApplications] = useState([
    {
      id: 1,
      name: 'User Service',
      port: 8081,
      status: 'running',
      uptime: '45 days',
      memory: '256 MB',
      cpu: '12%',
    },
    {
      id: 2,
      name: 'Order Service',
      port: 8082,
      status: 'running',
      uptime: '23 days',
      memory: '512 MB',
      cpu: '28%',
    },
    {
      id: 3,
      name: 'Payment Service',
      port: 8083,
      status: 'stopped',
      uptime: '0 days',
      memory: '0 MB',
      cpu: '0%',
    },
    {
      id: 4,
      name: 'Notification Service',
      port: 8084,
      status: 'running',
      uptime: '10 days',
      memory: '128 MB',
      cpu: '5%',
    },
  ])

  const handleStart = (id) => {
    setApplications(apps =>
      apps.map(app =>
        app.id === id ? { ...app, status: 'running', uptime: '1 hour' } : app
      )
    )
  }

  const handleStop = (id) => {
    setApplications(apps =>
      apps.map(app =>
        app.id === id ? { ...app, status: 'stopped', uptime: '0 days', memory: '0 MB', cpu: '0%' } : app
      )
    )
  }

  const getStatusColor = (status) => {
    return status === 'running' ? '#28a745' : '#dc3545'
  }

  return (
    <div className="app-management">
      <div className="page-header">
        <h2>Application Management</h2>
        <p>Manage and monitor your Spring Boot applications</p>
      </div>

      <div className="apps-table-container">
        <table className="apps-table">
          <thead>
            <tr>
              <th>Application Name</th>
              <th>Port</th>
              <th>Status</th>
              <th>Uptime</th>
              <th>Memory</th>
              <th>CPU</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td className="app-name">{app.name}</td>
                <td>{app.port}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(app.status) }}>
                    {app.status.toUpperCase()}
                  </span>
                </td>
                <td>{app.uptime}</td>
                <td>{app.memory}</td>
                <td>{app.cpu}</td>
                <td className="actions">
                  {app.status === 'running' ? (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleStop(app.id)}
                    >
                      Stop
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={() => handleStart(app.id)}
                    >
                      Start
                    </button>
                  )}
                  <button className="btn btn-info">Logs</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary">
        <div className="summary-item">
          <div className="summary-label">Running</div>
          <div className="summary-value">{applications.filter(a => a.status === 'running').length}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Stopped</div>
          <div className="summary-value">{applications.filter(a => a.status === 'stopped').length}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Total</div>
          <div className="summary-value">{applications.length}</div>
        </div>
      </div>
    </div>
  )
}
