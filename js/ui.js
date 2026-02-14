export function renderTable(tableBody, rows, columns) {
	tableBody.innerHTML = "";

	if (!rows || rows.length === 0) {
		tableBody.innerHTML = `
      <tr>
        <td colspan="${columns.length + 2}">
          No data found
        </td>
      </tr>
    `;
		return;
	}

	rows.forEach(function (item) {
		let rowHTML = "<tr>";

		columns.forEach(function (col) {
			rowHTML += `<td>${item[col] ?? ""}</td>`;
		});

		rowHTML += `
  <td>
    <button type="button" class="edit-btn" data-id="${item.id}">
      Edit
    </button>
  </td>
`;	

		rowHTML += `
  <td>
    <button type="button" class="delete-btn" data-id="${item.id}">
      Delete
    </button>
  </td>
`;
		rowHTML += "</tr>";

		tableBody.innerHTML += rowHTML;
	});
}

export function clearTable(tableBody) {
	tableBody.innerHTML = "";
}

export function showForm(formWrap) {
	formWrap.style.display = "block";
}

export function hideForm(formWrap) {
	formWrap.style.display = "none";
}

export function fillForm(fields, data) {
	Object.keys(fields).forEach(function (key) {
		if (fields[key]) {
			fields[key].value = data[key] ?? "";
		}
	});
}

export function clearForm(fields) {
	Object.keys(fields).forEach(function (key) {
		if (fields[key]) {
			fields[key].value = "";
		}
	});
}

export function showError(errorBox, message) {
	errorBox.textContent = message;
	errorBox.style.display = "block";
}

export function clearError(errorBox) {
	errorBox.textContent = "";
	errorBox.style.display = "none";
}

export function updatePaginationUI(pageIndicator, btnPrev, btnNext, state) {
	pageIndicator.textContent = "Page " + state.page;
	const totalPages =
		Math.ceil(state.totalCount / state.limit) || 1;
	btnPrev.disabled = state.page <= 1;
	btnNext.disabled = state.page >= totalPages;
}
