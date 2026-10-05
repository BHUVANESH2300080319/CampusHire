from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)


def get_db_connection():
    connection = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "localhost"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE", "campushire")
    )
    return connection


@app.route("/")
def home():
    return jsonify({
        "message": "CampusHire backend is running"
    })


@app.route("/api/hello")
def hello():
    return jsonify({
        "message": "Hello from CampusHire backend!"
    })


@app.route("/api/users", methods=["GET"])
def get_users():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT id, email, role, created_at
        FROM users
    """)

    users = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(users), 200


@app.route("/api/jobs", methods=["GET"])
def get_jobs():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            recruiter_id,
            title,
            description,
            location,
            minimum_cgpa,
            graduation_year,
            created_at
        FROM jobs
        ORDER BY created_at DESC
    """)

    jobs = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(jobs), 200


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    name = data.get("name")
    branch = data.get("branch")
    cgpa = data.get("cgpa")
    graduation_year = data.get("graduation_year")

    company = data.get("company")

    if not email or not password or not role:
        return jsonify({
            "error": "Email, password and role are required"
        }), 400

    if role not in ["student", "recruiter"]:
        return jsonify({
            "error": "Invalid role"
        }), 400

    if role == "student":
        if (
            not name
            or not branch
            or cgpa is None
            or not graduation_year
        ):
            return jsonify({
                "error": "All student fields are required"
            }), 400

    if role == "recruiter":
        if not name or not company:
            return jsonify({
                "error": "Name and company are required"
            }), 400

    password_hash = generate_password_hash(password)

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO users
            (email, password_hash, role)
            VALUES (%s, %s, %s)
            """,
            (email, password_hash, role)
        )

        user_id = cursor.lastrowid

        if role == "student":
            cursor.execute(
                """
                INSERT INTO students
                (
                    user_id,
                    name,
                    branch,
                    cgpa,
                    graduation_year
                )
                VALUES (%s, %s, %s, %s, %s)
                """,
                (
                    user_id,
                    name,
                    branch,
                    cgpa,
                    graduation_year
                )
            )

        if role == "recruiter":
            cursor.execute(
                """
                INSERT INTO recruiters
                (
                    user_id,
                    name,
                    company
                )
                VALUES (%s, %s, %s)
                """,
                (
                    user_id,
                    name,
                    company
                )
            )

        connection.commit()

    except mysql.connector.Error as error:
        connection.rollback()

        if error.errno == 1062:
            return jsonify({
                "error": "Email already registered"
            }), 409

        return jsonify({
            "error": "Registration failed"
        }), 400

    finally:
        cursor.close()
        connection.close()

    return jsonify({
        "message": "Registration successful"
    }), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, email, password_hash, role
        FROM users
        WHERE email = %s
        """,
        (email,)
    )

    user = cursor.fetchone()

    if not user:
        cursor.close()
        connection.close()

        return jsonify({
            "error": "Invalid email or password"
        }), 401

    if not check_password_hash(
        user["password_hash"],
        password
    ):
        cursor.close()
        connection.close()

        return jsonify({
            "error": "Invalid email or password"
        }), 401

    response = {
        "id": user["id"],
        "email": user["email"],
        "role": user["role"]
    }

    if user["role"] == "student":
        cursor.execute(
            """
            SELECT
                id,
                name,
                branch,
                cgpa,
                graduation_year
            FROM students
            WHERE user_id = %s
            """,
            (user["id"],)
        )

        student = cursor.fetchone()

        if student:
            response["student_id"] = student["id"]
            response["name"] = student["name"]
            response["branch"] = student["branch"]
            response["cgpa"] = float(student["cgpa"])
            response["graduation_year"] = student["graduation_year"]

    if user["role"] == "recruiter":
        cursor.execute(
            """
            SELECT
                id,
                name,
                company
            FROM recruiters
            WHERE user_id = %s
            """,
            (user["id"],)
        )

        recruiter = cursor.fetchone()

        if recruiter:
            response["recruiter_id"] = recruiter["id"]
            response["name"] = recruiter["name"]
            response["company"] = recruiter["company"]

    cursor.close()
    connection.close()

    return jsonify(response), 200


