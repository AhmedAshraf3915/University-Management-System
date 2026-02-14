const BASE_URL = "http://localhost:3000";

export async function getList(resource, queryString = "") {
	const response = await fetch(`${BASE_URL}/${resource}${queryString}`);
	const data = await response.json();
	const totalCount = Number(response.headers.get("X-Total-Count")) || 0;

	return { data, totalCount };
}

export async function getById(resource, id) {
	const response = await fetch(`${BASE_URL}/${resource}/${id}`);
	return await response.json();
}

export async function create(resource, item) {
	const response = await fetch(`${BASE_URL}/${resource}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(item)
	});

	return await response.json();
}

export async function update(resource, id, item) {
	const response = await fetch(`${BASE_URL}/${resource}/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(item)
	});

	return await response.json();
}

export async function remove(resource, id) {
	await fetch(`${BASE_URL}/${resource}/${id}`, {
		method: "DELETE"
	});
}
