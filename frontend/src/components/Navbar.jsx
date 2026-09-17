import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav>
      <h2>CampusHire</h2>

      <div>
        <Link to="/">Home</Link>
        <Link to="/jobs">Jobs</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  )
}

export default Navbar