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

	function populateSelectsHelper(entities, dropdowns, placeholder) {
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
		const formattedGrade = grade.toFixed(2);

		if (grade >= 90) return `A - ${formattedGrade}%`;
		if (grade >= 80) return `B - ${formattedGrade}%`;
		if (grade >= 70) return `C - ${formattedGrade}%`;
		if (grade >= 60) return `D - ${formattedGrade}%`;

		return `F - ${formattedGrade}%`;
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
	const searchForm = document.getElementById("searchForm");
	const sortOrderStudent = document.getElementById("sortOrderStudent");
	const searchInputStudent = document.getElementById("searchInputStudent");
	const sortOrderGrade = document.getElementById("sortOrderGrade");
	const searchSelectGrade = document.getElementById("searchSelectGrade");
	const searchInputCourse = document.getElementById("searchInputCourse");
	const loadStudentsList = document.getElementById("loadStudentsList");
	const loadStudentsMessage = document.getElementById("loadStudentsMessage");

	const summaryCountGrades = document.getElementById("summaryCountGrades");
	const summaryAverageGrade = document.getElementById("summaryAverageGrade");
	const summaryGradeDistribution = document.getElementById(
		"summaryGradeDistribution",
	);
	const summaryMessage = document.getElementById("summaryMessage");

	sortOrderStudent.addEventListener("change", () => {
		if (sortOrderStudent.value !== "") {
			sortOrderGrade.value = "";
		} else if (sortOrderStudent.value === "") {
			sortOrderGrade.value = "desc";
		}
	});

	sortOrderGrade.addEventListener("change", () => {
		if (sortOrderGrade.value !== "") {
			sortOrderStudent.value = "";
		} else if (sortOrderGrade.value === "") {
			sortOrderStudent.value = "asc";
		}
	});

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

			await loadStudents(
				sortOrderStudent.value,
				searchInputStudent.value,
				sortOrderGrade.value,
				searchSelectGrade.value,
				searchInputCourse.value,
			);
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

		if (!studentDeleteSelect.value) {
			displayMessage(
				studentDeleteMessage,
				"Please select a student.",
				false,
			);
			return;
		}

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
			await Promise.all([
				loadStudents(
					sortOrderStudent.value,
					searchInputStudent.value,
					sortOrderGrade.value,
					searchSelectGrade.value,
					searchInputCourse.value,
				),
				populateSelects(),
				loadCourseSummary(),
			]);
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

		if (!studentPatchSelect.value) {
			displayMessage(
				studentPatchMessage,
				"Please select a student.",
				false,
			);
			return;
		}

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

			await Promise.all([
				loadStudents(
					sortOrderStudent.value,
					searchInputStudent.value,
					sortOrderGrade.value,
					searchSelectGrade.value,
					searchInputCourse.value,
				),
				populateSelects(),
			]);
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

			await populateSelects();
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

		if (!courseDeleteSelect.value) {
			displayMessage(
				courseDeleteMessage,
				"Please select a course.",
				false,
			);
			return;
		}

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
			await Promise.all([
				loadStudents(
					sortOrderStudent.value,
					searchInputStudent.value,
					sortOrderGrade.value,
					searchSelectGrade.value,
					searchInputCourse.value,
				),
				populateSelects(),
				loadCourseSummary(),
			]);
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

		if (!coursePatchSelect.value) {
			displayMessage(
				coursePatchMessage,
				"Please select a course.",
				false,
			);
			return;
		}

		const course_id = coursePatchSelect.value;
		const course_name = coursePatchName.value;

		const response = await sendRequest(`/courses/${course_id}`, "PATCH", {
			course_name,
		});
		const data = await response.json();

		if (response.ok) {
			coursePatchName.value = "";

			await Promise.all([
				loadStudents(
					sortOrderStudent.value,
					searchInputStudent.value,
					sortOrderGrade.value,
					searchSelectGrade.value,
					searchInputCourse.value,
				),
				populateSelects(),
			]);
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

		if (!enrollmentCreateSelectStudent.value) {
			displayMessage(
				enrollmentCreateMessage,
				"Please select a student.",
				false,
			);
			return;
		}

		if (!enrollmentCreateSelectCourse.value) {
			displayMessage(
				enrollmentCreateMessage,
				"Please select a course.",
				false,
			);
			return;
		}

		const student_id = enrollmentCreateSelectStudent.value;
		const course_id = enrollmentCreateSelectCourse.value;

		const response = await sendRequest("/enrollments", "POST", {
			student_id,
			course_id,
		});
		const data = await response.json();

		if (response.ok) {
			enrollmentCreateSelectStudent.value = "";
			enrollmentCreateSelectCourse.value = "";

			await loadStudents(
				sortOrderStudent.value,
				searchInputStudent.value,
				sortOrderGrade.value,
				searchSelectGrade.value,
				searchInputCourse.value,
			);
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

		if (!enrollmentDeleteSelectStudent.value) {
			displayMessage(
				enrollmentDeleteMessage,
				"Please select a student.",
				false,
			);
			return;
		}

		if (!enrollmentDeleteSelectCourse.value) {
			displayMessage(
				enrollmentDeleteMessage,
				"Please select a course.",
				false,
			);
			return;
		}

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
			await Promise.all([
				loadStudents(
					sortOrderStudent.value,
					searchInputStudent.value,
					sortOrderGrade.value,
					searchSelectGrade.value,
					searchInputCourse.value,
				),
				populateSelects(),
				loadCourseSummary(),
			]);
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

		if (!enrollmentPatchSelectStudent.value) {
			displayMessage(
				enrollmentPatchMessage,
				"Please select a student.",
				false,
			);
			return;
		}

		if (!enrollmentPatchSelectCourse.value) {
			displayMessage(
				enrollmentPatchMessage,
				"Please select a course.",
				false,
			);
			return;
		}

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
			await Promise.all([
				loadStudents(
					sortOrderStudent.value,
					searchInputStudent.value,
					sortOrderGrade.value,
					searchSelectGrade.value,
					searchInputCourse.value,
				),
				populateSelects(),
				loadCourseSummary(),
			]);
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
	searchForm.addEventListener("submit", async (event) => {
		event.preventDefault();

		loadStudents(
			sortOrderStudent.value,
			searchInputStudent.value,
			sortOrderGrade.value,
			searchSelectGrade.value,
			searchInputCourse.value,
		);
	});

	async function loadStudents(
		selectedSortOrderStudent = "",
		selectedSearchInputStudent = "",
		selectedSortOrderGrade = "",
		selectedSearchSelectGrade = "",
		selectedSearchInputCourse = "",
	) {
		const response = await sendRequest(
			`/students?` +
				`sort_order_student=${encodeURIComponent(selectedSortOrderStudent)}&` +
				`search_input_student=${encodeURIComponent(selectedSearchInputStudent)}&` +
				`sort_order_grade=${encodeURIComponent(selectedSortOrderGrade)}&` +
				`search_select_grade=${encodeURIComponent(selectedSearchSelectGrade)}&` +
				`search_input_course=${encodeURIComponent(selectedSearchInputCourse)}`,
		);
		const students = await response.json();

		if (response.ok) {
			loadStudentsList.innerHTML = "";

			students.forEach((student) => {
				const li = document.createElement("li");

				const studentName = document.createElement("p");
				studentName.textContent = student.name;
				li.appendChild(studentName);

				const studentEmail = document.createElement("p");
				studentEmail.textContent = student.email;
				li.appendChild(studentEmail);

				const courses = document.createElement("ul");

				student.enrollments.forEach((enrollment) => {
					const studentEnrollment = document.createElement("p");
					const gradeDisplay =
						enrollment.grade === null
							? "Not graded"
							: getLetterGrade(enrollment.grade);

					studentEnrollment.textContent = `${enrollment.course_name}: ${gradeDisplay}`;
					courses.appendChild(studentEnrollment);
				});
				li.appendChild(courses);

				const avgGrade = document.createElement("p");
				const avgDisplay =
					student.avg_grade === null
						? "N/A"
						: getLetterGrade(student.avg_grade);
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
				: "Failed to load students.",
			response.ok,
		);
	}

	async function populateSelects() {
		const studentResponse = await sendRequest("/students");
		const students = await studentResponse.json();

		const courseResponse = await sendRequest("/courses");
		const courses = await courseResponse.json();

		if (studentResponse.ok) {
			populateSelectsHelper(
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
		}

		if (courseResponse.ok) {
			populateSelectsHelper(
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
			summaryGradeDistribution.innerHTML = "";

			summaryCountGrades.textContent = `Total Graded Enrollments: ${courseSummary.count_grades}`;

			summaryAverageGrade.textContent =
				courseSummary.average_grade === null
					? "N/A"
					: `Average Grade: ${getLetterGrade(courseSummary.average_grade)}`;

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
				: "Failed to load course summary.",
			response.ok,
		);
	}

	loadStudents("asc", "", "", "all", "");
	populateSelects();
	loadCourseSummary();
});
