document.addEventListener("DOMContentLoaded", () => {
	const studentName = document.getElementById("studentName");
	const studentEmail = document.getElementById("studentEmail");
	const createStudentForm = document.getElementById("createStudentForm");
	const createStudentError = document.getElementById("createStudentError");
	const loadStudentsError = document.getElementById("loadStudentsError");
	const studentsList = document.getElementById("studentsList");

	createStudentForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		const name = studentName.value;
		const email = studentEmail.value;

		const response = await fetch("http://127.0.0.1:8000/students", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: name, email: email }),
		});
		if (response.ok) {
			createStudentError.textContent = "";
			await loadStudents();
		} else {
			createStudentError.textContent =
				"Failed to create student. Please try again.";
		}
	});

	async function loadStudents() {
		const response = await fetch("http://127.0.0.1:8000/students", {
			method: "GET",
		});
		if (response.ok) {
			loadStudentsError.textContent = "";
			studentsList.textContent = "";

			const students = await response.json();
			students.forEach((student) => {
				const li = document.createElement("li");
				li.textContent = student.name;
				studentsList.appendChild(li);
			});
		} else {
			loadStudentsError.textContent =
				"Failed to load students. Please try again.";
		}
	}
	loadStudents();
});
