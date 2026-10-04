import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Jobs from './pages/Jobs'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateJob from './pages/CreateJob'
import MyApplications from './pages/MyApplications'
import RecruiterApplications from './pages/RecruiterApplications'
import RecruiterJobs from './pages/RecruiterJobs'

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-job" element={<CreateJob />} />
        <Route
  path="/recruiter-jobs"
  element={<RecruiterJobs />}
/>

        <Route
          path="/my-applications"
          element={<MyApplications />}
        />

        <Route
          path="/recruiter-applications"
          element={<RecruiterApplications />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App