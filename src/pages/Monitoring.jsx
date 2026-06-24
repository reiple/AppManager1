import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './Monitoring.css'

export function Monitoring() {
  const { t } = useTranslation()
  const [metrics, setMetrics] = useState([
    {
      id: 1,
      name: 'User Service',
      cpu: 12,
      memory: 45,
      diskUsage: 30,
      requestsPerMin: 150,
      errorRate: 0.5,
      avgResponseTime: 45,
    },
    {
      id: 2,
      name: 'Order Service',
      cpu: 28,
      memory: 62,
      diskUsage: 50,
      requestsPerMin: 200,
      errorRate: 1.2,
      avgResponseTime: 120,
    },
    {
      id: 3,
      name: 'Payment Service',
      cpu: 5,
      memory: 28,
      diskUsage: 15,
      requestsPerMin: 50,
      errorRate: 0.1,
      avgResponseTime: 200,
    },
    {
      id: 4,
      name: 'Notification Service',
      cpu: 8,
      memory: 32,
      diskUsage: 20,
      requestsPerMin: 100,
      errorRate: 0.8,
      avgResponseTime: 60,
    },
  ])

  const [systemMetrics, setSystemMetrics] = useState({
    totalCpu: 13,
    totalMemory: 42,
    totalDisk: 29,
    activeConnections: 500,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev =>
        prev.map(metric => ({
          ...metric,
          cpu: Math.max(5, Math.min(95, metric.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(20, Math.min(90, metric.memory + (Math.random() - 0.5) * 8)),
          requestsPerMin: Math.max(10, Math.min(300, metric.requestsPerMin + (Math.random() - 0.5) * 50)),
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getHealthStatus = (cpu, memory, errorRate) => {
    if (cpu > 80 || memory > 80 || errorRate > 5) return 'critical'
    if (cpu > 60 || memory > 60 || errorRate > 2) return 'warning'
    return 'healthy'
  }

  const getStatusColor = (status) => {
    const colors = {
      healthy: '#28a745',
      warning: '#ffc107',
      critical: '#dc3545',
    }
    return colors[status] || '#6c757d'
  }

  return (
    <div className="monitoring-page">
      <div className="page-header">
        <h2>{t('monitoring.title')}</h2>
        <p>{t('monitoring.subtitle')}</p>
      </div>

      <div className="system-overview">
        <div className="metric-card">
          <div className="metric-label">{t('monitoring.systemCpuUsage')}</div>
          <div className="metric-large">{systemMetrics.totalCpu.toFixed(1)}%</div>
          <div className="metric-bar">
            <div
              className="metric-bar-fill"
              style={{
                width: `${systemMetrics.totalCpu}%`,
                backgroundColor: systemMetrics.totalCpu > 80 ? '#dc3545' : systemMetrics.totalCpu > 60 ? '#ffc107' : '#28a745',
              }}
            ></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">{t('monitoring.systemMemoryUsage')}</div>
          <div className="metric-large">{systemMetrics.totalMemory.toFixed(1)}%</div>
          <div className="metric-bar">
            <div
              className="metric-bar-fill"
              style={{
                width: `${systemMetrics.totalMemory}%`,
                backgroundColor: systemMetrics.totalMemory > 80 ? '#dc3545' : systemMetrics.totalMemory > 60 ? '#ffc107' : '#28a745',
              }}
            ></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">{t('monitoring.diskUsage')}</div>
          <div className="metric-large">{systemMetrics.totalDisk.toFixed(1)}%</div>
          <div className="metric-bar">
            <div
              className="metric-bar-fill"
              style={{
                width: `${systemMetrics.totalDisk}%`,
                backgroundColor: systemMetrics.totalDisk > 80 ? '#dc3545' : systemMetrics.totalDisk > 60 ? '#ffc107' : '#28a745',
              }}
            ></div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">{t('monitoring.activeConnections')}</div>
          <div className="metric-large">{systemMetrics.activeConnections}</div>
          <div className="metric-description">{t('monitoring.connections')}</div>
        </div>
      </div>

      <div className="applications-metrics">
        <h3>{t('monitoring.applicationMetrics')}</h3>
        <div className="metrics-grid">
          {metrics.map(metric => {
            const status = getHealthStatus(metric.cpu, metric.memory, metric.errorRate)
            return (
              <div key={metric.id} className="app-metric-card">
                <div className="card-header">
                  <div className="app-name">{metric.name}</div>
                  <span
                    className="health-status"
                    style={{ backgroundColor: getStatusColor(status) }}
                    title={status.toUpperCase()}
                  >
                    ●
                  </span>
                </div>

                <div className="metrics-row">
                  <div className="metric">
                    <div className="metric-label">{t('monitoring.cpuLabel')}</div>
                    <div className="metric-value">{metric.cpu.toFixed(1)}%</div>
                    <div className="metric-bar-small">
                      <div
                        className="metric-bar-fill"
                        style={{
                          width: `${metric.cpu}%`,
                          backgroundColor: metric.cpu > 80 ? '#dc3545' : metric.cpu > 60 ? '#ffc107' : '#28a745',
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="metric">
                    <div className="metric-label">{t('monitoring.memoryLabel')}</div>
                    <div className="metric-value">{metric.memory.toFixed(1)}%</div>
                    <div className="metric-bar-small">
                      <div
                        className="metric-bar-fill"
                        style={{
                          width: `${metric.memory}%`,
                          backgroundColor: metric.memory > 80 ? '#dc3545' : metric.memory > 60 ? '#ffc107' : '#28a745',
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="metrics-row">
                  <div className="metric">
                    <div className="metric-label">{t('monitoring.requestsPerMin')}</div>
                    <div className="metric-value">{metric.requestsPerMin.toFixed(0)}</div>
                  </div>

                  <div className="metric">
                    <div className="metric-label">{t('monitoring.errorRate')}</div>
                    <div className="metric-value">{metric.errorRate.toFixed(2)}%</div>
                  </div>
                </div>

                <div className="metrics-row">
                  <div className="metric full-width">
                    <div className="metric-label">{t('monitoring.avgResponseTime')}</div>
                    <div className="metric-value">{metric.avgResponseTime.toFixed(0)}ms</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
