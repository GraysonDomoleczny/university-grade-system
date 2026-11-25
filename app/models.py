from sqlalchemy import Column, String, Float, ForeignKey
from database import Base


class DBStudent(Base):
    __tablename__ = "students"
    student_id = Column(String(36), primary_key=True)
    student_name = Column(String(100), nullable=False)
    student_email = Column(String(255), nullable=False, unique=True)


class DBCourse(Base):
    __tablename__ = "courses"
    course_id = Column(String(36), primary_key=True)
    course_name = Column(String(100), nullable=False, unique=True)


class DBEnrollment(Base):
    __tablename__ = "enrollments"
    student_id = Column(
        String(36),
        ForeignKey("students.student_id"),
        ondelete="CASCADE",
        primary_key=True,
    )
    course_id = Column(
        String(36),
        ForeignKey("courses.course_id"),
        ondelete="CASCADE",
        primary_key=True,
    )
    grade = Column(Float)
