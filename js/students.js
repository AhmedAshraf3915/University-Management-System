import { getList, create, update, remove, getById } from "./api.js";
import Student from "./models/Student.js";
import { renderTable, updatePaginationUI } from "./ui.js";

let state = {
	page: 1,
	limit: 5,
	q: "",
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

const fieldCourse1 = document.getElementById("fieldCourse1");
const fieldCourse2 = document.getElementById("fieldCourse2");
const fieldCourse3 = document.getElementById("fieldCourse3");

let courses = [];
let coursesMap = {};

function buildCoursesMap(list) {
	const map = {};
	for (let i = 0; i < list.length; i++) map[String(list[i].id)] = list[i];
	return map;
}

function fillCourseSelect(selectEl) {
	if (!selectEl) return;
	selectEl.innerHTML = "";

	const placeholder = document.createElement("option");
	placeholder.value = "";
	placeholder.textContent = "-- Select course --";
	selectEl.appendChild(placeholder);

	for (let i = 0; i < courses.length; i++) {
		const c = courses[i];
		const opt = document.createElement("option");
		opt.value = String(c.id);
		opt.textContent = `${c.title} (${c.code || "NoCode"})`;
		selectEl.appendChild(opt);
	}
}

function updateCourseSelectLocks() {
	if (!fieldCourse1 || !fieldCourse2 || !fieldCourse3) return;

	const v1 = String(fieldCourse1.value || "");
	const v2 = String(fieldCourse2.value || "");
	const v3 = String(fieldCourse3.value || "");

	const all = [fieldCourse1, fieldCourse2, fieldCourse3];

	for (let s = 0; s < all.length; s++) {
		const sel = all[s];
		for (let i = 0; i < sel.options.length; i++) {
			const opt = sel.options[i];
			if (opt.value === "") continue;
			opt.disabled = false;
		}
	}

	function disableInOthers(value, ownerSelect) {
		if (!value) return;
		for (let s = 0; s < all.length; s++) {
			const sel = all[s];
			if (sel === ownerSelect) continue;
			for (let i = 0; i < sel.options.length; i++) {
				const opt = sel.options[i];
				if (opt.value === value) opt.disabled = true;
			}
		}
	}

	disableInOthers(v1, fieldCourse1);
	disableInOthers(v2, fieldCourse2);
	disableInOthers(v3, fieldCourse3);
}

function getCourseListFromSelects() {
	const list = [
		String(fieldCourse1?.value || ""),
		String(fieldCourse2?.value || ""),
		String(fieldCourse3?.value || "")
	].filter(Boolean);

	if (list.length !== 3) return null;
	if (new Set(list).size !== 3) return null;
	return list;
}

function setCourseSelects(courseList) {
	const list = Array.isArray(courseList) ? courseList.map(String) : [];
	if (fieldCourse1) fieldCourse1.value = list[0] || "";
	if (fieldCourse2) fieldCourse2.value = list[1] || "";
	if (fieldCourse3) fieldCourse3.value = list[2] || "";
	updateCourseSelectLocks();
}

function coursesText(student) {
	const list = Array.isArray(student.courseList) ? student.courseList : [];
	const titles = [];
	for (let i = 0; i < list.length; i++) {
		const c = coursesMap[String(list[i])];
		if (c && c.title) titles.push(c.title);
	}
	return titles.length ? titles.join(", ") : "—";
}

async function loadCourses() {
	const res = await getList("courses", "");
	courses = res.data || [];
	coursesMap = buildCoursesMap(courses);

	fillCourseSelect(fieldCourse1);
	fillCourseSelect(fieldCourse2);
	fillCourseSelect(fieldCourse3);

	updateCourseSelectLocks();
}

if (fieldCourse1) fieldCourse1.addEventListener("change", updateCourseSelectLocks);
if (fieldCourse2) fieldCourse2.addEventListener("change", updateCourseSelectLocks);
if (fieldCourse3) fieldCourse3.addEventListener("change", updateCourseSelectLocks);

if (pageSize) {
	state.limit = Number(pageSize.value) || 5;
	pageSize.addEventListener("change", function () {
		const newLimit = Number(this.value);
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

		if (courses.length >= 3) {
			setCourseSelects([String(courses[0].id), String(courses[1].id), String(courses[2].id)]);
		} else {
			setCourseSelects([]);
		}

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

	const res = await getList("students", "");
	const all = res.data || [];

	let filtered = all;
	if (q) {
		filtered = all.filter(function (s) {
			return (
				String(s.fullName || "").toLowerCase().startsWith(q) ||
				String(s.email || "").toLowerCase().startsWith(q) ||
				String(s.phone || "").toLowerCase().startsWith(q) ||
				String(s.department || "").toLowerCase().startsWith(q) ||
				coursesText(s).toLowerCase().startsWith(q)
			);
		});
	}
	state.totalCount = filtered.length;
	const start = (state.page - 1) * state.limit;
	const end = start + state.limit;

	const pageData = filtered.slice(start, end).map(function (s) {
		return { ...s, coursesText: coursesText(s) };
	});

	renderTable(tableBody, pageData, [
		"id",
		"fullName",
		"email",
		"phone",
		"gender",
		"dob",
		"department",
		"level",
		"gpa",
		"coursesText"
	]);

	updatePaginationUI(pageIndicator, btnPrev, btnNext, state);
}

if (formWrap) {
	formWrap.addEventListener("submit", async function (e) {
		e.preventDefault();

		const list = getCourseListFromSelects();
		if (!list) return alert("Please choose 3 different courses.");

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

		const err = student.validate();
		if (err) return alert(err);

		const payload = { ...student.toJSON(), courseList: list };

		if (state.editingId === null) {
			const res = await getList("students", "");
			const all = res.data || [];
			let maxId = 0;

			for (let i = 0; i < all.length; i++) {
				const n = Number(all[i].id);
				if (!isNaN(n) && n > maxId) maxId = n;
			}

			await create("students", { id: String(maxId + 1), ...payload });
		} else {
			await update("students", String(state.editingId), payload);
			state.editingId = null;
		}

		dataForm.reset();
		formWrap.style.display = "none";
		loadData();
	});
}

if (tableBody) {
	tableBody.addEventListener("click", async function (e) {
		const btn = e.target;
		const id = btn.dataset.id;
		if (!id) return;

		if (btn.classList.contains("edit-btn")) {
			const s = await getById("students", id);
			state.editingId = String(id);

			formWrap.style.display = "grid";

			fieldFullName.value = s.fullName ?? "";
			fieldEmail.value = s.email ?? "";
			fieldPhone.value = s.phone ?? "";
			fieldGender.value = s.gender ?? "";
			fieldDob.value = s.dob ?? "";
			fieldDept.value = s.department ?? "";
			fieldLevel.value = s.level ?? "";
			fieldGpa.value = s.gpa ?? "";

			setCourseSelects(s.courseList || []);
			fieldFullName.focus();
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

(async function () {
	await loadCourses();
	await loadData();
})();
