import { getList, create, update, remove, getById } from "./api.js";
import Student from "./models/Student.js";
import { renderTable, updatePaginationUI } from "./ui.js";

let state = {
	page: 1,
	limit: 5,
	q: "",
	sort: "",
	order: "asc",
	editingId: null,
	totalCount: 0
};

const tableBody = document.getElementById("tableBody");
const searchInput = document.getElementById("searchInput");
const btnClear = document.getElementById("btnClear");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const pageIndicator = document.getElementById("pageIndicator");
const pageSize = document.getElementById("pageSize");
const btnAddNew = document.getElementById("btnAddNew");
const formWrap = document.getElementById("formWrap");
const dataForm = document.getElementById("dataForm");
const btnCancel = document.getElementById("btnCancel");
const fieldFullName = document.getElementById("fieldFullName");
const fieldEmail = document.getElementById("fieldEmail");
const fieldPhone = document.getElementById("fieldPhone");
const fieldGender = document.getElementById("fieldGender");
const fieldDob = document.getElementById("fieldDob");
const fieldDept = document.getElementById("fieldDept");
const fieldLevel = document.getElementById("fieldLevel");
const fieldGpa = document.getElementById("fieldGpa");

if (pageSize) {
	state.limit = Number(pageSize.value) || 5;
	pageSize.addEventListener("change", function () {
		var newLimit = Number(this.value);
		if (!newLimit || newLimit <= 0) return;
		state.limit = newLimit;
		state.page = 1;
		loadData();
	});
}

if (btnAddNew) {
	btnAddNew.addEventListener("click", function () {
		state.editingId = null;
		dataForm.reset();
		formWrap.style.display = "block";
		fieldFullName.focus();
	});
}

if (searchInput) {
	searchInput.addEventListener("input", function () {
		state.q = searchInput.value;
		state.page = 1;
		loadData();
	});
}

if (btnCancel) {
	btnCancel.addEventListener("click", function () {
		dataForm.reset();
		state.editingId = null;
		formWrap.style.display = "none";
	});
}
if (btnClear) {
	btnClear.addEventListener("click", function () {
		searchInput.value = "";
		state.q = "";
		state.page = 1;
		loadData();
	});
}

if (btnPrev) {
	btnPrev.addEventListener("click", function () {
		if (state.page > 1) {
			state.page--;
			loadData();
		}
	});
}

if (btnNext) {
	btnNext.addEventListener("click", function () {
		state.page++;
		loadData();
	});
}

async function loadData() {
	const q = state.q.trim().toLowerCase();

	const result = await getList("students", "");
	const all = result.data;
	let filtered = all;
	if (q) {
		filtered = all.filter(function (s) {
			return (
				String(s.fullName || "").toLowerCase().startsWith(q) ||
				String(s.email || "").toLowerCase().startsWith(q) ||
				String(s.phone || "").toLowerCase().startsWith(q) ||
				String(s.department || "").toLowerCase().startsWith(q)
			);
		});
	}

	state.totalCount = filtered.length;
	const start = (state.page - 1) * state.limit;
	const end = start + state.limit;
	const pageData = filtered.slice(start, end);

	renderTable(tableBody, pageData, [
		"id",
		"fullName",
		"email",
		"phone",
		"gender",
		"dob",
		"department",
		"level",
		"gpa"
	]);

	updatePaginationUI(pageIndicator, btnPrev, btnNext, state);
}

if (formWrap) {
	formWrap.addEventListener("submit", async function (e) {
		e.preventDefault();
		const student = new Student(
			fieldFullName.value.trim(),
			fieldEmail.value.trim(),
			fieldPhone.value.trim(),
			fieldGender.value,
			fieldDob.value,
			fieldDept.value.trim(),
			fieldLevel.value,
			fieldGpa.value
		);

		const error = student.validate();
		if (error) return alert(error);

		if (state.editingId === null) {
			const result = await getList("students", "");
			const lastStudent = result.data[result.data.length - 1];
			const nextId = lastStudent ? Number(lastStudent.id) + 1 : 1;
			const newStudent = {
				id: nextId,
				...student.toJSON()
			};
			await create("students", newStudent);
		}
		formWrap.reset();
		loadData();
	});
}

if (tableBody) {
	tableBody.addEventListener("click", async function (e) {
		const btn = e.target;
		const id = btn.dataset.id;
		if (!id) return;

		formWrap.style.display = "grid"
		if (btn.classList.contains("edit-btn")) {
			const s = await getById("students", id);
			state.editingId = Number(id);

			fieldFullName.value = s.fullName ?? "";
			fieldEmail.value = s.email ?? "";
			fieldPhone.value = s.phone ?? "";
			fieldGender.value = s.gender ?? "";
			fieldDob.value = s.dob ?? "";
			fieldDept.value = s.department ?? "";
			fieldLevel.value = s.level ?? "";
			fieldGpa.value = s.gpa ?? "";
		}

		if (btn.classList.contains("delete-btn")) {
			const ok = confirm("Delete this student?");
			if (!ok) return;

			await remove("students", id);

			if (state.page > 1 && (state.totalCount - 1) <= (state.page - 1) * state.limit) {
				state.page--;
			}

			loadData();
		}
	});
}

loadData();
