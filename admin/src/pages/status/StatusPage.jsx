import { useState, useEffect } from 'react'
import { Activity, Database, Server, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Loading'
import api from '../../lib/api'

export function StatusPage() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/health')
      .then(({ data }) => setHealth(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>

  const checks = [
    { label: 'API Server', ok: !error, detail: error ? 'Unreachable' : 'Connected' },
    { label: 'Database (MySQL)', ok: !error && health?.status === 'ok', detail: error ? 'Unknown' : 'Connected' },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={16} className="text-blue-600" /> System Status
          </CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {checks.map(c => (
              <div key={c.label} className={`p-4 border rounded-xl ${c.ok ? 'border-emerald-100 bg-emerald-50' : 'border-red-100 bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {c.ok ? <CheckCircle2 size={16} className="text-emerald-600" /> : <XCircle size={16} className="text-red-600" />}
                  <p className="text-sm font-semibold text-gray-800">{c.label}</p>
                </div>
                <p className={`text-xs font-medium ${c.ok ? 'text-emerald-600' : 'text-red-600'}`}>{c.detail}</p>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server size={16} className="text-blue-600" /> Environment
          </CardTitle>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500 flex items-center gap-1.5"><Database size={13} /> Database</dt>
              <dd className="text-gray-800 font-medium mt-0.5">MySQL</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last checked</dt>
              <dd className="text-gray-800 font-medium mt-0.5">{health?.time ? new Date(health.time).toLocaleString() : '—'}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>
    </div>
  )
}
