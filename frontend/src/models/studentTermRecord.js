// src/models/studentTermRecord.js

class StudentTermRecord {
  constructor(
    id,
    person_id,
    term_id,
    program_id,
    credits_attempted,
    credits_earned,
    term_gpa,
    cumulative_gpa,
    academic_standing,
    advisor_meetings,
    attributes,
    created_at
  ) {
    this.id = id;
    this.person_id = person_id;
    this.term_id = term_id;
    this.program_id = program_id;
    this.credits_attempted = credits_attempted;
    this.credits_earned = credits_earned;
    this.term_gpa = term_gpa;
    this.cumulative_gpa = cumulative_gpa;
    this.academic_standing = academic_standing;
    this.advisor_meetings = advisor_meetings;
    this.attributes = attributes;
    this.created_at = created_at;
  }

  // Helper getters for camelCase compatibility
  get personId() {
    return this.person_id;
  }

  get termId() {
    return this.term_id;
  }

  get programId() {
    return this.program_id;
  }

  get creditsAttempted() {
    return this.credits_attempted;
  }

  get creditsEarned() {
    return this.credits_earned;
  }

  get termGpa() {
    return this.term_gpa;
  }

  get cumulativeGpa() {
    return this.cumulative_gpa;
  }

  get academicStanding() {
    return this.academic_standing;
  }

  get advisorMeetings() {
    return this.advisor_meetings;
  }

  get createdAt() {
    return this.created_at;
  }

  static fromApiResponse(data) {
    if (!data) return null;
    return new StudentTermRecord(
      data.id,
      data.person_id ?? data.personId,
      data.term_id ?? data.termId,
      data.program_id ?? data.programId,
      data.credits_attempted ?? data.creditsAttempted,
      data.credits_earned ?? data.creditsEarned,
      data.term_gpa ?? data.termGpa,
      data.cumulative_gpa ?? data.cumulativeGpa,
      data.academic_standing ?? data.academicStanding,
      data.advisor_meetings ?? data.advisorMeetings,
      data.attributes,
      data.created_at ?? data.createdAt
    );
  }

  toJSON() {
    return {
      id: this.id,
      person_id: this.person_id,
      term_id: this.term_id,
      program_id: this.program_id,
      credits_attempted: this.credits_attempted,
      credits_earned: this.credits_earned,
      term_gpa: this.term_gpa,
      cumulative_gpa: this.cumulative_gpa,
      academic_standing: this.academic_standing,
      advisor_meetings: this.advisor_meetings,
      attributes: this.attributes,
      created_at: this.created_at,
    };
  }

  createPayload() {
    return {
      person_id: this.person_id,
      term_id: this.term_id,
      program_id: this.program_id,
      credits_attempted: this.credits_attempted,
      credits_earned: this.credits_earned,
      term_gpa: this.term_gpa,
      cumulative_gpa: this.cumulative_gpa,
      academic_standing: this.academic_standing,
      advisor_meetings: this.advisor_meetings,
      attributes: this.attributes,
    };
  }
}

export default StudentTermRecord;
