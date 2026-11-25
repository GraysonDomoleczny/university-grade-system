from sqlalchemy import String, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class DBStudent(Base):
    __tablename__ = "students"
    student_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    student_name: Mapped[str] = mapped_column(String(100), nullable=False)
    student_email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)


class DBCourse(Base):
    __tablename__ = "courses"
    course_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    course_name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)


class DBEnrollment(Base):
    __tablename__ = "enrollments"
    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("students.student_id", ondelete="CASCADE"),
        primary_key=True,
    )
    course_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("courses.course_id", ondelete="CASCADE"),
        primary_key=True,
    )
    grade: Mapped[float | None] = mapped_column(Float)
