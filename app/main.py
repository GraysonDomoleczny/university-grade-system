from fastapi import FastAPI, status, HTTPException, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uuid
from database import SessionLocal
from models import DBStudent, DBCourse, DBEnrollment
import re
from sqlalchemy import func


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_database_record(db, model, column, value):
    if db.query(model).filter(column == value).one_or_none() is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"{model.__name__} not found")


app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")


class Student(BaseModel):
    student_name: str
    student_email: str


class StudentUpdate(BaseModel):
    student_name: str | None = None
    student_email: str | None = None


class Course(BaseModel):
    course_name: str


class Enrollment(BaseModel):
    student_id: str
    course_id: str
    grade: float | None = None


class EnrollmentUpdate(BaseModel):
    grade: float


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Malformed request."},
    )


@app.get("/")
def get_root():
    return FileResponse("app/templates/index.html")


@app.get("/students")
def get_students(
    sort_order_student: str = "asc",
    search_input_student: str = "",
    sort_order_grade: str = "",
    search_select_grade: str = "all",
    search_input_course: str = "",
    db=Depends(get_db),
):
    search_input_student = search_input_student.strip()
    search_input_course = search_input_course.strip()

    average_grade = (
        db.query(func.avg(DBEnrollment.grade))
        .filter(DBEnrollment.student_id == DBStudent.student_id)
        .correlate(DBStudent)
        .scalar_subquery()
    )

    enrollment_count = (
        db.query(func.count(DBEnrollment.student_id))
        .filter(DBEnrollment.student_id == DBStudent.student_id)
        .correlate(DBStudent)
        .scalar_subquery()
    )

    student_query = db.query(DBStudent)

    if search_input_student:
        student_query = student_query.filter(
            DBStudent.student_name.ilike(f"%{search_input_student}%")
        )

    if search_select_grade not in ("all", ""):
        grade_range = search_select_grade.split("-")

        student_query = student_query.filter(
            average_grade.between(float(grade_range[0]), float(grade_range[1]))
        )

    if search_input_course:
        student_query = (
            student_query.join(DBEnrollment)
            .join(DBCourse)
            .filter(
                DBCourse.course_name.ilike(f"%{search_input_course}%"),
            )
            .distinct()
        )

    if sort_order_grade == "asc":
        student_query = student_query.order_by(
            average_grade.is_(None),
            (enrollment_count == 0),
            average_grade.asc(),
        )

    elif sort_order_grade == "desc":
        student_query = student_query.order_by(
            average_grade.is_(None),
            (enrollment_count == 0),
            average_grade.desc(),
        )

    elif sort_order_student == "asc":
        student_query = student_query.order_by(DBStudent.student_name.asc())

    else:
        student_query = student_query.order_by(DBStudent.student_name.desc())

    students = student_query.all()

    if not students:
        return []

    return [
        {
            "id": student.student_id,
            "name": student.student_name,
            "email": student.student_email,
            "enrollments": [
                {
                    "course_name": db.query(DBCourse)
                    .filter(DBCourse.course_id == enrollment.course_id)
                    .one()
                    .course_name,
                    "grade": enrollment.grade,
                }
                for enrollment in db.query(DBEnrollment)
                .filter(DBEnrollment.student_id == student.student_id)
                .all()
            ],
            "avg_grade": db.query(func.avg(DBEnrollment.grade))
            .filter(DBEnrollment.student_id == student.student_id)
            .scalar(),
        }
        for student in students
    ]


@app.post("/students", status_code=status.HTTP_201_CREATED)
def create_student(student: Student, db=Depends(get_db)):
    student_name = student.student_name.strip() if student.student_name else ""
    student_email = student.student_email.strip() if student.student_email else ""

    if not student_name:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Student name is required.")

    if not student_email:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Student email is required.")

    if not re.match(r"^[\w.+-]+@[\w-]+\.[\w.-]+$", student_email):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid email address.")

    if db.query(DBStudent).filter(DBStudent.student_email == student_email).first():
        raise HTTPException(
            status.HTTP_409_CONFLICT, "A student with this email already exists."
        )

    new_student = DBStudent(
        student_id=str(uuid.uuid4()),
        student_name=student_name,
        student_email=student_email,
    )

    db.add(new_student)
    db.commit()

    return {
        "id": new_student.student_id,
        "name": new_student.student_name,
        "email": new_student.student_email,
    }


@app.delete("/students/{student_id}")
def delete_student(student_id: str, db=Depends(get_db)):
    db_student = (
        db.query(DBStudent).filter(DBStudent.student_id == student_id).one_or_none()
    )

    if db_student is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found.")

    db.delete(db_student)
    db.commit()


@app.patch("/students/{student_id}")
def update_student(student: StudentUpdate, student_id: str, db=Depends(get_db)):
    db_student = (
        db.query(DBStudent).filter(DBStudent.student_id == student_id).one_or_none()
    )
    student_name = student.student_name.strip() if student.student_name else ""
    student_email = student.student_email.strip() if student.student_email else ""

    if db_student is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Student not found.")

    if not student_name and not student_email:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, "Student name, email, or both is required."
        )

    if student_email:
        if not re.match(r"^[\w.+-]+@[\w-]+\.[\w.-]+$", student_email):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid email address.")
        if (
            db.query(DBStudent)
            .filter(
                DBStudent.student_email == student_email,
                DBStudent.student_id != student_id,
            )
            .first()
        ):
            raise HTTPException(
                status.HTTP_409_CONFLICT, "A student with this email already exists."
            )

    if student_name:
        db_student.student_name = student_name
    if student_email:
        db_student.student_email = student_email
    db.commit()


