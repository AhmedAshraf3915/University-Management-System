export default class Employee {
	constructor(name, position, salary, phone) {
		this.name = name;
		this.position = position;
		this.salary = Number(salary);
		this.phone = phone;
	}

	validate() {
		if (!this.name) return "Name is required";
		if (!this.position) return "Position is required";
		if (isNaN(this.salary)) return "Salary must be a number";
		return null;
	}

	static fromJson(json) {
		return new Employee(
			json.name,
			json.position,
			json.salary,
			json.phone
		);
	}

	toJSON() {
		return {
			name: this.name,
			position: this.position,
			salary: this.salary,
			phone: this.phone
		};
	}
}
