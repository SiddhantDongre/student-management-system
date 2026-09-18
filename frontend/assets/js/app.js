const API_BASE_URL = "http://127.0.0.1:8000";

const elements = {
  tableBody: document.getElementById("studentTableBody"),
  totalStudents: document.getElementById("totalStudents"),
  averageMarks: document.getElementById("averageMarks"),
  highestMarks: document.getElementById("highestMarks"),
  passingStudents: document.getElementById("passingStudents"),
  recordCount: document.getElementById("recordCount"),
  searchInput: document.getElementById("searchInput"),
  refreshButton: document.getElementById("refreshButton"),
  addStudentButton: document.getElementById("addStudentButton"),

  studentModal: document.getElementById("studentModal"),
  closeModal: document.getElementById("closeModal"),
  cancelButton: document.getElementById("cancelButton"),
  studentForm: document.getElementById("studentForm"),
  studentId: document.getElementById("studentId"),
  studentName: document.getElementById("studentName"),
  studentCourse: document.getElementById("studentCourse"),
  studentMarks: document.getElementById("studentMarks"),
  modalTitle: document.getElementById("modalTitle"),
  modalKicker: document.getElementById("modalKicker"),
  modalDescription: document.getElementById("modalDescription"),
  saveButton: document.getElementById("saveButton"),

  deleteModal: document.getElementById("deleteModal"),
  deleteMessage: document.getElementById("deleteMessage"),
  cancelDelete: document.getElementById("cancelDelete"),
  confirmDelete: document.getElementById("confirmDelete"),

  toast: document.getElementById("toast"),
  toastMessage: document.getElementById("toastMessage"),
};

let students = [];
let deleteTargetId = null;

function unwrapStudents(result) {
  if (Array.isArray(result)) return result;
  if (result && Array.isArray(result.data)) return result.data;
  return [];
}

function showToast(message, type = "success") {
  elements.toastMessage.textContent = message;
  elements.toast.classList.toggle("error", type === "error");
  elements.toast.classList.add("show");

  setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2600);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || "")
    .join("") || "?";
}

function performance(marks) {
  const value = Number(marks);

  if (value >= 75) {
    return { label: "Excellent", className: "performance-excellent" };
  }

  if (value >= 60) {
    return { label: "Good", className: "performance-good" };
  }

  if (value >= 40) {
    return { label: "Average", className: "performance-average" };
  }

  return { label: "Needs Attention", className: "performance-low" };
}

function updateMetrics(data) {
  const marks = data.map(student => Number(student.marks) || 0);

  elements.totalStudents.textContent = data.length;

  if (data.length === 0) {
    elements.averageMarks.textContent = "0";
    elements.highestMarks.textContent = "0";
    elements.passingStudents.textContent = "0";
    return;
  }

  const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;

  elements.averageMarks.textContent = average.toFixed(1);
  elements.highestMarks.textContent = Math.max(...marks);
  elements.passingStudents.textContent = marks.filter(mark => mark >= 40).length;
}

