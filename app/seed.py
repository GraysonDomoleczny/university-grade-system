from database import SessionLocal
from models import Student, Course, Enrollment
import uuid
import sys

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

enrollment_data = [
    (0, 0, 92.5),
    (0, 1, 87.0),
    (1, 0, 95.0),
    (1, 2, 89.5),
    (2, 1, 78.0),
    (2, 3, 84.5),
    (3, 2, 96.0),
    (3, 4, 91.0),
    (4, 3, 88.5),
    (4, 5, 79.0),
    (5, 4, 93.0),
    (5, 6, 86.5),
    (6, 5, 82.0),
    (6, 7, 90.5),
    (7, 6, 97.0),
    (7, 8, 88.0),
    (8, 7, 85.5),
    (8, 9, 92.0),
    (9, 8, 94.5),
    (9, 9, 81.0),
]


db = SessionLocal()

try:
    if (
        db.query(Student)
        .filter(Student.student_email == "john.smith@example.com")
        .first()
        is not None
    ):
        print("Sample data has already been inserted.")
        sys.exit()

    students = [
        Student(
            student_id=str(uuid.uuid4()),
            student_name=name,
            student_email=email,
        )
        for name, email in student_data
    ]

    courses = [
        Course(course_id=str(uuid.uuid4()), course_name=name) for name in course_data
    ]

    enrollments = [
        Enrollment(
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
