export default class Course {
	constructor(title, hours, department, code) {
		this.title = title;
		this.hours = Number(hours);
		this.department = department;
		this.code = code;
	}

	validate() {
		if (!this.title) return "Title is required";
		if (isNaN(this.hours)) return "Hours must be a number";
		if (!this.department) return "Department is required";
		return null;
	}

	static fromJson(json) {
		return new Course(
			json.title,
			json.hours,
			json.department,
			json.code
		);
	}

	toJSON() {
		return {
			title: this.title,
			hours: this.hours,
			department: this.department,
			code: this.code
		};
	}
}
