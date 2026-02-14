export default class Student {
	constructor(fullName, email, phone, gender, dob, department, level, gpa) {
		this.fullName = fullName;
		this.email = email;
		this.phone = phone;
		this.gender = gender;
		this.dob = dob;
		this.department = department;
		this.level = Number(level);
		this.gpa = Number(gpa);
	}

	// Validation
	validate() {
		if (!this.fullName) return "Full name is required";
		if (!this.email) return "Email is required";
		if (!this.phone) return "Phone is required";
		if (!this.gender) return "Gender is required";
		if (!this.department) return "Department is required";
		if (isNaN(this.level)) return "Level must be a number";
		if (isNaN(this.gpa)) return "GPA must be a number";
		return null;
	}

	// Convert API object → Model instance
	static fromJson(json) {
		return new Student(
			json.fullName,
			json.email,
			json.phone,
			json.gender,
			json.dob,
			json.department,
			json.level,
			json.gpa
		);
	}

	// Prepare data for API
	toJSON() {
		return {
			fullName: this.fullName,
			email: this.email,
			phone: this.phone,
			gender: this.gender,
			dob: this.dob,
			department: this.department,
			level: this.level,
			gpa: this.gpa
		};
	}
}
