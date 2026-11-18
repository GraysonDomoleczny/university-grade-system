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


app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")

students = {}
courses = {}
enrollments = []


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
    student = Student(
        student_id=str(uuid.uuid4()),
        student_name=student.name,
        student_email=student.email,
    )

    db.add(student)
    db.commit()

    return {
        "id": student.student_id,
        "name": student.student_name,
        "email": student.student_email,
    }


@app.get("/courses")
def get_courses():
    return [
        {"id": course_id, "name": course["name"]}
        for course_id, course in courses.items()
    ]


@app.post("/courses", status_code=status.HTTP_201_CREATED)
def create_course(course: CourseCreate, db=Depends(get_db)):
    course_id = str(uuid.uuid4())

    db.add(Course(course_id=course_id, course_name=course.name))
    db.commit()

    return {"id": course_id, "name": course.name}


@app.post("/enrollments", status_code=status.HTTP_201_CREATED)
def create_enrollment(enrollment: EnrollmentCreate, db=Depends(get_db)):
    if enrollment.student_id not in students:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )
    if enrollment.course_id not in courses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )

    db.add(
        Enrollment(
            student_id=enrollment.student_id, course_id=enrollment.course_id, grade=None
        )
    )
    db.commit()

    return {
        "student_id": enrollment.student_id,
        "course_id": enrollment.course_id,
        "grade": None,
    }


@app.post("/grades", status_code=status.HTTP_201_CREATED)
def create_grade(grade: GradeCreate):
    if grade.course_id not in courses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )
    if grade.student_id not in students:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )

    for enrollment in enrollments:
        if (
            enrollment["student_id"] == grade.student_id
            and enrollment["course_id"] == grade.course_id
        ):
            enrollment["grade"] = grade.grade
            break
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found"
        )

    return {
        "student_id": enrollment["student_id"],
        "course_id": enrollment["course_id"],
        "grade": grade.grade,
    }
