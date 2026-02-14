import { getList, create, update, remove, getById } from "./api.js";
import Course from "./models/Course.js";
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
const dataForm = document.getElementById("dataForm");
const btnAddNew = document.getElementById("btnAddNew");
const formWrap = document.getElementById("formWrap");
const btnCancel = document.getElementById("btnCancel");
const fieldTitle = document.getElementById("fieldTitle");
const fieldHours = document.getElementById("fieldHours");
const fieldDept = document.getElementById("fieldDept");
const fieldCode = document.getElementById("fieldCode");

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
		formWrap.reset();
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
	const result = await getList("courses", "");
	const all = result.data;

	let filtered = all;

	if (q) {
		filtered = all.filter(function (c) {
			return (
				String(c.title || "").toLowerCase().startsWith(q) ||
				String(c.department || "").toLowerCase().startsWith(q) ||
				String(c.code || "").toLowerCase().startsWith(q)
			);
		});
	}
	state.totalCount = filtered.length;

	const start = (state.page - 1) * state.limit;
	const end = start + state.limit;
	const pageData = filtered.slice(start, end);

	renderTable(tableBody, pageData, [
		"id",
		"title",
		"hours",
		"department",
		"code"
	]);

	pageIndicator.textContent = "Page " + state.page;
	var totalPages = Math.ceil(state.totalCount / state.limit);
	if (!totalPages) totalPages = 1;
	btnPrev.disabled = state.page <= 1;
	btnNext.disabled = state.page >= totalPages;
}


if (formWrap) {
	formWrap.addEventListener("submit", async function (e) {
		e.preventDefault();

		const course = new Course(
			fieldTitle.value.trim(),
			fieldHours.value,
			fieldDept.value.trim(),
			fieldCode.value.trim()
		);

		const error = course.validate();
		if (error) return alert(error);

		if (state.editingId === null) {

			const result = await getList("courses", "");
			const lastCourse = result.data[result.data.length - 1];
			const nextId = lastCourse ? Number(lastCourse.id) + 1 : 1;
			const newCourse = {
				id: nextId,
				...course.toJSON()
			};
			await create("courses", newCourse);
		} else {
			await update("courses", state.editingId, course.toJSON());
			state.editingId = null;
		}
		dataForm.reset();
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
			const c = await getById("courses", id);

			state.editingId = Number(id);
			fieldTitle.value = c.title ?? "";
			fieldHours.value = c.hours ?? "";
			fieldDept.value = c.department ?? "";
			fieldCode.value = c.code ?? "";
		}

		if (btn.classList.contains("delete-btn")) {
			const ok = confirm("Delete this course?");
			if (!ok) return;

			await remove("courses", id);

			if (state.page > 1 && (state.totalCount - 1) <= (state.page - 1) * state.limit) {
				state.page--;
			}

			loadData();
		}
	});
}

loadData();
