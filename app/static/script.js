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
			messageElement.timeout = setTimeout(() => {
				messageElement.textContent = "";
			}, 2000);
		}
	}

	function populateSelects(entities, dropdowns) {
		dropdowns.forEach((dropdown) => {
			dropdown.innerHTML = "";

			entities.forEach((entity) => {
				const option = document.createElement("option");
				option.value = entity.id;
				option.textContent = entity.name;

				dropdown.appendChild(option);
			});
		});
	}

	// _________________________Student elements_________________________
	const studentCreateForm = document.getElementById("studentCreateForm");
	const studentCreateName = document.getElementById("studentCreateName");
	const studentCreateEmail = document.getElementById("studentCreateEmail");
	const studentCreateMessage = document.getElementById(
		"studentCreateMessage",
	);

	const studentDeleteForm = document.getElementById("studentDeleteForm");
	const studentDeleteSelect = document.getElementById("studentDeleteSelect");
	const studentDeleteMessage = document.getElementById(
		"studentDeleteMessage",
	);

	const studentPatchForm = document.getElementById("studentPatchForm");
	const studentPatchSelect = document.getElementById("studentPatchSelect");
	const studentPatchName = document.getElementById("studentPatchName");
	const studentPatchEmail = document.getElementById("studentPatchEmail");
	const studentPatchMessage = document.getElementById("studentPatchMessage");

	// _________________________Course elements_________________________
	const courseCreateForm = document.getElementById("courseCreateForm");
	const courseCreateName = document.getElementById("courseCreateName");
	const courseCreateMessage = document.getElementById("courseCreateMessage");

	const courseDeleteForm = document.getElementById("courseDeleteForm");
	const courseDeleteSelect = document.getElementById("courseDeleteSelect");
	const courseDeleteMessage = document.getElementById("courseDeleteMessage");

	const coursePatchForm = document.getElementById("coursePatchForm");
	const coursePatchSelect = document.getElementById("coursePatchSelect");
	const coursePatchName = document.getElementById("coursePatchName");
	const coursePatchMessage = document.getElementById("coursePatchMessage");

	// _________________________Enrollment elements_________________________
	const enrollmentCreateForm = document.getElementById(
		"enrollmentCreateForm",
	);
	const enrollmentCreateSelectStudent = document.getElementById(
		"enrollmentCreateSelectStudent",
	);
	const enrollmentCreateSelectCourse = document.getElementById(
		"enrollmentCreateSelectCourse",
	);
	const enrollmentCreateMessage = document.getElementById(
		"enrollmentCreateMessage",
	);

	const enrollmentDeleteForm = document.getElementById(
		"enrollmentDeleteForm",
	);
	const enrollmentDeleteSelectStudent = document.getElementById(
		"enrollmentDeleteSelectStudent",
	);
	const enrollmentDeleteSelectCourse = document.getElementById(
		"enrollmentDeleteSelectCourse",
	);
	const enrollmentDeleteMessage = document.getElementById(
		"enrollmentDeleteMessage",
	);

	// _________________________Grade elements_________________________
	const gradeCreateForm = document.getElementById("gradeCreateForm");
	const gradeCreateSelectStudent = document.getElementById(
		"gradeCreateSelectStudent",
	);
	const gradeCreateSelectCourse = document.getElementById(
		"gradeCreateSelectCourse",
	);
	const gradeCreateGrade = document.getElementById("gradeCreateGrade");
	const gradeCreateMessage = document.getElementById("gradeCreateMessage");

	const gradeDeleteForm = document.getElementById("gradeDeleteForm");
	const gradeDeleteSelectStudent = document.getElementById(
		"gradeDeleteSelectStudent",
	);
	const gradeDeleteSelectCourse = document.getElementById(
		"gradeDeleteSelectCourse",
	);
	const gradeDeleteMessage = document.getElementById("gradeDeleteMessage");

	const gradePatchForm = document.getElementById("gradePatchForm");
	const gradePatchSelectStudent = document.getElementById(
		"gradePatchSelectStudent",
	);
	const gradePatchSelectCourse = document.getElementById(
		"gradePatchSelectCourse",
	);
	const gradePatchGrade = document.getElementById("gradePatchGrade");
	const gradePatchMessage = document.getElementById("gradePatchMessage");

	// _________________________Student display_________________________
	const loadStudentsList = document.getElementById("loadStudentsList");
	const loadStudentsMessage = document.getElementById("loadStudentsMessage");

	// _________________________Student endpoints_________________________
	studentCreateForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const student_name = studentCreateName.value;
		const student_email = studentCreateEmail.value;

		const response = await sendRequest("/students", "POST", {
			student_name,
			student_email,
		});

		const data = await response.json();

		if (response.ok) {
			studentCreateName.value = "";
			studentCreateEmail.value = "";
			await loadStudents();
		}

		displayMessage(
			studentCreateMessage,
			response.ok
				? "Successfully created student."
				: data.detail || "Failed to create student. Please try again.",
			response.ok,
		);
	});

	studentDeleteForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const student_id = studentDeleteSelect.value;

		const response = await sendRequest(`/students/${student_id}`, "DELETE");

		const data = await response.json();

		if (response.ok) {
			await loadStudents();
		}

		displayMessage(
			studentDeleteMessage,
			response.ok
				? "Successfully deleted student."
				: data.detail || "Failed to delete student. Please try again.",
			response.ok,
		);
	});

	studentPatchForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const student_id = studentPatchSelect.value;
		const student_name = studentPatchName.value;
		const student_email = studentPatchEmail.value;

		if (student_name.trim() === "" && student_email.trim() === "") {
			displayMessage(
				studentPatchMessage,
				"Enter a name, an email, or both.",
				false,
			);
			return;
		}

		const response = await sendRequest(`/students/${student_id}`, "PATCH", {
			student_name,
			student_email,
		});

		const data = await response.json();

		if (response.ok) {
			studentPatchName.value = "";
			studentPatchEmail.value = "";
			await loadStudents();
		}

		displayMessage(
			studentPatchMessage,
			response.ok
				? "Successfully updated student."
				: data.detail || "Failed to update student. Please try again.",
			response.ok,
		);
	});

	// _________________________Course endpoints_________________________
	courseCreateForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const course_name = courseCreateName.value;

		const response = await sendRequest("/courses", "POST", { course_name });

		const data = await response.json();

		if (response.ok) {
			courseCreateName.value = "";
			await loadCourses();
		}

		displayMessage(
			courseCreateMessage,
			response.ok
				? "Successfully created course."
				: data.detail || "Failed to create course. Please try again.",
			response.ok,
		);
	});

	courseDeleteForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const course_id = courseDeleteSelect.value;

		const response = await sendRequest(`/courses/${course_id}`, "DELETE");

		const data = await response.json();

		if (response.ok) {
			await Promise.all([loadCourses(), loadStudents()]);
		}

		displayMessage(
			courseDeleteMessage,
			response.ok
				? "Successfully deleted course."
				: data.detail || "Failed to delete course. Please try again.",
			response.ok,
		);
	});

	coursePatchForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const course_id = coursePatchSelect.value;
		const course_name = coursePatchName.value;

		const response = await sendRequest(`/courses/${course_id}`, "PATCH", {
			course_name,
		});

		const data = await response.json();

		if (response.ok) {
			coursePatchName.value = "";
			await Promise.all([loadCourses(), loadStudents()]);
		}

		displayMessage(
			coursePatchMessage,
			response.ok
				? "Successfully updated course."
				: data.detail || "Failed to update course. Please try again.",
			response.ok,
		);
	});

	// _________________________Enrollment endpoints_________________________
	enrollmentCreateForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const student_id = enrollmentCreateSelectStudent.value;
		const course_id = enrollmentCreateSelectCourse.value;

		const response = await sendRequest("/enrollments", "POST", {
			student_id,
			course_id,
		});

		const data = await response.json();

		if (response.ok) {
			await loadStudents();
		}

		displayMessage(
			enrollmentCreateMessage,
			response.ok
				? "Successfully enrolled student."
				: data.detail || "Failed to enroll student. Please try again.",
			response.ok,
		);
	});

	enrollmentDeleteForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const student_id = enrollmentDeleteSelectStudent.value;
		const course_id = enrollmentDeleteSelectCourse.value;

		const response = await sendRequest(
			`/enrollments/${student_id}/${course_id}`,
			"DELETE",
		);

		const data = await response.json();

		if (response.ok) {
			await loadStudents();
		}

		displayMessage(
			enrollmentDeleteMessage,
			response.ok
				? "Successfully unenrolled student."
				: data.detail ||
						"Failed to unenroll student. Please try again.",
			response.ok,
		);
	});

	// _________________________Grade endpoints_________________________
	gradeCreateForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const student_id = gradeCreateSelectStudent.value;
		const course_id = gradeCreateSelectCourse.value;
		const grade = Number(gradeCreateGrade.value);

		const response = await sendRequest("/grades", "POST", {
			student_id,
			course_id,
			grade,
		});

		const data = await response.json();

		if (response.ok) {
			gradeCreateGrade.value = "";
			await loadStudents();
		}

		displayMessage(
			gradeCreateMessage,
			response.ok
				? "Successfully assigned grade."
				: data.detail || "Failed to assign grade. Please try again.",
			response.ok,
		);
	});

	gradeDeleteForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const student_id = gradeDeleteSelectStudent.value;
		const course_id = gradeDeleteSelectCourse.value;

		const response = await sendRequest(
			`/grades/${student_id}/${course_id}`,
			"DELETE",
		);

		const data = await response.json();

		if (response.ok) {
			await loadStudents();
		}

		displayMessage(
			gradeDeleteMessage,
			response.ok
				? "Successfully deleted grade."
				: data.detail || "Failed to delete grade. Please try again.",
			response.ok,
		);
	});

	gradePatchForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const student_id = gradePatchSelectStudent.value;
		const course_id = gradePatchSelectCourse.value;
		const grade = Number(gradePatchGrade.value);

		const response = await sendRequest(
			`/grades/${student_id}/${course_id}`,
			"PATCH",
			{ grade },
		);

		const data = await response.json();

		if (response.ok) {
			await loadStudents();
		}

		displayMessage(
			gradePatchMessage,
			response.ok
				? "Successfully updated grade."
				: data.detail || "Failed to update grade. Please try again.",
			response.ok,
		);
	});

	async function loadStudents() {
		const response = await sendRequest("/students");

		if (response.ok) {
			const students = await response.json();

			students.sort((a, b) => a.name.localeCompare(b.name));

			populateSelects(
				students,
				(studentSelects = [
					studentDeleteSelect,
					studentPatchSelect,
					enrollmentCreateSelectStudent,
					enrollmentDeleteSelectStudent,
					gradeCreateSelectStudent,
					gradeDeleteSelectStudent,
					gradePatchSelectStudent,
				]),
			);

			loadStudentsList.innerHTML = "";

			students.forEach((student) => {
				const li = document.createElement("li");

				const studentName = document.createElement("p");
				studentName.textContent = student.name;
				li.appendChild(studentName);

				const studentEmail = document.createElement("p");
				studentEmail.textContent = student.email;
				li.appendChild(studentEmail);

				student.enrollments.forEach((enrollment) => {
					const studentEnrollment = document.createElement("p");
					studentEnrollment.textContent = `${enrollment.course_name}: ${enrollment.grade ?? "Not graded"}`;
					li.appendChild(studentEnrollment);
				});

				loadStudentsList.appendChild(li);
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
		const response = await sendRequest("/courses");

		if (response.ok) {
			const courses = await response.json();

			courses.sort((a, b) => a.name.localeCompare(b.name));

			populateSelects(
				courses,
				(courseSelects = [
					courseDeleteSelect,
					coursePatchSelect,
					enrollmentCreateSelectCourse,
					enrollmentDeleteSelectCourse,
					gradeCreateSelectCourse,
					gradeDeleteSelectCourse,
					gradePatchSelectCourse,
				]),
			);
		}
	}

	loadStudents();
	loadCourses();
});