@app.get("/courses")
def get_courses(db=Depends(get_db)):
    courses = db.query(DBCourse).order_by(DBCourse.course_name.asc()).all()

    return [{"id": course.course_id, "name": course.course_name} for course in courses]


@app.post("/courses", status_code=status.HTTP_201_CREATED)
def create_course(course: Course, db=Depends(get_db)):
    course_name = course.course_name.strip()

    if not course_name:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Course name is required.")

    if db.query(DBCourse).filter(DBCourse.course_name == course_name).first():
        raise HTTPException(
            status.HTTP_409_CONFLICT, "A Course with this name already exists."
        )

    new_course = DBCourse(course_id=str(uuid.uuid4()), course_name=course_name)

    db.add(new_course)
    db.commit()

    return {"id": new_course.course_id, "name": new_course.course_name}


@app.delete("/courses/{course_id}")
def delete_course(course_id: str, db=Depends(get_db)):
    db_course = db.query(DBCourse).filter(DBCourse.course_id == course_id).one_or_none()

    if db_course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found.")

    db.delete(db_course)
    db.commit()


@app.patch("/courses/{course_id}")
def update_course(course: Course, course_id: str, db=Depends(get_db)):
    db_course = db.query(DBCourse).filter(DBCourse.course_id == course_id).one_or_none()
    course_name = course.course_name.strip()

    if db_course is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Course not found.")

    if not course_name:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Course name is required.")

    if (
        db.query(DBCourse)
        .filter(DBCourse.course_name == course_name, DBCourse.course_id != course_id)
        .first()
    ):
        raise HTTPException(
            status.HTTP_409_CONFLICT, "A Course with this name already exists."
        )

    db_course.course_name = course_name
    db.commit()


@app.post("/enrollments", status_code=status.HTTP_201_CREATED)
def create_enrollment(enrollment: Enrollment, db=Depends(get_db)):
    student_id = enrollment.student_id.strip()
    course_id = enrollment.course_id.strip()

    require_database_record(db, DBStudent, DBStudent.student_id, student_id)
    require_database_record(db, DBCourse, DBCourse.course_id, course_id)

    existing_enrollment = (
        db.query(DBEnrollment)
        .filter(
            DBEnrollment.student_id == student_id,
            DBEnrollment.course_id == course_id,
        )
        .one_or_none()
    )

    if existing_enrollment is not None:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Student is already enrolled in this course",
        )

    new_enrollment = DBEnrollment(
        student_id=student_id, course_id=course_id, grade=None
    )

    db.add(new_enrollment)
    db.commit()

    return {
        "student_id": new_enrollment.student_id,
        "course_id": new_enrollment.course_id,
        "grade": new_enrollment.grade,
    }


@app.delete("/enrollments/{student_id}/{course_id}")
def delete_enrollment(student_id: str, course_id: str, db=Depends(get_db)):
    db_enrollment = (
        db.query(DBEnrollment)
        .filter(
            DBEnrollment.student_id == student_id,
            DBEnrollment.course_id == course_id,
        )
        .one_or_none()
    )

    if db_enrollment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enrollment not found.")

    db.delete(db_enrollment)
    db.commit()


@app.patch("/enrollments/{student_id}/{course_id}")
def update_grade(
    enrollment: EnrollmentUpdate, student_id: str, course_id: str, db=Depends(get_db)
):
    grade = enrollment.grade

    db_enrollment = (
        db.query(DBEnrollment)
        .filter(
            DBEnrollment.student_id == student_id,
            DBEnrollment.course_id == course_id,
        )
        .one_or_none()
    )

    if db_enrollment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enrollment not found.")

    if not 0 <= grade <= 100:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="Grade must be between 0 and 100."
        )

    db_enrollment.grade = grade
    db.commit()


@app.get("/courses/summary")
def get_course_summary(db=Depends(get_db)):
    enrollments = db.query(DBEnrollment).all()

    grade_total = 0
    grade_distribution = {
        "A": 0,
        "B": 0,
        "C": 0,
        "D": 0,
        "F": 0,
    }

    for enrollment in enrollments:
        if enrollment.grade is None:
            continue

        grade_total += enrollment.grade

        if enrollment.grade >= 90:
            grade_distribution["A"] += 1
        elif enrollment.grade >= 80:
            grade_distribution["B"] += 1
        elif enrollment.grade >= 70:
            grade_distribution["C"] += 1
        elif enrollment.grade >= 60:
            grade_distribution["D"] += 1
        else:
            grade_distribution["F"] += 1

    grade_count = sum(grade_distribution.values())

    average_grade = round(grade_total / grade_count, 2) if grade_count > 0 else None

    return {
        "count_grades": sum(grade_distribution.values()),
        "average_grade": average_grade,
        "grade_distribution": [
            f"{grade}: {count}" for grade, count in grade_distribution.items()
        ],
    }
