from app.database import SessionLocal
from app.models import DBStudent, DBCourse, DBEnrollment
import uuid
import sys
import random

student_data = [
    ("John Smith", "john.smith@example.com"),
    ("Jane Doe", "jane.doe@example.com"),
    ("Michael Johnson", "michael.johnson@example.com"),
    ("Emily Williams", "emily.williams@example.com"),
    ("David Brown", "david.brown@example.com"),
    ("Sarah Davis", "sarah.davis@example.com"),
    ("James Wilson", "james.wilson@example.com"),
    ("Olivia Martinez", "olivia.martinez@example.com"),
    ("Daniel Anderson", "daniel.anderson@example.com"),
    ("Sophia Taylor", "sophia.taylor@example.com"),
]

course_data = [
    "Introduction to Computer Science",
    "Database Management",
    "Web Development",
    "Data Structures and Algorithms",
    "Computer Networking",
    "Operating Systems",
    "Software Engineering",
    "Cybersecurity Fundamentals",
    "Python Programming",
    "Information Systems",
]


enrollment_data: list[tuple[int, int, float]] = []

for student_index in range(len(student_data)):
    enrollment_count = random.randint(0, 6)
    enrolled_courses = random.sample(range(len(course_data)), enrollment_count)

    for course_index in enrolled_courses:
        grade = round(random.uniform(50, 100), 2)
        enrollment_data.append((student_index, course_index, grade))


db = SessionLocal()

try:
    if (
        db.query(DBStudent)
        .filter(DBStudent.student_email == "john.smith@example.com")
        .first()
        is not None
    ):
        print("Sample data has already been inserted.")
        sys.exit()

    students = [
        DBStudent(
            student_id=str(uuid.uuid4()),
            student_name=name,
            student_email=email,
        )
        for name, email in student_data
    ]

    courses = [
        DBCourse(course_id=str(uuid.uuid4()), course_name=name) for name in course_data
    ]

    enrollments = [
        DBEnrollment(
            student_id=students[student_index].student_id,
            course_id=courses[course_index].course_id,
            grade=grade,
        )
        for student_index, course_index, grade in enrollment_data
    ]

    db.add_all(students)
    db.add_all(courses)
    db.flush()
    db.add_all(enrollments)
    db.commit()

finally:
    db.close()
