import { useTranslation } from 'react-i18next'
import './Dashboard.css'

export function Dashboard() {
  const { t } = useTranslation()

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{t('dashboard.title')}</h2>
        <p>{t('dashboard.subtitle')}</p>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>{t('dashboard.totalApplications')}</h3>
          </div>
          <div className="card-content">
            <div className="stat-value">12</div>
            <div className="stat-label">{t('dashboard.activeApplications')}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>{t('dashboard.systemStatus')}</h3>
          </div>
          <div className="card-content">
            <div className="stat-value status-ok">●</div>
            <div className="stat-label">{t('dashboard.allSystemsOperational')}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>{t('dashboard.recentDeployments')}</h3>
          </div>
          <div className="card-content">
            <div className="stat-value">3</div>
            <div className="stat-label">{t('dashboard.lastSevenDays')}</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>{t('dashboard.users')}</h3>
          </div>
          <div className="card-content">
            <div className="stat-value">48</div>
            <div className="stat-label">{t('dashboard.totalUsers')}</div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3>{t('dashboard.recentActivity')}</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-time">2 {t('dashboard.hoursAgo')}</div>
            <div className="activity-text">{t('dashboard.appDeploymentCompleted')}</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">5 {t('dashboard.hoursAgo')}</div>
            <div className="activity-text">{t('dashboard.userAdded')}</div>
          </div>
          <div className="activity-item">
            <div className="activity-time">1 {t('dashboard.daysAgo')}</div>
            <div className="activity-text">{t('dashboard.systemBackupCompleted')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
