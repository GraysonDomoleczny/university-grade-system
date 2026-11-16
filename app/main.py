from fastapi import FastAPI, status, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uuid

app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")


students = {}
courses = {}
enrollments = []


class Student(BaseModel):
    name: str
    email: str


class Course(BaseModel):
    name: str


class Enrollment(BaseModel):
    student_id: str
    course_id: str


class Grade(BaseModel):
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
def get_students():
    result = []

    for student_id, student in students.items():
        student_enrollments = [
            {
                "course_name": courses[enrollment["course_id"]]["name"],
                "grade": enrollment["grade"],
            }
            for enrollment in enrollments
            if enrollment["student_id"] == student_id
        ]

        result.append(
            {
                "id": student_id,
                "name": student["name"],
                "email": student["email"],
                "enrollments": student_enrollments,
            }
        )

    return result


@app.post("/students", status_code=status.HTTP_201_CREATED)
def create_student(student: Student):
    student_id = str(uuid.uuid4())
    students[student_id] = {"name": student.name, "email": student.email}
    return {"id": student_id, "name": student.name, "email": student.email}


@app.get("/courses")
def get_courses():
    return [
        {"id": course_id, "name": course["name"]}
        for course_id, course in courses.items()
    ]


@app.post("/courses", status_code=status.HTTP_201_CREATED)
def create_course(course: Course):
    course_id = str(uuid.uuid4())
    courses[course_id] = {"name": course.name}
    return {"id": course_id, "name": course.name}


@app.post("/enrollments", status_code=status.HTTP_201_CREATED)
def create_enrollment(enrollment: Enrollment):
    if enrollment.student_id not in students:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )
    if enrollment.course_id not in courses:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )

    enrollments.append(
        {
            "student_id": enrollment.student_id,
            "course_id": enrollment.course_id,
            "grade": None,
        }
    )

    return {
        "student_id": enrollment.student_id,
        "course_id": enrollment.course_id,
        "grade": None,
    }


@app.post("/grades", status_code=status.HTTP_201_CREATED)
def create_grade(grade: Grade):
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
