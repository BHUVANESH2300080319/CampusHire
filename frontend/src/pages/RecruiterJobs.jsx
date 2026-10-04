import { useEffect, useState } from 'react'

function RecruiterJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')

    let user = null

    try {
      if (storedUser && storedUser !== 'undefined') {
        user = JSON.parse(storedUser)
      }
    } catch (error) {
      user = null
    }

    if (!user || user.role !== 'recruiter' || !user.recruiter_id) {
      setLoading(false)
      return
    }

    fetch(
      `http://127.0.0.1:5000/api/jobs/recruiter/${user.recruiter_id}`
    )
      .then((response) => response.json())
      .then((data) => {
        setJobs(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <main>
        <p>Loading your jobs...</p>
      </main>
    )
  }

  return (
    <main>
      <h1>My Jobs</h1>

      {jobs.length === 0 ? (
        <p>You have not created any jobs yet.</p>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <h2>{job.title}</h2>
              </div>

              <p className="job-description">
                {job.description}
              </p>

              <div className="job-details">
                <span>📍 {job.location}</span>
                <span>🎓 CGPA {job.minimum_cgpa}+</span>
                <span>📅 Batch {job.graduation_year}</span>
              </div>
              <p>
  <strong>Required Skills:</strong>{' '}
  {job.required_skills || 'None'}
</p>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default RecruiterJobs