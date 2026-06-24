import { useState } from 'react'
import './Settings.css'

export function Settings() {
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
        <h2>Settings</h2>
        <p>Configure the application manager</p>
      </div>

      {savedMessage && <div className="success-message">Settings saved successfully!</div>}

      <div className="settings-container">
        <div className="settings-section">
          <h3>General Settings</h3>

          <div className="setting-group">
            <label htmlFor="appName">Application Name</label>
            <input
              id="appName"
              type="text"
              value={settings.appName}
              onChange={(e) => handleChange('appName', e.target.value)}
              placeholder="Enter application name"
            />
            <small>The name displayed in the header</small>
          </div>

          <div className="setting-group">
            <label htmlFor="refreshInterval">Refresh Interval (seconds)</label>
            <input
              id="refreshInterval"
              type="number"
              min="10"
              max="300"
              value={settings.refreshInterval}
              onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
            />
            <small>How often to refresh metrics and logs (10-300 seconds)</small>
          </div>

          <div className="setting-group">
            <label htmlFor="logRetention">Log Retention (days)</label>
            <input
              id="logRetention"
              type="number"
              min="1"
              max="90"
              value={settings.logRetention}
              onChange={(e) => handleChange('logRetention', parseInt(e.target.value))}
            />
            <small>How long to keep logs before automatic deletion (1-90 days)</small>
          </div>
        </div>

        <div className="settings-section">
          <h3>Features</h3>

          <div className="setting-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => handleChange('enableNotifications', e.target.checked)}
              />
              Enable Notifications
            </label>
            <small>Get alerts for errors and warnings</small>
          </div>

          <div className="setting-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.enableAutoRestart}
                onChange={(e) => handleChange('enableAutoRestart', e.target.checked)}
              />
              Enable Auto-Restart
            </label>
            <small>Automatically restart failed applications</small>
          </div>

          <div className="setting-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              />
              Maintenance Mode
            </label>
            <small>Restrict access during maintenance</small>
          </div>
        </div>

        <div className="settings-section">
          <h3>Danger Zone</h3>

          <div className="danger-action">
            <div>
              <h4>Clear All Logs</h4>
              <p>Permanently delete all application logs</p>
            </div>
            <button className="btn btn-danger">Clear Logs</button>
          </div>

          <div className="danger-action">
            <div>
              <h4>Reset Settings</h4>
              <p>Reset all settings to default values</p>
            </div>
            <button className="btn btn-danger" onClick={handleReset}>
              Reset
            </button>
          </div>

          <div className="danger-action">
            <div>
              <h4>Export Configuration</h4>
              <p>Download current configuration as JSON</p>
            </div>
            <button className="btn btn-primary">Export</button>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn btn-primary btn-large" onClick={handleSave}>
            Save Settings
          </button>
          <button className="btn btn-secondary btn-large" onClick={handleReset}>
            Reset to Default
          </button>
        </div>
      </div>

      <div className="settings-info">
        <h3>Current Configuration</h3>
        <pre className="config-preview">{JSON.stringify(settings, null, 2)}</pre>
      </div>
    </div>
  )
}
