# CampusHire — Full-Stack Placement & Job Matching Platform

CampusHire is a full-stack placement and job matching platform designed to connect students with recruiters through a structured recruitment workflow.

The platform supports student and recruiter accounts, job creation, eligibility evaluation, skill matching, job ranking, applications, and application status tracking.

## Features

### Student

- Student registration and login
- Student profile with:
  - Branch
  - CGPA
  - Graduation year
  - Skills
- Browse available jobs
- Search jobs by title or description
- Filter jobs by location
- Filter jobs based on minimum CGPA
- Automatic eligibility evaluation
- Skill matching between student skills and job requirements
- Skill-match percentage
- Job ranking based on skill match
- Apply for eligible jobs
- Duplicate application prevention
- View application history
- Track application status

### Recruiter

- Recruiter registration and login
- Recruiter profile with company information
- Create job postings
- Select eligible branches
- Select required skills
- Specify:
  - Job title
  - Description
  - Location
  - Minimum CGPA
  - Graduation year
- View jobs created by the recruiter
- View required skills for each job
- View student applications
- Update application status:
  - Applied
  - Shortlisted
  - Rejected
  - Selected

## Eligibility Engine

CampusHire evaluates whether a student is eligible for a job using multiple requirements:

- CGPA
- Graduation year
- Branch eligibility

A student can apply only when the eligibility requirements are satisfied.

## Skill Matching

The platform compares the student's skills with the skills required by a job.

The matching percentage is calculated as:

```text
Matched Required Skills
----------------------- × 100
Total Required Skills

For example, if a job requires:
Python
React
SQL
Flask

and a student has:
Python
React
SQL

the skill match is:
3 / 4 × 100 = 75%

Matched skills and required skills are also displayed to the student.
Job Ranking
Available jobs are ranked according to the student's skill-match percentage.
Jobs with a higher skill match are prioritized above jobs with a lower skill match.
Application Workflow
The application workflow follows:
Student
   ↓
Browse Jobs
   ↓
Eligibility Check
   ↓
Skill Matching
   ↓
Apply
   ↓
Application Created
   ↓
Recruiter Reviews Application
   ↓
Status Updated
   ↓
Student Tracks Status

Application statuses supported by the platform are:
Applied
Shortlisted
Rejected
Selected

Tech Stack
Frontend
- React
- JavaScript
- HTML
- CSS
- React Router
Backend
- Python
- Flask
- Flask-CORS
- REST APIs
- Werkzeug password hashing
Database
- MySQL
- MySQL Connector/Python
Development Tools
- VS Code
- Git
- GitHub
- Vite
Architecture
                CampusHire
                    │
          ┌─────────┴─────────┐
          │                   │
       Frontend            Backend
       React               Flask
          │                   │
          │     REST APIs     │
          └─────────┬─────────┘
                    │
                  MySQL
                    │
          ┌─────────┴─────────┐
          │                   │
       Students            Recruiters
          │                   │
       Skills              Jobs
          │                   │
          └──── Applications ─┘

Database Design
The application uses relational tables to represent users, profiles, jobs, skills, eligibility requirements, and applications.
Main tables include:
- users
- students
- recruiters
- jobs
- skills
- student_skills
- job_skills
- branches
- job_branches
- applications
Many-to-many relationships are used for:
Students ↔ Skills
Jobs ↔ Skills
Jobs ↔ Branches

REST API
The Flask backend exposes REST endpoints for the major application workflows.
Examples include:
POST /api/register
POST /api/login

GET /api/jobs
POST /api/jobs

GET /api/skills
GET /api/branches

GET /api/jobs/<job_id>/eligibility/<student_id>
GET /api/jobs/<job_id>/skill-match/<student_id>

POST /api/applications

GET /api/applications/student/<student_id>

GET /api/applications/recruiter/<recruiter_id>

PUT /api/applications/<application_id>/status

GET /api/jobs/recruiter/<recruiter_id>

Authentication
CampusHire uses role-based authentication with two primary roles:
Student
Recruiter

Passwords are stored using password hashing rather than storing plaintext passwords.
The frontend maintains the logged-in user information and displays role-specific functionality.
Project Structure
CampusHire/
│
├── backend/
│   └── app.py
│
├── database/
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Jobs.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── CreateJob.jsx
│   │   │   ├── MyApplications.jsx
│   │   │   ├── RecruiterApplications.jsx
│   │   │   └── RecruiterJobs.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── .gitignore
└── README.md

Running the Project Locally
1. Clone the repository
git clone https://github.com/BHUVANESH2300080319/CampusHire.git
cd CampusHire

2. Backend Setup
Navigate to the backend:
cd backend

Create and activate a virtual environment:
python -m venv venv

Windows:
venv\Scripts\activate

Install the required packages:
pip install Flask flask-cors mysql-connector-python Werkzeug

Configure the MySQL connection in app.py with your local MySQL credentials.
Start the Flask server:
python app.py

The backend runs on:
https://campushire-nung.onrender.com

3. Frontend Setup
Open another terminal and navigate to:
cd frontend

Install dependencies:
npm install

Start the development server:
npm run dev

The frontend runs on the Vite development server, typically:
http://localhost:5173

Testing
The major application workflows were tested end-to-end, including:
- Student registration and login
- Recruiter login
- Job creation
- Required skill selection
- Job listing
- Eligibility evaluation
- Skill matching
- Skill-based job ranking
- Job application
- Duplicate application prevention
- Student application tracking
- Recruiter application management
- Application status updates
- Recruiter My Jobs
- Required skills display
Future Improvements
Possible future improvements include:
- Production deployment
- Improved authentication and authorization
- Resume upload and parsing
- Email notifications
- Advanced job recommendations
- Recruiter analytics
- More advanced search and filtering
- AI-assisted job and resume matching
Author
Bhuvanesh Kosuru
B.Tech — Artificial Intelligence & Data Science
GitHub:
https://github.com/BHUVANESH2300080319