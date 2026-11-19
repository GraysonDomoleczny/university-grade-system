console.log("loaded");
document.addEventListener("DOMContentLoaded", () => {
	async function sendRequest(url, method = "GET", data = null) {
		return await fetch(url, {
			method: method,
			headers: { "Content-Type": "application/json" },
			...(data !== null && { body: JSON.stringify(data) }),
		});
	}

	function displayMessage(messageElement, message, isSuccess) {
		clearTimeout(messageElement.timeout);

		messageElement.textContent = message;
		messageElement.style.color = isSuccess ? "green" : "red";

		if (isSuccess) {
			setTimeout(() => {
				messageElement.textContent = "";
			}, 2000);
		}
	}

	// Student elements
	const studentCreateForm = document.getElementById("studentCreateForm");
	const studentCreateName = document.getElementById("studentCreateName");
	const studentCreateEmail = document.getElementById("studentCreateEmail");
	const studentCreateSubmit = document.getElementById("studentCreateSubmit");
	const studentCreateMessage = document.getElementById(
		"studentCreateMessage",
	);

	const studentDeleteForm = document.getElementById("studentDeleteForm");
	const studentDeleteEmail = document.getElementById("studentDeleteEmail");
	const studentDeleteSubmit = document.getElementById("studentDeleteSubmit");
	const studentDeleteMessage = document.getElementById(
		"studentDeleteMessage",
	);

	const studentPatchForm = document.getElementById("studentPatchForm");
	const studentPatchSelect = document.getElementById("studentPatchSelect");
	const studentPatchName = document.getElementById("studentPatchName");
	const studentPatchEmail = document.getElementById("studentPatchEmail");
	const studentPatchSubmit = document.getElementById("studentPatchSubmit");
	const studentPatchMessage = document.getElementById("studentPatchMessage");

	// Course elements
	const courseCreateForm = document.getElementById("courseCreateForm");
	const courseCreateName = document.getElementById("courseCreateName");
	const courseCreateSubmit = document.getElementById("courseCreateSubmit");
	const courseCreateMessage = document.getElementById("courseCreateMessage");

	const courseDeleteForm = document.getElementById("courseDeleteForm");
	const courseDeleteName = document.getElementById("courseDeleteName");
	const courseDeleteSubmit = document.getElementById("courseDeleteSubmit");
	const courseDeleteMessage = document.getElementById("courseDeleteMessage");

	const coursePatchForm = document.getElementById("coursePatchForm");
	const coursePatchSelect = document.getElementById("coursePatchSelect");
	const coursePatchName = document.getElementById("coursePatchName");
	const coursePatchSubmit = document.getElementById("coursePatchSubmit");
	const coursePatchMessage = document.getElementById("coursePatchMessage");

	// Enrollment elements
	const enrollmentCreateForm = document.getElementById(
		"enrollmentCreateForm",
	);
	const enrollmentCreateStudent = document.getElementById(
		"enrollmentCreateStudent",
	);
	const enrollmentCreateCourse = document.getElementById(
		"enrollmentCreateCourse",
	);
	const enrollmentCreateSubmit = document.getElementById(
		"enrollmentCreateSubmit",
	);
	const enrollmentCreateMessage = document.getElementById(
		"enrollmentCreateMessage",
	);

	const enrollmentDeleteForm = document.getElementById(
		"enrollmentDeleteForm",
	);
	const enrollmentDeleteStudent = document.getElementById(
		"enrollmentDeleteStudent",
	);
	const enrollmentDeleteCourse = document.getElementById(
		"enrollmentDeleteCourse",
	);
	const enrollmentDeleteSubmit = document.getElementById(
		"enrollmentDeleteSubmit",
	);
	const enrollmentDeleteMessage = document.getElementById(
		"enrollmentDeleteMessage",
	);

	// Grade elements
	const gradeCreateForm = document.getElementById("gradeCreateForm");
	const gradeCreateStudent = document.getElementById("gradeCreateStudent");
	const gradeCreateCourse = document.getElementById("gradeCreateCourse");
	const gradeCreateGrade = document.getElementById("gradeCreateGrade");
	const gradeCreateSubmit = document.getElementById("gradeCreateSubmit");
	const gradeCreateMessage = document.getElementById("gradeCreateMessage");

	const gradeDeleteForm = document.getElementById("gradeDeleteForm");
	const gradeDeleteStudent = document.getElementById("gradeDeleteStudent");
	const gradeDeleteCourse = document.getElementById("gradeDeleteCourse");
	const gradeDeleteSubmit = document.getElementById("gradeDeleteSubmit");
	const gradeDeleteMessage = document.getElementById("gradeDeleteMessage");

	const gradePatchForm = document.getElementById("gradePatchForm");
	const gradePatchSelectStudent = document.getElementById(
		"gradePatchSelectStudent",
	);
	const gradePatchSelectCourse = document.getElementById(
		"gradePatchSelectCourse",
	);
	const gradePatchGrade = document.getElementById("gradePatchGrade");
	const gradePatchSubmit = document.getElementById("gradePatchSubmit");
	const gradePatchMessage = document.getElementById("gradePatchMessage");

	// Student display
	const loadStudentsList = document.getElementById("loadStudentsList");
	const loadStudentsMessage = document.getElementById("loadStudentsMessage");

	studentCreateForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		console.log("Submit event fired");

		const student_name = studentCreateName.value;
		const student_email = studentCreateEmail.value;

		const response = await sendRequest("/students", "POST", {
			student_name,
			student_email,
		});

		const data = await response.json();

		displayMessage(
			studentCreateMessage,
			response.ok
				? "Successfully created student."
				: data.detail || "Failed to create student. Please try again.",
			response.ok,
		);

		if (response.ok) {
			studentCreateName.value = "";
			studentCreateEmail.value = "";
			await loadStudents();
		}
	});

	studentDeleteForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const student_email = studentDeleteEmail.value;

		const response = await sendRequest("/students", "DELETE", {
			student_email,
		});

		if (response.ok) {
			await loadStudents();
		}

		displayMessage(
			studentDeleteMessage,
			response.ok
				? "Successfully deleted student."
				: "Failed to delete student. Please try again.",
			response.ok,
		);
	});

	studentPatchForm.addEventListener("submit", async (event) => {
		event.preventDefault();
	});

	courseCreateForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const course_name = courseCreateName.value;

		const response = await sendRequest("/courses", "POST", { course_name });

		if (response.ok) {
			courseCreateName.value = "";
			await loadCourses();
		}

		displayMessage(
			courseCreateMessage,
			response.ok
				? "Successfully created course."
				: "Failed to create course. Please try again.",
			response.ok,
		);
	});

	courseDeleteForm.addEventListener("submit", async (event) => {
		event.preventDefault();
	});

	coursePatchForm.addEventListener("submit", async (event) => {
		event.preventDefault();
	});

	enrollmentCreateForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const student_email = enrollmentCreateStudent.value;
		const course_name = enrollmentCreateCourse.value;

		const response = await sendRequest("/enrollments", "POST", {
			student_email,
			course_name,
		});

		if (response.ok) {
			await loadStudents();
		}

		displayMessage(
			enrollmentCreateMessage,
			response.ok
				? "Successfully enrolled student."
				: "Failed to enroll student. Please try again.",
			response.ok,
		);
	});

	enrollmentDeleteForm.addEventListener("submit", async (event) => {
		event.preventDefault();
	});

	gradeCreateForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const student_email = gradeCreateStudent.value;
		const course_name = gradeCreateCourse.value;
		const grade = Number(gradeCreateGrade.value);

		const response = await sendRequest("/grades", "POST", {
			student_email,
			course_name,
			grade,
		});

		if (response.ok) {
			await loadStudents();
		}

		displayMessage(
			gradeCreateMessage,
			response.ok
				? "Successfully assigned grade."
				: "Failed to assign grade. Please try again.",
			response.ok,
		);
	});

	gradeDeleteForm.addEventListener("submit", async (event) => {
		event.preventDefault();
	});

	gradePatchForm.addEventListener("submit", async (event) => {
		event.preventDefault();
	});

	// async function loadStudents() {
	// 	function addStudentOption(student, dropdown) {
	// 		const option = document.createElement("option");
	// 		option.value = student.id;
	// 		option.textContent = student.name;
	// 		dropdown.appendChild(option);
	// 	}

	// 	const response = await sendRequest("/students");

	// 	if (response.ok) {
	// 		const students = await response.json();
	// 		students.sort((a, b) => a.name.localeCompare(b.name));

	// 		enrollmentStudentId.innerHTML = "";
	// 		gradeStudentId.innerHTML = "";
	// 		studentsList.innerHTML = "";
	// 		students.forEach((student) => {
	// 			addStudentOption(student, enrollmentStudentId);
	// 			addStudentOption(student, gradeStudentId);

	// 			const li = document.createElement("li");

	// 			const studentName = document.createElement("p");
	// 			studentName.textContent = student.name;
	// 			li.appendChild(studentName);

	// 			const studentEmail = document.createElement("p");
	// 			studentEmail.textContent = student.email;
	// 			li.appendChild(studentEmail);

	// 			student.enrollments.forEach((enrollment) => {
	// 				const studentEnrollment = document.createElement("p");
	// 				studentEnrollment.textContent = `${enrollment.course_name}: ${enrollment.grade ?? "Not graded"}`;
	// 				li.appendChild(studentEnrollment);
	// 			});

	// 			studentsList.appendChild(li);
	// 		});
	// 	}

	// 	displayMessage(
	// 		loadStudentsMessage,
	// 		response.ok
	// 			? "Successfully loaded students."
	// 			: "Failed to load students.",
	// 		response.ok,
	// 	);
	// }

	// async function loadCourses() {
	// 	function addCourseOption(course, dropdown) {
	// 		const option = document.createElement("option");
	// 		option.value = course.id;
	// 		option.textContent = course.name;
	// 		dropdown.appendChild(option);
	// 	}

	// 	const response = await sendRequest("/courses");

	// 	if (response.ok) {
	// 		const courses = await response.json();
	// 		courses.sort((a, b) => a.name.localeCompare(b.name));

	// 		enrollmentCourseId.innerHTML = "";
	// 		gradeCourseId.innerHTML = "";
	// 		courses.forEach((course) => {
	// 			addCourseOption(course, enrollmentCourseId);
	// 			addCourseOption(course, gradeCourseId);
	// 		});
	// 	}
	// }

	// loadStudents();
	// loadCourses();
});