@app.route("/api/jobs", methods=["POST"])
def create_job():
    data = request.get_json()

    recruiter_id = data.get("recruiter_id")
    title = data.get("title")
    description = data.get("description")
    location = data.get("location")
    minimum_cgpa = data.get("minimum_cgpa")
    graduation_year = data.get("graduation_year")
    branch_ids = data.get("branch_ids")
    skill_ids = data.get("skill_ids")

    if (
        not recruiter_id
        or not title
        or not description
        or not location
        or minimum_cgpa is None
        or not graduation_year
        or not branch_ids
        or not skill_ids
    ):
        return jsonify({
            "error": "All job fields, at least one branch, and at least one skill are required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Create the job
        cursor.execute(
            """
            INSERT INTO jobs
            (
                recruiter_id,
                title,
                description,
                location,
                minimum_cgpa,
                graduation_year
            )
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                recruiter_id,
                title,
                description,
                location,
                minimum_cgpa,
                graduation_year
            )
        )

        job_id = cursor.lastrowid

        # Save eligible branches for this job
        for branch_id in branch_ids:
            cursor.execute(
                """
                INSERT INTO job_branches
                (job_id, branch_id)
                VALUES (%s, %s)
                """,
                (job_id, branch_id)
            )

        # Save required skills for this job
        for skill_id in skill_ids:
            cursor.execute(
                """
                INSERT INTO job_skills
                (job_id, skill_id)
                VALUES (%s, %s)
                """,
                (job_id, skill_id)
            )

        connection.commit()

    except mysql.connector.Error:
        connection.rollback()

        return jsonify({
            "error": "Job creation failed"
        }), 400

    finally:
        cursor.close()
        connection.close()

    return jsonify({
        "message": "Job created successfully",
        "job_id": job_id
    }), 201


@app.route("/api/applications", methods=["POST"])
def create_application():
    data = request.get_json()

    student_id = data.get("student_id")
    job_id = data.get("job_id")

    if not student_id or not job_id:
        return jsonify({
            "error": "Student ID and Job ID are required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO applications (student_id, job_id)
            VALUES (%s, %s)
            """,
            (student_id, job_id)
        )

        connection.commit()

    except mysql.connector.Error as error:
        connection.rollback()

        if error.errno == 1062:
            return jsonify({
                "error": "You have already applied for this job"
            }), 409

        return jsonify({
            "error": "Application failed"
        }), 400

    finally:
        cursor.close()
        connection.close()

    return jsonify({
        "message": "Application submitted successfully"
    }), 201


@app.route("/api/applications/student/<int:student_id>", methods=["GET"])
def get_student_applications(student_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            a.id,
            a.job_id,
            j.title,
            a.status,
            a.applied_at
        FROM applications a
        JOIN jobs j
            ON a.job_id = j.id
        WHERE a.student_id = %s
        ORDER BY a.applied_at DESC
        """,
        (student_id,)
    )

    applications = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(applications), 200


@app.route("/api/applications/recruiter/<int:recruiter_id>", methods=["GET"])
def get_recruiter_applications(recruiter_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT
            a.id,
            a.job_id,
            j.title,
            s.name AS student_name,
            s.branch,
            s.cgpa,
            s.graduation_year,
            a.status,
            a.applied_at
        FROM applications a
        JOIN jobs j
            ON a.job_id = j.id
        JOIN students s
            ON a.student_id = s.id
        WHERE j.recruiter_id = %s
        ORDER BY a.applied_at DESC
        """,
        (recruiter_id,)
    )

    applications = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(applications), 200


@app.route("/api/applications/<int:application_id>/status", methods=["PUT"])
def update_application_status(application_id):
    data = request.get_json()

    status = data.get("status")

    allowed_statuses = [
        "Applied",
        "Shortlisted",
        "Rejected",
        "Selected"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "error": "Invalid application status"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            UPDATE applications
            SET status = %s
            WHERE id = %s
            """,
            (status, application_id)
        )

        if cursor.rowcount == 0:
            return jsonify({
                "error": "Application not found"
            }), 404

        connection.commit()

    except mysql.connector.Error:
        connection.rollback()

        return jsonify({
            "error": "Failed to update application status"
        }), 400

    finally:
        cursor.close()
        connection.close()

    return jsonify({
        "message": "Application status updated successfully"
    }), 200


@app.route("/api/branches", methods=["GET"])
def get_branches():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, name
        FROM branches
        ORDER BY name
        """
    )

    branches = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(branches), 200


@app.route("/api/skills", methods=["GET"])
def get_skills():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, name
        FROM skills
        ORDER BY name
        """
    )

    skills = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(skills), 200


@app.route("/api/jobs/<int:job_id>/eligibility/<int:student_id>", methods=["GET"])
def check_job_eligibility(job_id, student_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get student details
        cursor.execute(
            """
            SELECT
                id,
                branch,
                cgpa,
                graduation_year
            FROM students
            WHERE id = %s
            """,
            (student_id,)
        )

        student = cursor.fetchone()

        if not student:
            return jsonify({
                "error": "Student not found"
            }), 404

        # Get job details
        cursor.execute(
            """
            SELECT
                id,
                title,
                minimum_cgpa,
                graduation_year
            FROM jobs
            WHERE id = %s
            """,
            (job_id,)
        )

        job = cursor.fetchone()

        if not job:
            return jsonify({
                "error": "Job not found"
            }), 404

        # Check CGPA
        if float(student["cgpa"]) < float(job["minimum_cgpa"]):
            return jsonify({
                "eligible": False,
                "reason": "Student CGPA is below the required minimum"
            }), 200

        # Check graduation year
        if student["graduation_year"] != job["graduation_year"]:
            return jsonify({
                "eligible": False,
                "reason": "Student graduation year does not match the job requirement"
            }), 200

        # Check branch
        cursor.execute(
            """
            SELECT 1
            FROM job_branches jb
            JOIN branches b
                ON jb.branch_id = b.id
            WHERE jb.job_id = %s
              AND b.name = %s
            """,
            (job_id, student["branch"])
        )

        branch_match = cursor.fetchone()

        if not branch_match:
            return jsonify({
                "eligible": False,
                "reason": "Student branch is not eligible for this job"
            }), 200

        return jsonify({
            "eligible": True,
            "reason": "Student meets all eligibility requirements"
        }), 200

    finally:
        cursor.close()
        connection.close()


@app.route("/api/jobs/<int:job_id>/skill-match/<int:student_id>", methods=["GET"])
def get_skill_match(job_id, student_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        # Get student's skills
        cursor.execute(
            """
            SELECT sk.name
            FROM student_skills ss
            JOIN skills sk
                ON ss.skill_id = sk.id
            WHERE ss.student_id = %s
            """,
            (student_id,)
        )

        student_skills = {
            row["name"]
            for row in cursor.fetchall()
        }

        # Get job's required skills
        cursor.execute(
            """
            SELECT sk.name
            FROM job_skills js
            JOIN skills sk
                ON js.skill_id = sk.id
            WHERE js.job_id = %s
            """,
            (job_id,)
        )

        required_skills = {
            row["name"]
            for row in cursor.fetchall()
        }

        if not required_skills:
            return jsonify({
                "match_percentage": 0,
                "matched_skills": [],
                "required_skills": [],
                "message": "No required skills found for this job"
            }), 200

        matched_skills = student_skills.intersection(required_skills)

        match_percentage = (
            len(matched_skills) / len(required_skills)
        ) * 100

        return jsonify({
            "match_percentage": round(match_percentage, 2),
            "matched_skills": sorted(matched_skills),
            "required_skills": sorted(required_skills)
        }), 200

    finally:
        cursor.close()
        connection.close()

@app.route("/api/jobs/recruiter/<int:recruiter_id>", methods=["GET"])
def get_recruiter_jobs(recruiter_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                j.id,
                j.title,
                j.description,
                j.location,
                j.minimum_cgpa,
                j.graduation_year,
                j.created_at,
                GROUP_CONCAT(s.name ORDER BY s.name SEPARATOR ', ') AS required_skills
            FROM jobs j
            LEFT JOIN job_skills js
                ON j.id = js.job_id
            LEFT JOIN skills s
                ON js.skill_id = s.id
            WHERE j.recruiter_id = %s
            GROUP BY
                j.id,
                j.title,
                j.description,
                j.location,
                j.minimum_cgpa,
                j.graduation_year,
                j.created_at
            ORDER BY j.created_at DESC
            """,
            (recruiter_id,)
        )

        jobs = cursor.fetchall()

        return jsonify(jobs), 200

    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    app.run(debug=True)