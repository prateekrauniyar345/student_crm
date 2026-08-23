// src/models/studentProfile.js

class StudentProfile {
  constructor(
    person_id,
    student_number,
    entry_term_id,
    current_program_id,
    student_status,
    expected_graduation_date,
    created_at
  ) {
    this.person_id = person_id;
    this.student_number = student_number;
    this.entry_term_id = entry_term_id;
    this.current_program_id = current_program_id;
    this.student_status = student_status;
    this.expected_graduation_date = expected_graduation_date;
    this.created_at = created_at;
  }

  // Helper getters for camelCase compatibility
  get personId() {
    return this.person_id;
  }

  get entryTermId() {
    return this.entry_term_id;
  }

  get currentProgramId() {
    return this.current_program_id;
  }

  get studentNumber() {
    return this.student_number;
  }

  get studentStatus() {
    return this.student_status;
  }

  get expectedGraduationDate() {
    return this.expected_graduation_date;
  }

  static fromApiResponse(data) {
    if (!data) return null;
    return new StudentProfile(
      data.person_id ?? data.personId,
      data.student_number ?? data.studentNumber,
      data.entry_term_id ?? data.entryTermId,
      data.current_program_id ?? data.currentProgramId,
      data.student_status ?? data.studentStatus,
      data.expected_graduation_date ?? data.expectedGraduationDate,
      data.created_at ?? data.createdAt
    );
  }

  toJSON() {
    return {
      person_id: this.person_id,
      student_number: this.student_number,
      entry_term_id: this.entry_term_id,
      current_program_id: this.current_program_id,
      student_status: this.student_status,
      expected_graduation_date: this.expected_graduation_date,
      created_at: this.created_at,
    };
  }

  createPayload() {
    return {
      person_id: this.person_id,
      student_number: this.student_number,
      entry_term_id: this.entry_term_id,
      current_program_id: this.current_program_id,
      student_status: this.student_status,
      expected_graduation_date: this.expected_graduation_date,
    };
  }
}

export default StudentProfile;
