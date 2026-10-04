import { useEffect, useState } from 'react'

function RecruiterApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadApplications()
  }, [])

  async function loadApplications() {
    const user = JSON.parse(localStorage.getItem('user'))

    if (!user) {
      setMessage('Please login to view applications')
      setLoading(false)
      return
    }

    if (user.role !== 'recruiter') {
      setMessage('Only recruiters can view applicants')
      setLoading(false)
      return
    }

    if (!user.recruiter_id) {
      setMessage('Recruiter profile not found')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/applications/recruiter/${user.recruiter_id}`
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Could not load applications')
        setLoading(false)
        return
      }

      setApplications(data)
      setLoading(false)
    } catch (error) {
      setMessage('Could not connect to backend')
      setLoading(false)
    }
  }

  async function handleStatusChange(applicationId, newStatus) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/applications/${applicationId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Status update failed')
        return
      }

      setApplications((previousApplications) =>
        previousApplications.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: newStatus,
              }
            : application
        )
      )

      setMessage('Application status updated successfully')
    } catch (error) {
      setMessage('Could not connect to backend')
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading applications...</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Applications Received</h1>

      {message && <p>{message}</p>}

      {!message && applications.length === 0 ? (
        <p>No applications received yet.</p>
      ) : (
        <div className="application-list">
          {applications.map((application) => (
            <div
              key={application.id}
              className="application-card"
            >
              <h2>{application.title}</h2>

              <p>
                <strong>Student:</strong>{' '}
                {application.student_name}
              </p>

              <p>
                <strong>Branch:</strong>{' '}
                {application.branch}
              </p>

              <p>
                <strong>CGPA:</strong>{' '}
                {application.cgpa}
              </p>

              <p>
                <strong>Graduation Year:</strong>{' '}
                {application.graduation_year}
              </p>

              <p>
                <strong>Status:</strong>{' '}
                <select
                  value={application.status}
                  onChange={(event) =>
                    handleStatusChange(
                      application.id,
                      event.target.value
                    )
                  }
                >
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">
                    Shortlisted
                  </option>
                  <option value="Rejected">
                    Rejected
                  </option>
                  <option value="Selected">
                    Selected
                  </option>
                </select>
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

export default RecruiterApplications