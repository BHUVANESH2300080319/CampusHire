import { useState } from 'react'
import API_BASE_URL from '../api'

function Register() {
  const [role, setRole] = useState('student')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [branch, setBranch] = useState('')
  const [cgpa, setCgpa] = useState('')
  const [graduationYear, setGraduationYear] = useState('')

  const [company, setCompany] = useState('')

  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('Registering...')

    const payload = {
      name,
      email,
      password,
      role,
    }

    if (role === 'student') {
      payload.branch = branch
      payload.cgpa = Number(cgpa)
      payload.graduation_year = Number(graduationYear)
    }

    if (role === 'recruiter') {
      payload.company = company
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Registration failed')
        return
      }

      setMessage(data.message)

      setName('')
      setEmail('')
      setPassword('')
      setBranch('')
      setCgpa('')
      setGraduationYear('')
      setCompany('')
    } catch (error) {
      setMessage('Could not connect to backend')
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="role">Account Type</label>

            <select
              id="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
            >
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Name</label>

            <input
              type="text"
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              type="password"
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {role === 'student' && (
            <>
              <div className="form-group">
                <label htmlFor="branch">Branch</label>

                <input
                  type="text"
                  id="branch"
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  placeholder="e.g. AI & Data Science"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cgpa">CGPA</label>

                <input
                  type="number"
                  id="cgpa"
                  value={cgpa}
                  onChange={(event) => setCgpa(event.target.value)}
                  placeholder="e.g. 8.5"
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
            </>
          )}

          {role === 'recruiter' && (
            <div className="form-group">
              <label htmlFor="company">Company</label>

              <input
                type="text"
                id="company"
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>
          )}

          <button type="submit">Register</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </main>
  )
}

export default Register