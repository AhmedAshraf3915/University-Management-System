import { getList, create, update, remove, getById } from "./api.js";
import Instructor from "./models/Instructor.js";
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
const fieldName = document.getElementById("fieldName");
const fieldEmail = document.getElementById("fieldEmail");
const fieldSpec = document.getElementById("fieldSpec");
const fieldOffice = document.getElementById("fieldOffice");

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
		fieldName.focus();
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

	const result = await getList("instructors", "");
	const all = result.data;
	let filtered = all;
	if (q) {
		filtered = all.filter(function (ins) {
			return (
				String(ins.name || "").toLowerCase().startsWith(q) ||
				String(ins.email || "").toLowerCase().startsWith(q) ||
				String(ins.specialization || "").toLowerCase().startsWith(q) ||
				String(ins.office || "").toLowerCase().startsWith(q)
			);
		});
	}

	state.totalCount = filtered.length;
	const start = (state.page - 1) * state.limit;
	const end = start + state.limit;
	const pageData = filtered.slice(start, end);


	renderTable(tableBody, pageData, [
		"id",
		"name",
		"specialization",
		"email",
		"office"
	]);
	updatePaginationUI(pageIndicator, btnPrev, btnNext, state);
}

if (formWrap) {
	formWrap.addEventListener("submit", async function (e) {
		e.preventDefault();

		const instructor = new Instructor(
			fieldName.value.trim(),
			fieldEmail.value.trim(),
			fieldSpec.value.trim(),
			fieldOffice.value.trim()
		);

		const error = instructor.validate();
		if (error) return alert(error);

		if (state.editingId === null) {
			const result = await getList("instructors", "");
			const lastInstructor = result.data[result.data.length - 1];
			const nextId = lastInstructor ? Number(lastInstructor.id) + 1 : 1;
			const newInstructor = {
				id: nextId,
				...instructor.toJSON()
			};
			await create("instructors", newInstructor);
		} else {
			await update("instructors", state.editingId, instructor.toJSON());
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
			const ins = await getById("instructors", id);
			state.editingId = Number(id);

			fieldName.value = ins.name ?? "";
			fieldEmail.value = ins.email ?? "";
			fieldSpec.value = ins.specialization ?? "";
			fieldOffice.value = ins.office ?? "";

			formWrap.style.display = "block";
			fieldName.focus();
		}

		if (btn.classList.contains("delete-btn")) {
			const ok = confirm("Delete this instructor?");
			if (!ok) return;

			await remove("instructors", id);
			if (state.page > 1 && (state.totalCount - 1) <= (state.page - 1) * state.limit) {
				state.page--;
			}
			loadData();
		}
	});
}

loadData();