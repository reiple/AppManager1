import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ApplicationManagement.css'

export function ApplicationManagement() {
  const { t } = useTranslation()

  const [applications, setApplications] = useState([
    {
      id: 1,
      nameKey: 'applications.userService',
      port: 8081,
      status: 'running',
      uptime: '45 days',
      memory: '256 MB',
      cpu: '12%',
    },
    {
      id: 2,
      nameKey: 'applications.orderService',
      port: 8082,
      status: 'running',
      uptime: '23 days',
      memory: '512 MB',
      cpu: '28%',
    },
    {
      id: 3,
      nameKey: 'applications.paymentService',
      port: 8083,
      status: 'stopped',
      uptime: '0 days',
      memory: '0 MB',
      cpu: '0%',
    },
    {
      id: 4,
      nameKey: 'applications.notificationService',
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

  const getStatusStyle = (status) => {
    return status === 'running'
      ? { background: 'rgba(0, 255, 136, 0.12)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)' }
      : { background: 'rgba(255, 0, 122, 0.12)', color: '#ff007a', border: '1px solid rgba(255, 0, 122, 0.3)' }
  }

  return (
    <div className="app-management">
      <div className="page-header">
        <h2>{t('applications.title')}</h2>
        <p>{t('applications.subtitle')}</p>
      </div>

      <div className="apps-table-container">
        <table className="apps-table">
          <thead>
            <tr>
              <th>{t('applications.applicationName')}</th>
              <th>{t('applications.port')}</th>
              <th>{t('applications.status')}</th>
              <th>{t('applications.uptime')}</th>
              <th>{t('applications.memory')}</th>
              <th>{t('applications.cpu')}</th>
              <th>{t('applications.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td className="app-name">{t(app.nameKey)}</td>
                <td>{app.port}</td>
                <td>
                  <span className="status-badge" style={getStatusStyle(app.status)}>
                    {app.status === 'running' ? t('applications.running') : t('applications.stopped')}
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
                      {t('applications.stop')}
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={() => handleStart(app.id)}
                    >
                      {t('applications.start')}
                    </button>
                  )}
                  <button className="btn btn-info">{t('applications.logs')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary">
        <div className="summary-item">
          <div className="summary-label">{t('applications.summaryRunning')}</div>
          <div className="summary-value">{applications.filter(a => a.status === 'running').length}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">{t('applications.summaryStopped')}</div>
          <div className="summary-value">{applications.filter(a => a.status === 'stopped').length}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">{t('applications.summaryTotal')}</div>
          <div className="summary-value">{applications.length}</div>
        </div>
      </div>
    </div>
  )
}
