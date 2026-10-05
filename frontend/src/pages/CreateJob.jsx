import { useEffect, useState } from 'react'
import API_BASE_URL from "../api";

function CreateJob() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [minimumCgpa, setMinimumCgpa] = useState('')
  const [graduationYear, setGraduationYear] = useState('')

  const [branches, setBranches] = useState([])
  const [selectedBranches, setSelectedBranches] = useState([])

  const [skills, setSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])

  const [message, setMessage] = useState('')

  // Load branches
  useEffect(() => {
   fetch(`${API_BASE_URL}/api/branches`)
      .then((response) => response.json())
      .then((data) => {
        setBranches(data)
      })
      .catch(() => {
        setMessage('Could not load branches')
      })
  }, [])

  // Load skills
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/skills`)
      .then((response) => response.json())
      .then((data) => {
        setSkills(data)
      })
      .catch(() => {
        setMessage('Could not load skills')
      })
  }, [])

  // Select / unselect branch
  function handleBranchChange(branchId) {
    setSelectedBranches((previousBranches) => {
      if (previousBranches.includes(branchId)) {
        return previousBranches.filter((id) => id !== branchId)
      }

      return [...previousBranches, branchId]
    })
  }

  // Select / unselect skill
  function handleSkillChange(skillId) {
    setSelectedSkills((previousSkills) => {
      if (previousSkills.includes(skillId)) {
        return previousSkills.filter((id) => id !== skillId)
      }

      return [...previousSkills, skillId]
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const user = JSON.parse(localStorage.getItem('user'))

    if (!user || user.role !== 'recruiter') {
      setMessage('Please login as a recruiter')
      return
    }

    if (!user.recruiter_id) {
      setMessage('Recruiter profile not found')
      return
    }

    if (selectedBranches.length === 0) {
      setMessage('Please select at least one eligible branch')
      return
    }

    if (selectedSkills.length === 0) {
      setMessage('Please select at least one required skill')
      return
    }

    setMessage('Creating job...')

    const payload = {
      recruiter_id: user.recruiter_id,
      title,
      description,
      location,
      minimum_cgpa: Number(minimumCgpa),
      graduation_year: Number(graduationYear),
      branch_ids: selectedBranches,
      skill_ids: selectedSkills,
    }

    try {
     const response = await fetch(`${API_BASE_URL}/api/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Job creation failed')
        return
      }

      setMessage(data.message)

      setTitle('')
      setDescription('')
      setLocation('')
      setMinimumCgpa('')
      setGraduationYear('')
      setSelectedBranches([])
      setSelectedSkills([])
    } catch (error) {
      setMessage('Could not connect to backend')
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Create Job</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Job Title</label>

            <input
              type="text"
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Software Developer Intern"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Enter job description"
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>

            <input
              type="text"
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="e.g. Hyderabad"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="minimumCgpa">Minimum CGPA</label>

            <input
              type="number"
              id="minimumCgpa"
              value={minimumCgpa}
              onChange={(event) => setMinimumCgpa(event.target.value)}
              placeholder="e.g. 7.5"
              min="0"
              max="10"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="graduationYear">Graduation Year</label>

            <input
              type="number"
              id="graduationYear"
              value={graduationYear}
              onChange={(event) => setGraduationYear(event.target.value)}
              placeholder="e.g. 2027"
              required
            />
          </div>

          {/* Eligible branches */}
          <div className="form-group">
            <label>Eligible Branches</label>

            <div className="branch-options">
              {branches.map((branch) => (
                <label key={branch.id} className="branch-option">
                  <input
                    type="checkbox"
                    checked={selectedBranches.includes(branch.id)}
                    onChange={() => handleBranchChange(branch.id)}
                  />

                  <span>{branch.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Required skills */}
          <div className="form-group">
            <label>Required Skills</label>

            <div className="branch-options">
              {skills.map((skill) => (
                <label key={skill.id} className="branch-option">
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill.id)}
                    onChange={() => handleSkillChange(skill.id)}
                  />

                  <span>{skill.name}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit">
            Create Job
          </button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </main>
  )
}

export default CreateJob