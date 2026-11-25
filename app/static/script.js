import { sendRequest } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
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

	function populateSelects(entities, dropdowns, placeholder) {
		dropdowns.forEach((dropdown) => {
			dropdown.innerHTML = `<option value="" disabled selected>Select a ${placeholder}</option>`;

			entities.forEach((entity) => {
				const option = document.createElement("option");
				option.value = entity.id;
				option.textContent = entity.name;

				dropdown.appendChild(option);
			});
		});
	}

	function getLetterGrade(grade) {
		grade = grade.toFixed(2);

		if (grade >= 90) return `A - ${grade}%`;
		if (grade >= 80) return `B - ${grade}%`;
		if (grade >= 70) return `C - ${grade}%`;
		if (grade >= 60) return `D - ${grade}%`;

		return `F - ${grade}%`;
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

	const enrollmentPatchForm = document.getElementById("enrollmentPatchForm");
	const enrollmentPatchSelectStudent = document.getElementById(
		"enrollmentPatchSelectStudent",
	);
	const enrollmentPatchSelectCourse = document.getElementById(
		"enrollmentPatchSelectCourse",
	);
	const enrollmentPatchGrade = document.getElementById(
		"enrollmentPatchGrade",
	);
	const enrollmentPatchMessage = document.getElementById(
		"enrollmentPatchMessage",
	);

	// _________________________Display_________________________
	const studentSearchForm = document.getElementById("studentSearchForm");
	const studentSearchInput = document.getElementById("studentSearchInput");
	const loadStudentsList = document.getElementById("loadStudentsList");
	const loadStudentsMessage = document.getElementById("loadStudentsMessage");

	const summaryAverageGrade = document.getElementById("summaryAverageGrade");
	const summaryGradeDistribution = document.getElementById(
		"summaryGradeDistribution",
	);
	const summaryMessage = document.getElementById("summaryMessage");

	const studentFilterSelect = document.getElementById("studentFilterSelect");
	const studentFilterInput = document.getElementById("studentFilterInput");
	const studentFilterMessage = document.getElementById(
		"studentFilterMessage",
	);

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

		if (
			!confirm(`Are you sure you want to delete ${
				studentDeleteSelect.selectedOptions[0].textContent
			}
			?`)
		) {
			return;
		}

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

		if (
			!confirm(`Are you sure you want to delete ${
				courseDeleteSelect.selectedOptions[0].textContent
			}
			?`)
		) {
			return;
		}

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

		if (
			!confirm(
				`Are you sure you want to unenroll ${
					enrollmentDeleteSelectStudent.selectedOptions[0].textContent
				} from ${
					enrollmentDeleteSelectCourse.selectedOptions[0].textContent
				}?`,
			)
		) {
			return;
		}

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

	enrollmentPatchForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const student_id = enrollmentPatchSelectStudent.value;
		const course_id = enrollmentPatchSelectCourse.value;

		if (enrollmentPatchGrade.value.trim() === "") {
			displayMessage(enrollmentPatchMessage, "Grade is required.", false);
			return;
		}

		const grade = Number(enrollmentPatchGrade.value);

		const response = await sendRequest(
			`/enrollments/${student_id}/${course_id}`,
			"PATCH",
			{ grade },
		);
		const data = await response.json();

		if (response.ok) {
			await loadStudents();
		}

		displayMessage(
			enrollmentPatchMessage,
			response.ok
				? "Successfully updated grade."
				: data.detail || "Failed to update grade. Please try again.",
			response.ok,
		);
	});

	// _________________________Populate data_________________________
	studentSearchForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		const searchValue = studentSearchInput.value;

		loadStudents(searchValue);
	});

	async function loadStudents(searchValue = "") {
		const response = await sendRequest(
			`/students?search_value=${encodeURIComponent(searchValue)}`,
		);
		const students = await response.json();

		if (response.ok) {
			students.sort((a, b) => a.name.localeCompare(b.name));

			populateSelects(
				students,
				[
					studentDeleteSelect,
					studentPatchSelect,
					enrollmentCreateSelectStudent,
					enrollmentDeleteSelectStudent,
					enrollmentPatchSelectStudent,
				],
				"student",
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

				let gradeSum = 0;
				let gradeCount = 0;
				student.enrollments.forEach((enrollment) => {
					if (Number.isFinite(enrollment.grade)) {
						gradeSum += enrollment.grade;
						gradeCount++;
					}

					const studentEnrollment = document.createElement("p");
					const gradeDisplay =
						enrollment.grade === null
							? "Not graded"
							: getLetterGrade(enrollment.grade);

					studentEnrollment.textContent = `${enrollment.course_name}: ${gradeDisplay}`;
					li.appendChild(studentEnrollment);
				});

				const avgGrade = document.createElement("p");
				const avgDisplay =
					gradeCount === 0
						? "N/A"
						: getLetterGrade(gradeSum / gradeCount);

				avgGrade.textContent = `Average Grade: ${avgDisplay}`;
				li.appendChild(avgGrade);

				loadStudentsList.appendChild(li);
			});
		} else {
			loadStudentsList.innerHTML = "";
		}

		displayMessage(
			loadStudentsMessage,
			response.ok
				? "Successfully loaded students."
				: students.detail || "Failed to load students.",
			response.ok,
		);
	}

	async function loadCourses() {
		const response = await sendRequest("/courses");
		const courses = await response.json();

		if (response.ok) {
			courses.sort((a, b) => a.name.localeCompare(b.name));

			populateSelects(
				courses,
				[
					courseDeleteSelect,
					coursePatchSelect,
					enrollmentCreateSelectCourse,
					enrollmentDeleteSelectCourse,
					enrollmentPatchSelectCourse,
				],
				"course",
			);
		}
	}

	async function loadCourseSummary() {
		const response = await sendRequest("/courses/summary");
		const courseSummary = await response.json();

		if (response.ok) {
			summaryAverageGrade.textContent = "";
			summaryGradeDistribution.textContent = "";

			summaryAverageGrade.textContent = `Average Grade: ${
				courseSummary.average_grade
			}%`;

			courseSummary.grade_distribution.forEach((grade) => {
				const li = document.createElement("li");
				li.textContent = grade;
				summaryGradeDistribution.appendChild(li);
			});
		}

		displayMessage(
			summaryMessage,
			response.ok
				? "Successfully loaded course summary."
				: courseSummary.detail || "Failed to load course summary.",
			response.ok,
		);
	}

	loadStudents();
	loadCourses();
	loadCourseSummary();
});
