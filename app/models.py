from sqlalchemy import Column, String, Float, ForeignKey
from database import Base


class Student(Base):
    __tablename__ = "students"
    student_id = Column(String(36), primary_key=True)
    student_name = Column(String(100), nullable=False)
    student_email = Column(String(255), nullable=False, unique=True)


class Course(Base):
    __tablename__ = "courses"
    course_id = Column(String(36), primary_key=True)
    course_name = Column(String(100), nullable=False, unique=True)


class Enrollment(Base):
    __tablename__ = "enrollments"
    student_id = Column(String(36), ForeignKey("students.student_id"), primary_key=True)
    course_id = Column(String(36), ForeignKey("courses.course_id"), primary_key=True)
    grade = Column(Float)
