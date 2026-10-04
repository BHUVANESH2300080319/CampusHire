import { useEffect, useState } from 'react'

function Jobs() {
  const [jobs, setJobs] = useState([])

  // Safely get logged-in user
  const storedUser = localStorage.getItem('user')

  let user = null

  try {
    if (storedUser && storedUser !== 'undefined') {
      user = JSON.parse(storedUser)
    }
  } catch (error) {
    console.log('Invalid user data in localStorage')
    localStorage.removeItem('user')
    user = null
  }

  const isStudent = user && user.role === 'student'

  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [maxCgpa, setMaxCgpa] = useState('')
  const [loading, setLoading] = useState(true)

  const [message, setMessage] = useState('')
  const [appliedJobIds, setAppliedJobIds] = useState([])
  const [eligibility, setEligibility] = useState({})
  const [skillMatch, setSkillMatch] = useState({})

  // Load jobs
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/jobs')
      .then((response) => response.json())
      .then((data) => {
        setJobs(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  // Load student's existing applications
  useEffect(() => {
    if (!isStudent || !user.student_id) {
      return
    }

    fetch(
      `http://127.0.0.1:5000/api/applications/student/${user.student_id}`
    )
      .then((response) => response.json())
      .then((data) => {
        const jobIds = data.map((application) => application.job_id)

        setAppliedJobIds(jobIds)
      })
      .catch(() => {
        console.log('Could not load applications')
      })
  }, [])

  // Check eligibility for every job
  useEffect(() => {
    if (!isStudent || !user.student_id) {
      return
    }

    if (jobs.length === 0) {
      return
    }

    jobs.forEach((job) => {
      fetch(
        `http://127.0.0.1:5000/api/jobs/${job.id}/eligibility/${user.student_id}`
      )
        .then((response) => response.json())
        .then((data) => {
          setEligibility((previous) => ({
            ...previous,
            [job.id]: data,
          }))
        })
        .catch(() => {
          console.log(
            `Could not check eligibility for job ${job.id}`
          )
        })
    })
  }, [jobs])

  // Check skill match for every job
  useEffect(() => {
    if (!isStudent || !user.student_id) {
      return
    }

    if (jobs.length === 0) {
      return
    }

    jobs.forEach((job) => {
      fetch(
        `http://127.0.0.1:5000/api/jobs/${job.id}/skill-match/${user.student_id}`
      )
        .then((response) => response.json())
        .then((data) => {
          setSkillMatch((previous) => ({
            ...previous,
            [job.id]: data,
          }))
        })
        .catch(() => {
          console.log(
            `Could not check skill match for job ${job.id}`
          )
        })
    })
  }, [jobs])

  // Apply for job
  async function handleApply(jobId) {
    if (!user) {
      setMessage('Please login before applying')
      return
    }

    if (user.role !== 'student') {
      setMessage('Only students can apply for jobs')
      return
    }

    if (!user.student_id) {
      setMessage('Student profile not found')
      return
    }

    const jobEligibility = eligibility[jobId]

    if (jobEligibility && !jobEligibility.eligible) {
      setMessage('You are not eligible for this job')
      return
    }

    setMessage('Applying...')

    try {
      const response = await fetch(
        'http://127.0.0.1:5000/api/applications',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            student_id: user.student_id,
            job_id: jobId,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Application failed')
        return
      }

      setMessage(data.message)

      setAppliedJobIds((previousIds) => [
        ...previousIds,
        jobId,
      ])
    } catch (error) {
      setMessage('Could not connect to backend')
    }
  }

  // Search and filters
  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase()
    const locationText = location.toLowerCase()

    const matchesSearch =
      job.title.toLowerCase().includes(searchText) ||
      job.description.toLowerCase().includes(searchText)

    const matchesLocation =
      job.location.toLowerCase().includes(locationText)

    const matchesCgpa =
      maxCgpa === '' ||
      Number(maxCgpa) >= Number(job.minimum_cgpa)

    return matchesSearch && matchesLocation && matchesCgpa
  })

  // Rank jobs by skill match percentage
  const rankedJobs = [...filteredJobs].sort((jobA, jobB) => {
    const matchA =
      skillMatch[jobA.id]?.match_percentage || 0

    const matchB =
      skillMatch[jobB.id]?.match_percentage || 0

    return matchB - matchA
  })

  if (loading) {
    return (
      <main>
        <p>Loading jobs...</p>
      </main>
    )
  }

  return (
    <main>
      <h1>Available Jobs</h1>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by job title or description..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Filter by location..."
            value={location}
            onChange={(event) =>
              setLocation(event.target.value)
            }
          />
        </div>

        <div className="search-box">
          <input
            type="number"
            placeholder="Enter your CGPA..."
            value={maxCgpa}
            onChange={(event) =>
              setMaxCgpa(event.target.value)
            }
            min="0"
            max="10"
            step="0.01"
          />
        </div>
      </div>

      {message && <p>{message}</p>}

      <p className="job-count">
        {filteredJobs.length} job
        {filteredJobs.length !== 1 ? 's' : ''} found
      </p>

      {filteredJobs.length === 0 ? (
        <div className="no-jobs">
          <p>No jobs found matching your filters.</p>
        </div>
      ) : (
        <div className="job-list">
          {rankedJobs.map((job) => {
            const hasApplied =
              appliedJobIds.includes(job.id)

            const jobEligibility =
              eligibility[job.id]

            const jobSkillMatch =
              skillMatch[job.id]

            return (
              <div
                key={job.id}
                className="job-card"
              >
                <div className="job-card-header">
                  <h2>{job.title}</h2>
                </div>

                <p className="job-description">
                  {job.description}
                </p>

                <div className="job-details">
                  <span>
                    📍 {job.location}
                  </span>

                  <span>
                    🎓 CGPA {job.minimum_cgpa}+
                  </span>

                  <span>
                    📅 Batch {job.graduation_year}
                  </span>
                </div>

                {/* Eligibility result */}
                {isStudent && jobEligibility && (
                  <p>
                    <strong>
                      {jobEligibility.eligible
                        ? 'Eligible ✓'
                        : 'Not Eligible ✗'}
                    </strong>
                  </p>
                )}

                {/* Skill match result */}
                {isStudent && jobSkillMatch && (
                  <div>
                    <p>
                      <strong>
                        Skill Match:{' '}
                        {jobSkillMatch.match_percentage}%
                      </strong>
                    </p>

                    <p>
                      <strong>
                        Matched Skills:
                      </strong>{' '}
                      {jobSkillMatch.matched_skills.length >
                      0
                        ? jobSkillMatch.matched_skills.join(
                            ', '
                          )
                        : 'None'}
                    </p>

                    <p>
                      <strong>
                        Required Skills:
                      </strong>{' '}
                      {jobSkillMatch.required_skills.length >
                      0
                        ? jobSkillMatch.required_skills.join(
                            ', '
                          )
                        : 'None'}
                    </p>
                  </div>
                )}

                {/* Student application controls */}
                {isStudent && (
                  <>
                    {hasApplied ? (
                      <button
                        className="apply-button applied-button"
                        disabled
                      >
                        Applied ✓
                      </button>
                    ) : !jobEligibility ? (
                      <button
                        className="apply-button"
                        disabled
                      >
                        Checking Eligibility...
                      </button>
                    ) : !jobEligibility.eligible ? (
                      <button
                        className="apply-button"
                        disabled
                      >
                        Not Eligible
                      </button>
                    ) : (
                      <button
                        className="apply-button"
                        onClick={() =>
                          handleApply(job.id)
                        }
                      >
                        Apply Now
                      </button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}

export default Jobs