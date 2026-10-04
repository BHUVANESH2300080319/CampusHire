import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
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

  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('user')
    navigate('/login')
    window.location.reload()
  }

  return (
    <nav>
      <h2>CampusHire</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/jobs">Jobs</Link>

        {user && user.role === 'student' && (
          <Link to="/my-applications">
            My Applications
          </Link>
        )}

        {user && user.role === 'recruiter' && (
  <>
    <Link to="/recruiter-applications">
      Recruiter Applications
    </Link>

    <Link to="/recruiter-jobs">
      My Jobs
    </Link>

    <Link to="/create-job">
      Create Job
    </Link>
  </>
)}
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {user && (
          <button onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar