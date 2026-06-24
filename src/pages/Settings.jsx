import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './Settings.css'

export function Settings() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState({
    appName: 'Application Manager',
    refreshInterval: 30,
    enableNotifications: true,
    enableAutoRestart: false,
    maintenanceMode: false,
    logRetention: 7,
  })

  const [savedMessage, setSavedMessage] = useState(false)

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  const handleReset = () => {
    setSettings({
      appName: 'Application Manager',
      refreshInterval: 30,
      enableNotifications: true,
      enableAutoRestart: false,
      maintenanceMode: false,
      logRetention: 7,
    })
  }

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>{t('settings.title')}</h2>
        <p>{t('settings.subtitle')}</p>
      </div>

      {savedMessage && <div className="success-message">{t('settings.settingsSavedSuccessfully')}</div>}

      <div className="settings-container">
        <div className="settings-section">
          <h3>{t('settings.generalSettings')}</h3>

          <div className="setting-group">
            <label htmlFor="appName">{t('settings.applicationName')}</label>
            <input
              id="appName"
              type="text"
              value={settings.appName}
              onChange={(e) => handleChange('appName', e.target.value)}
              placeholder={t('settings.enterApplicationName')}
            />
            <small>{t('settings.nameDisplayedInHeader')}</small>
          </div>

          <div className="setting-group">
            <label htmlFor="refreshInterval">{t('settings.refreshInterval')}</label>
            <input
              id="refreshInterval"
              type="number"
              min="10"
              max="300"
              value={settings.refreshInterval}
              onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
            />
            <small>{t('settings.refreshIntervalRange')}</small>
          </div>

          <div className="setting-group">
            <label htmlFor="logRetention">{t('settings.logRetention')}</label>
            <input
              id="logRetention"
              type="number"
              min="1"
              max="90"
              value={settings.logRetention}
              onChange={(e) => handleChange('logRetention', parseInt(e.target.value))}
            />
            <small>{t('settings.logRetentionRange')}</small>
          </div>
        </div>

        <div className="settings-section">
          <h3>{t('settings.features')}</h3>

          <div className="setting-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleChange('enableNotifications', e.target.checked)}
              />
              {t('settings.enableNotifications')}
            </label>
            <small>{t('settings.getAlertsForErrors')}</small>
          </div>

          <div className="setting-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.enableAutoRestart}
                onChange={(e) => handleChange('enableAutoRestart', e.target.checked)}
              />
              {t('settings.enableAutoRestart')}
            </label>
            <small>{t('settings.automaticallyRestartFailed')}</small>
          </div>

          <div className="setting-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              />
              {t('settings.maintenanceMode')}
            </label>
            <small>{t('settings.restrictAccessDuringMaintenance')}</small>
          </div>
        </div>

        <div className="settings-section">
          <h3>{t('settings.dangerZone')}</h3>

          <div className="danger-action">
            <div>
              <h4>{t('settings.clearAllLogs')}</h4>
              <p>{t('settings.permanentlyDeleteLogs')}</p>
            </div>
            <button className="btn btn-danger">{t('settings.clearLogs')}</button>
          </div>

          <div className="danger-action">
            <div>
              <h4>{t('settings.resetSettings')}</h4>
              <p>{t('settings.resetSettingsToDefault')}</p>
            </div>
            <button className="btn btn-danger" onClick={handleReset}>
              {t('settings.reset')}
            </button>
          </div>

          <div className="danger-action">
            <div>
              <h4>{t('settings.exportConfiguration')}</h4>
              <p>{t('settings.downloadConfiguration')}</p>
            </div>
            <button className="btn btn-primary">{t('settings.export')}</button>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-primary btn-large" onClick={handleSave}>
            {t('settings.saveSettings')}
          </button>
          <button className="btn btn-secondary btn-large" onClick={handleReset}>
            {t('settings.resetToDefault')}
          </button>
        </div>
      </div>

      <div className="settings-info">
        <h3>{t('settings.currentConfiguration')}</h3>
        <pre className="config-preview">{JSON.stringify(settings, null, 2)}</pre>
      </div>
    </div>
  )
}
