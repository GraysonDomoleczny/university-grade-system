document.addEventListener("DOMContentLoaded", () => {
	async function sendRequest(url, method, data) {
		return await fetch(url, {
			method: method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
	}

	function displayMessage(messageElement, message, isSuccess) {
		messageElement.textContent = message;
		if (isSuccess) {
			setTimeout(() => {
				messageElement.textContent = "";
			}, 2000);
			messageElement.style.color = "green";
		} else {
			messageElement.textContent = message;
			messageElement.style.color = "red";
		}
	}

	const createStudentForm = document.getElementById("createStudentForm");
	const studentName = document.getElementById("studentName");
	const studentEmail = document.getElementById("studentEmail");
	const createStudentMessage = document.getElementById(
		"createStudentMessage",
	);

	const createCourseForm = document.getElementById("createCourseForm");
	const courseName = document.getElementById("courseName");
	const createCourseMessage = document.getElementById("createCourseMessage");

	const createEnrollmentForm = document.getElementById(
		"createEnrollmentForm",
	);
	const enrollmentStudentId = document.getElementById("enrollmentStudentId");
	const enrollmentCourseId = document.getElementById("enrollmentCourseId");
	const createEnrollmentMessage = document.getElementById(
		"createEnrollmentMessage",
	);

	const createGradeForm = document.getElementById("createGradeForm");
	const gradeStudentId = document.getElementById("gradeStudentId");
	const gradeCourseId = document.getElementById("gradeCourseId");
	const gradeEntry = document.getElementById("gradeEntry");
	const createGradeMessage = document.getElementById("createGradeMessage");

	const loadStudentsMessage = document.getElementById("loadStudentsMessage");
	const studentsList = document.getElementById("studentsList");

	createStudentForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const name = studentName.value;
		const email = studentEmail.value;

		const response = await sendRequest("/students", "POST", {
			name,
			email,
		});

		if (response.ok) {
			studentName.value = "";
			studentEmail.value = "";
			await loadStudents();
		}

		displayMessage(
			createStudentMessage,
			response.ok
				? "Successfully created student."
				: "Failed to create student. Please try again.",
			response.ok,
		);
	});

	createCourseForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const name = courseName.value;

		const response = await sendRequest("/courses", "POST", { name });

		if (response.ok) {
			courseName.value = "";
			await loadCourses();
		}

		displayMessage(
			createCourseMessage,
			response.ok
				? "Successfully created course."
				: "Failed to create course. Please try again.",
			response.ok,
		);
	});

	createEnrollmentForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const student_id = enrollmentStudentId.value;
		const course_id = enrollmentCourseId.value;

		const response = await sendRequest("/enrollments", "POST", {
			student_id,
			course_id,
		});

		displayMessage(
			createEnrollmentMessage,
			response.ok
				? "Successfully enrolled student."
				: "Failed to enroll student. Please try again.",
			response.ok,
		);
	});

	createGradeForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const student_id = gradeStudentId.value;
		const course_id = gradeCourseId.value;
		const grade = Number(gradeEntry.value);

		const response = await sendRequest("/grades", "POST", {
			student_id,
			course_id,
			grade,
		});

		displayMessage(
			createGradeMessage,
			response.ok
				? "Successfully assigned grade."
				: "Failed to assign grade. Please try again.",
			response.ok,
		);
	});

	async function loadStudents() {
		function addStudentOption(student, dropdown) {
			const option = document.createElement("option");
			option.value = student.id;
			option.textContent = student.name;
			dropdown.appendChild(option);
		}

		const response = await sendRequest("/students");

		if (response.ok) {
			const students = await response.json();
			students.sort((a, b) => a.name.localeCompare(b.name));

			enrollmentStudentId.innerHTML = "";
			gradeStudentId.innerHTML = "";
			studentsList.innerHTML = "";
			students.forEach((student) => {
				addStudentOption(student, enrollmentStudentId);
				addStudentOption(student, gradeStudentId);

				const li = document.createElement("li");
				li.textContent = student.name;
				studentsList.appendChild(li);
			});
		}

		displayMessage(
			loadStudentsMessage,
			response.ok
				? "Successfully loaded students."
				: "Failed to load students.",
			response.ok,
		);
	}

	async function loadCourses() {
		function addCourseOption(course, dropdown) {
			const option = document.createElement("option");
			option.value = course.id;
			option.textContent = course.name;
			dropdown.appendChild(option);
		}

		const response = await sendRequest("/courses");

		if (response.ok) {
			const courses = await response.json();
			courses.sort((a, b) => a.name.localeCompare(b.name));

			enrollmentCourseId.innerHTML = "";
			gradeCourseId.innerHTML = "";
			courses.forEach((course) => {
				addCourseOption(course, enrollmentCourseId);
				addCourseOption(course, gradeCourseId);
			});
		}
	}

	loadStudents();
	loadCourses();
});
