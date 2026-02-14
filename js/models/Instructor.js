export default class Instructor {
	constructor(name, email, specialization, office) {
		this.name = name;
		this.email = email;
		this.specialization = specialization;
		this.office = office;
	}

	validate() {
		if (!this.name) return "Name is required";
		if (!this.email) return "Email is required";
		if (!this.specialization) return "Specialization is required";
		return null;
	}

	static fromJson(json) {
		return new Instructor(
			json.name,
			json.email,
			json.specialization,
			json.office
		);
	}

	toJSON() {
		return {
			name: this.name,
			email: this.email,
			specialization: this.specialization,
			office: this.office
		};
	}
}
