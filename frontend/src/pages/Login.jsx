import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('Logging in...')

    try {
      const response = await fetch('http://127.0.0.1:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.error || 'Login failed')
        return
      }

      localStorage.setItem('user', JSON.stringify(data))

console.log('Logged-in user:', data)
      navigate('/')
    } catch (error) {
      setMessage('Could not connect to backend')
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Login to CampusHire</h1>

        <form onSubmit={handleSubmit}>
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

          <button type="submit">Login</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </main>
  )
}

export default Login