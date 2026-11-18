CREATE DATABASE IF NOT EXISTS grade_system;
USE grade_system;

CREATE TABLE students (
	student_id VARCHAR(36) PRIMARY KEY,
	student_name VARCHAR(100) NOT NULL,
	student_email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE courses (
	course_id VARCHAR(36) PRIMARY KEY,
	course_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE enrollments (
	student_id VARCHAR(36) NOT NULL,
	course_id VARCHAR(36) NOT NULL,
	grade FLOAT,
	PRIMARY KEY (student_id, course_id),
	CONSTRAINT fk_enrollment_student
		FOREIGN KEY (student_id) REFERENCES students(student_id),
	CONSTRAINT fk_enrollment_course
		FOREIGN KEY (course_id) REFERENCES courses(course_id)
);