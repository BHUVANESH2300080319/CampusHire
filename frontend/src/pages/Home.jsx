import { Link } from 'react-router-dom'

function Home() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-label">CAMPUSHIRE</p>

          <h1>
            Find the right opportunity
            <span> for your career.</span>
          </h1>

          <p className="hero-description">
            CampusHire connects students with placement opportunities
            and helps recruiters discover suitable candidates.
          </p>

          <div className="hero-buttons">
            <Link to="/jobs" className="primary-button">
              Explore Jobs
            </Link>

            <Link to="/register" className="secondary-button">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <h2>For Students</h2>
          <p>
            Discover job opportunities, apply easily, and track
            your applications in one place.
          </p>
        </div>

        <div className="feature-card">
          <h2>For Recruiters</h2>
          <p>
            Create job openings and manage applications from
            qualified student candidates.
          </p>
        </div>

        <div className="feature-card">
          <h2>Simple & Organized</h2>
          <p>
            Manage jobs and applications through a clean,
            role-based platform.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Home