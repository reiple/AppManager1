import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './Logs.css'

export function Logs() {
  const { t } = useTranslation()
  const [selectedApp, setSelectedApp] = useState('all')
  const [logLevel, setLogLevel] = useState('all')
  const [logs, setLogs] = useState([
    {
      id: 1,
      timestamp: '2026-06-25 14:32:45',
      app: 'User Service',
      level: 'INFO',
      message: 'User login successful for user ID: 12345',
    },
    {
      id: 2,
      timestamp: '2026-06-25 14:31:20',
      app: 'Order Service',
      level: 'ERROR',
      message: 'Database connection timeout after 30 seconds',
    },
    {
      id: 3,
      timestamp: '2026-06-25 14:30:15',
      app: 'User Service',
      level: 'WARN',
      message: 'High memory usage detected: 85% of allocated memory',
    },
    {
      id: 4,
      timestamp: '2026-06-25 14:29:50',
      app: 'Notification Service',
      level: 'INFO',
      message: 'Email notification sent to user@example.com',
    },
    {
      id: 5,
      timestamp: '2026-06-25 14:28:30',
      app: 'Payment Service',
      level: 'INFO',
      message: 'Payment processed successfully for order #9876',
    },
    {
      id: 6,
      timestamp: '2026-06-25 14:27:15',
      app: 'Order Service',
      level: 'ERROR',
      message: 'Failed to process order: Invalid product ID',
    },
    {
      id: 7,
      timestamp: '2026-06-25 14:26:00',
      app: 'User Service',
      level: 'INFO',
      message: 'User profile updated successfully',
    },
    {
      id: 8,
      timestamp: '2026-06-25 14:25:45',
      app: 'Notification Service',
      level: 'WARN',
      message: 'SMTP connection unstable, retrying...',
    },
  ])

  const apps = ['all', 'User Service', 'Order Service', 'Payment Service', 'Notification Service']
  const levels = ['all', 'INFO', 'WARN', 'ERROR', 'DEBUG']

  const filteredLogs = logs.filter(log => {
    const appMatch = selectedApp === 'all' || log.app === selectedApp
    const levelMatch = logLevel === 'all' || log.level === logLevel
    return appMatch && levelMatch
  })

  const getLevelColor = (level) => {
    const colors = {
      INFO: '#17a2b8',
      WARN: '#ffc107',
      ERROR: '#dc3545',
      DEBUG: '#6c757d',
    }
    return colors[level] || '#6c757d'
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  return (
    <div className="logs-page">
      <div className="page-header">
        <h2>{t('logs.title')}</h2>
        <p>{t('logs.subtitle')}</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>{t('logs.application')}</label>
          <select value={selectedApp} onChange={(e) => setSelectedApp(e.target.value)}>
            {apps.map(app => (
              <option key={app} value={app}>
                {app === 'all' ? t('logs.allApplications') : app}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>{t('logs.logLevel')}</label>
          <select value={logLevel} onChange={(e) => setLogLevel(e.target.value)}>
            {levels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? t('logs.allLevels') : level}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-danger" onClick={handleClearLogs}>
          {t('logs.clearLogs')}
        </button>
      </div>

      <div className="logs-container">
        <div className="logs-info">
          {t('logs.showing')} {filteredLogs.length} {t('logs.of')} {logs.length} {t('logs.logs')}
        </div>

        <div className="logs-list">
          {filteredLogs.length > 0 ? (
            filteredLogs.map(log => (
              <div key={log.id} className="log-entry">
                <div className="log-timestamp">{log.timestamp}</div>
                <div className="log-app">{log.app}</div>
                <div
                  className="log-level"
                  style={{ backgroundColor: getLevelColor(log.level), color: 'white' }}
                >
                  {log.level}
                </div>
                <div className="log-message">{log.message}</div>
              </div>
            ))
          ) : (
            <div className="no-logs">{t('logs.noLogs')}</div>
          )}
        </div>
      </div>
    </div>
  )
}
