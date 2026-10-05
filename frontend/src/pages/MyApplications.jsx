import { useEffect, useState } from 'react'
import API_BASE_URL from '../api'

function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))

    if (!user) {
      setMessage('Please login to view your applications')
      setLoading(false)
      return
    }

    if (user.role !== 'student') {
      setMessage('Only students can view applications')
      setLoading(false)
      return
    }

    if (!user.student_id) {
      setMessage('Student profile not found')
      setLoading(false)
      return
    }

    fetch(
      `${API_BASE_URL}/api/applications/student/${user.student_id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setApplications(data)
        setLoading(false)
      })
      .catch(() => {
        setMessage('Could not load applications')
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <main>
        <p>Loading applications...</p>
      </main>
    )
  }

  return (
    <main>
      <h1>My Applications</h1>

      {message && <p>{message}</p>}

      {!message && applications.length === 0 ? (
        <p>You have not applied to any jobs yet.</p>
      ) : (
        <div className="application-list">
          {applications.map((application) => (
            <div
              key={application.id}
              className="application-card"
            >
              <h2>{application.title}</h2>

              <p>
                <strong>Status:</strong>{' '}
                <span
                  className={`status-badge status-${application.status.toLowerCase()}`}
                >
                  {application.status}
                </span>
              </p>

              <p>
                <strong>Applied:</strong>{' '}
                {new Date(
                  application.applied_at
                ).toLocaleDateString('en-IN', {
                  timeZone: 'UTC',
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default MyApplications