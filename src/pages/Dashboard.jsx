import React, { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import GlobalLoader from '../components/GlobalLoader'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const progressChartRef = useRef(null)
  const roleChartRef = useRef(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://api.wayoftrading.com/aitredding/admin/tools/stats', {
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.status === 1) {
          setStats(data.data)
        } else {
          setError(data.message || 'Failed to fetch stats')
        }
      } catch (err) {
        setError('Error fetching stats')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchStats()
    }

    let progressChartInstance = null
    let roleChartInstance = null

    const initCharts = () => {
      if (!window.Chart) {
        setTimeout(initCharts, 100)
        return
      }

      // Progress Chart
      if (progressChartRef.current) {
        progressChartInstance = new window.Chart(progressChartRef.current, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Lessons Completed',
              data: [120, 190, 300, 250, 420, 500],
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true }
            }
          }
        })
      }

      // Role Chart
      if (roleChartRef.current) {
        roleChartInstance = new window.Chart(roleChartRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Learners', 'Instructors', 'Admins'],
            datasets: [{
              data: [3200, 980, 100],
              backgroundColor: ['#8b5cf6', '#06b6d4', '#f59e0b']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'bottom'
              }
            }
          }
        })
      }
    }

    initCharts()

    // Cleanup charts on unmount
    return () => {
      if (progressChartInstance) progressChartInstance.destroy()
      if (roleChartInstance) roleChartInstance.destroy()
    }
  }, [token])

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">

          {/* Page Header */}
          <div className="page-header fade-in">
            <div className="row align-items-center">
              <div className="col">
                <h1 className="page-title">Dashboard</h1>
                <p className="text-muted">
                  Consolidated AI Analytics overview across all Lesson and courses
                </p>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <GlobalLoader visible={true} size="medium" />
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <>
              <div className="row g-4 mb-4">
                {[
                  { title: "Active Subscriptions", value: stats?.subscriptions?.active || 0 },
                  { title: "Tool Usage (30d)", value: (stats?.tool_usage_last_30d?.coach_ai || 0) + (stats?.tool_usage_last_30d?.ai_chart_analyzer || 0) },
                  { title: "Tool Clicks (OPENED)", value: stats?.tool_clicks_last_30d?.OPENED || 0 },
                  { title: "Disabled Tools", value: stats?.disabled_tools?.length || 0 },
                ].map((item, i) => (
                  <div className="col-md-3" key={i}>
                    <div className="card card-financial p-4 h-100">
                      <h6 className="fw-bold mb-2 text-white">{item.title}</h6>
                      <h3 className="text-white">{item.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects & AI */}
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="card p-4 shadow-soft border-0 h-100">
                    <h6 className="mb-3">📊 Tool Clicks (Last 30 Days)</h6>
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Opened</span><strong>{stats?.tool_clicks_last_30d?.OPENED || 0}</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Paywall Hits</span><strong>{stats?.tool_clicks_last_30d?.PAYWALL || 0}</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Popups</span><strong>{stats?.tool_clicks_last_30d?.POPUP || 0}</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Disabled Clicks</span><strong className="text-danger">{stats?.tool_clicks_last_30d?.DISABLED || 0}</strong>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card p-4 shadow-soft border-0 h-100">
                    <h6 className="mb-3">🤖 AI Tool Usage (Last 30 Days)</h6>
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Coach AI</span><strong>{stats?.tool_usage_last_30d?.coach_ai || 0}</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>AI Chart Analyzer</span><strong>{stats?.tool_usage_last_30d?.ai_chart_analyzer || 0}</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Broker Entitlements</span><strong className="text-success">{stats?.broker_entitlements?.active || 0} Active</strong>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Manual Overrides</span><strong>{stats?.manual_overrides?.active || 0}</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Disabled Tools */}
              <div className="card p-4 shadow-soft border-0 mb-4">
                <h6 className="mb-3">🚫 Disabled Tools</h6>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Tool Name</th>
                        <th>Disabled Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.disabled_tools?.length > 0 ? (
                        stats.disabled_tools.map((tool, i) => (
                          <tr key={i}>
                            <td>{tool.tool_name}</td>
                            <td>{tool.disabled_reason || 'N/A'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="text-center py-3">No tools are currently disabled</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      <Footer />
    </div>
  )
}
