from fastapi import FastAPI, status, HTTPException, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uuid
from database import SessionLocal
from models import Student, Course, Enrollment


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


class StudentCreate(BaseModel):
    name: str
    email: str


class CourseCreate(BaseModel):
    name: str


class EnrollmentCreate(BaseModel):
    student_id: str
    course_id: str


class GradeCreate(BaseModel):
    student_id: str
    course_id: str
    grade: float


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Malformed request"},
    )


@app.get("/")
def get_root():
    return FileResponse("app/templates/index.html")


@app.get("/students")
def get_students(db=Depends(get_db)):
    students = db.query(Student).all()

    return [
        {
            "id": student.student_id,
            "name": student.student_name,
            "email": student.student_email,
            "enrollments": [
                {
                    "course_name": db.query(Course)
                    .filter(Course.course_id == enrollment.course_id)
                    .one()
                    .course_name,
                    "grade": enrollment.grade,
                }
                for enrollment in db.query(Enrollment)
                .filter(Enrollment.student_id == student.student_id)
                .all()
            ],
        }
        for student in students
    ]


@app.post("/students", status_code=status.HTTP_201_CREATED)
def create_student(student: StudentCreate, db=Depends(get_db)):
    new_student = Student(
        student_id=str(uuid.uuid4()),
        student_name=student.name,
        student_email=student.email,
    )

    db.add(new_student)
    db.commit()

    return {
        "id": new_student.student_id,
        "name": new_student.student_name,
        "email": new_student.student_email,
    }


@app.get("/courses")
def get_courses(db=Depends(get_db)):
    courses = db.query(Course).all()

    return [{"id": course.course_id, "name": course.course_name} for course in courses]


@app.post("/courses", status_code=status.HTTP_201_CREATED)
def create_course(course: CourseCreate, db=Depends(get_db)):
    new_course = Course(course_id=str(uuid.uuid4()), course_name=course.name)

    db.add(new_course)
    db.commit()

    return {"id": new_course.course_id, "name": new_course.course_name}


@app.post("/enrollments", status_code=status.HTTP_201_CREATED)
def create_enrollment(enrollment: EnrollmentCreate, db=Depends(get_db)):
    require_database_record(db, Student, Student.student_id, enrollment.student_id)
    require_database_record(db, Course, Course.course_id, enrollment.course_id)

    new_enrollment = Enrollment(
        student_id=enrollment.student_id, course_id=enrollment.course_id, grade=None
    )

    db.add(new_enrollment)
    db.commit()

    return {
        "student_id": new_enrollment.student_id,
        "course_id": new_enrollment.course_id,
        "grade": new_enrollment.grade,
    }


@app.post("/grades", status_code=status.HTTP_200_OK)
def create_grade(grade: GradeCreate, db=Depends(get_db)):
    require_database_record(db, Student, Student.student_id, grade.student_id)
    require_database_record(db, Course, Course.course_id, grade.course_id)

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == grade.student_id,
            Enrollment.course_id == grade.course_id,
        )
        .one_or_none()
    )

    if enrollment is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Enrollment not found")

    enrollment.grade = grade.grade
    db.commit()

    return {
        "student_id": enrollment.student_id,
        "course_id": enrollment.course_id,
        "grade": enrollment.grade,
    }