function renderStudents(data) {
  elements.recordCount.textContent =
    `Showing ${data.length} student${data.length === 1 ? "" : "s"}`;

  if (data.length === 0) {
    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">
          No student records found.
        </td>
      </tr>
    `;
    return;
  }

  elements.tableBody.innerHTML = data.map(student => {
    const perf = performance(student.marks);

    return `
      <tr>
        <td>
          <div class="student-cell">
            <div class="student-avatar">${escapeHtml(initials(student.name))}</div>
            <div>
              <strong>${escapeHtml(student.name)}</strong>
              <span>Student record</span>
            </div>
          </div>
        </td>
        <td>
          <span class="course-pill">${escapeHtml(student.course)}</span>
        </td>
        <td><strong>${escapeHtml(student.marks)}</strong> / 100</td>
        <td>
          <span class="performance-pill ${perf.className}">
            ${perf.label}
          </span>
        </td>
        <td>#${escapeHtml(student.id)}</td>
        <td>
          <div class="action-group">
            <button class="action-btn" onclick="openEditModal(${Number(student.id)})">
              Edit
            </button>
            <button class="action-btn delete" onclick="openDeleteModal(${Number(student.id)})">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function loadStudents(showSuccess = false) {
  elements.tableBody.innerHTML = `
    <tr>
      <td colspan="6" class="loading-cell">
        <div class="spinner"></div>
        Loading student records...
      </td>
    </tr>
  `;

  try {
    const response = await fetch(`${API_BASE_URL}/students`);

    if (!response.ok) {
      const problem = await response.json().catch(() => ({}));
      throw new Error(problem.detail || "Unable to fetch students");
    }

    const result = await response.json();
    students = unwrapStudents(result);

    renderStudents(students);
    updateMetrics(students);

    if (showSuccess) {
      showToast("Student records refreshed");
    }
  } catch (error) {
    console.error(error);

    elements.tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cell">
          Backend connection failed. Run FastAPI on port 8000.
        </td>
      </tr>
    `;

    elements.recordCount.textContent = "Backend unavailable";
    showToast(error.message || "Could not connect to FastAPI", "error");
  }
}

function openCreateModal() {
  elements.studentForm.reset();
  elements.studentId.value = "";
  elements.modalKicker.textContent = "NEW STUDENT";
  elements.modalTitle.textContent = "Add Student";
  elements.modalDescription.textContent = "Enter student information below.";
  elements.saveButton.textContent = "Save Student";
  elements.studentModal.classList.remove("hidden");
  elements.studentName.focus();
}

window.openEditModal = function(id) {
  const student = students.find(item => Number(item.id) === Number(id));

  if (!student) {
    showToast("Student not found", "error");
    return;
  }

  elements.studentId.value = student.id;
  elements.studentName.value = student.name || "";
  elements.studentCourse.value = student.course || "";
  elements.studentMarks.value = student.marks ?? "";

  elements.modalKicker.textContent = `STUDENT #${student.id}`;
  elements.modalTitle.textContent = "Update Student";
  elements.modalDescription.textContent = "Edit the selected student record.";
  elements.saveButton.textContent = "Update Student";

  elements.studentModal.classList.remove("hidden");
  elements.studentName.focus();
};

function closeStudentModal() {
  elements.studentModal.classList.add("hidden");
}

window.openDeleteModal = function(id) {
  const student = students.find(item => Number(item.id) === Number(id));
  deleteTargetId = id;

  elements.deleteMessage.textContent = student
    ? `You are about to permanently delete ${student.name}.`
    : "This student record will be permanently deleted.";

  elements.deleteModal.classList.remove("hidden");
};

function closeDeleteModal() {
  deleteTargetId = null;
  elements.deleteModal.classList.add("hidden");
}

elements.studentForm.addEventListener("submit", async event => {
  event.preventDefault();

  const id = elements.studentId.value;
  const name = elements.studentName.value.trim();
  const course = elements.studentCourse.value.trim();
  const marks = Number(elements.studentMarks.value);

  if (!name || !course || Number.isNaN(marks)) {
    showToast("Please complete every field", "error");
    return;
  }

  if (marks < 0 || marks > 100) {
    showToast("Marks must be between 0 and 100", "error");
    return;
  }

  const params = new URLSearchParams({
    name,
    course,
    marks: String(marks),
  });

  const isEditing = Boolean(id);
  const endpoint = isEditing
    ? `${API_BASE_URL}/students/${id}?${params.toString()}`
    : `${API_BASE_URL}/students?${params.toString()}`;

  try {
    elements.saveButton.disabled = true;
    elements.saveButton.textContent = isEditing ? "Updating..." : "Saving...";

    const response = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.detail || "Request failed");
    }

    closeStudentModal();
    showToast(isEditing ? "Student updated successfully" : "Student added successfully");
    await loadStudents();
  } catch (error) {
    console.error(error);
    showToast(error.message || "Could not save student", "error");
  } finally {
    elements.saveButton.disabled = false;
    elements.saveButton.textContent = isEditing ? "Update Student" : "Save Student";
  }
});

elements.confirmDelete.addEventListener("click", async () => {
  if (deleteTargetId === null) return;

  try {
    elements.confirmDelete.disabled = true;
    elements.confirmDelete.textContent = "Deleting...";

    const response = await fetch(
      `${API_BASE_URL}/students/${deleteTargetId}`,
      { method: "DELETE" }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.detail || "Delete failed");
    }

    closeDeleteModal();
    showToast("Student deleted successfully");
    await loadStudents();
  } catch (error) {
    console.error(error);
    showToast(error.message || "Could not delete student", "error");
  } finally {
    elements.confirmDelete.disabled = false;
    elements.confirmDelete.textContent = "Delete Student";
  }
});

elements.searchInput.addEventListener("input", () => {
  const query = elements.searchInput.value.trim().toLowerCase();

  const filtered = students.filter(student => {
    return (
      String(student.name || "").toLowerCase().includes(query) ||
      String(student.course || "").toLowerCase().includes(query) ||
      String(student.id || "").toLowerCase().includes(query) ||
      String(student.marks ?? "").toLowerCase().includes(query)
    );
  });

  renderStudents(filtered);
});

elements.addStudentButton.addEventListener("click", openCreateModal);
elements.refreshButton.addEventListener("click", () => loadStudents(true));
elements.closeModal.addEventListener("click", closeStudentModal);
elements.cancelButton.addEventListener("click", closeStudentModal);
elements.cancelDelete.addEventListener("click", closeDeleteModal);

elements.studentModal.addEventListener("click", event => {
  if (event.target === elements.studentModal) {
    closeStudentModal();
  }
});

elements.deleteModal.addEventListener("click", event => {
  if (event.target === elements.deleteModal) {
    closeDeleteModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeStudentModal();
    closeDeleteModal();
  }
});

loadStudents();
