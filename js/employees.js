import { getList, create, update, remove, getById } from "./api.js";
import Employee from "./models/Employee.js";
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

// Form
const dataForm = document.getElementById("dataForm");
const fieldName = document.getElementById("fieldName");
const fieldPosition = document.getElementById("fieldPosition");
const fieldSalary = document.getElementById("fieldSalary");
const fieldPhone = document.getElementById("fieldPhone");

if (pageSize) {
	pageSize.addEventListener("change", function () {
		state.limit = Number(pageSize.value);
		state.page = 1;
		loadData();
	});
}

if (searchInput) {
	searchInput.addEventListener("input", function () {
		state.q = searchInput.value;
		state.page = 1;
		loadData();
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
	const query =
		`?_page=${state.page}` +
		`&_limit=${state.limit}` +
		`&q=${encodeURIComponent(state.q)}` +
		(state.sort ? `&_sort=${state.sort}&_order=${state.order}` : "");

	const result = await getList("employees", query);
	state.totalCount = result.totalCount;

	renderTable(tableBody, result.data, [
		"id",
		"name",
		"position",
		"salary",
		"phone"
	]);

	updatePaginationUI(pageIndicator, btnPrev, btnNext, state);
}

if (dataForm) {
	dataForm.addEventListener("submit", async function (e) {
		e.preventDefault();

		const employee = new Employee(
			fieldName.value.trim(),
			fieldPosition.value.trim(),
			fieldSalary.value,
			fieldPhone.value.trim()
		);

		const error = employee.validate();
		if (error) return alert(error);

		if (state.editingId === null) {
			await create("employees", employee.toJSON());
		} else {
			await update("employees", state.editingId, employee.toJSON());
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

		if (btn.classList.contains("edit-btn")) {
			const emp = await getById("employees", id);

			state.editingId = Number(id);
			fieldName.value = emp.name ?? "";
			fieldPosition.value = emp.position ?? "";
			fieldSalary.value = emp.salary ?? "";
			fieldPhone.value = emp.phone ?? "";
		}

		if (btn.classList.contains("delete-btn")) {
			const ok = confirm("Delete this employee?");
			if (!ok) return;

			await remove("employees", id);

			if (state.page > 1 && (state.totalCount - 1) <= (state.page - 1) * state.limit) {
				state.page--;
			}

			loadData();
		}
	});
}

loadData();
