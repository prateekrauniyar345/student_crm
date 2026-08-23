// src/models/application.js

class Application {
  constructor(
    id,
    person_id,
    program_id,
    term_id,
    application_year,
    stage,
    decision_code,
    reply_code,
    applicant_source,
    transfer_institution_type,
    submitted_at,
    decided_at,
    created_at
  ) {
    this.id = id;
    this.person_id = person_id;
    this.program_id = program_id;
    this.term_id = term_id;
    this.application_year = application_year;
    this.stage = stage;
    this.decision_code = decision_code;
    this.reply_code = reply_code;
    this.applicant_source = applicant_source;
    this.transfer_institution_type = transfer_institution_type;
    this.submitted_at = submitted_at;
    this.decided_at = decided_at;
    this.created_at = created_at;
  }

  // Helper getters for camelCase compatibility
  get personId() {
    return this.person_id;
  }

  get programId() {
    return this.program_id;
  }

  get termId() {
    return this.term_id;
  }

  get applicationYear() {
    return this.application_year;
  }

  get decisionCode() {
    return this.decision_code;
  }

  get replyCode() {
    return this.reply_code;
  }

  get applicantSource() {
    return this.applicant_source;
  }

  get transferInstitutionType() {
    return this.transfer_institution_type;
  }

  get submittedAt() {
    return this.submitted_at;
  }

  get decidedAt() {
    return this.decided_at;
  }

  get createdAt() {
    return this.created_at;
  }

  static fromApiResponse(data) {
    if (!data) return null;
    return new Application(
      data.id,
      data.person_id ?? data.personId,
      data.program_id ?? data.programId,
      data.term_id ?? data.termId,
      data.application_year ?? data.applicationYear,
      data.stage,
      data.decision_code ?? data.decisionCode,
      data.reply_code ?? data.replyCode,
      data.applicant_source ?? data.applicantSource,
      data.transfer_institution_type ?? data.transferInstitutionType,
      data.submitted_at ?? data.submittedAt,
      data.decided_at ?? data.decidedAt,
      data.created_at ?? data.createdAt
    );
  }

  toJSON() {
    return {
      id: this.id,
      person_id: this.person_id,
      program_id: this.program_id,
      term_id: this.term_id,
      application_year: this.application_year,
      stage: this.stage,
      decision_code: this.decision_code,
      reply_code: this.reply_code,
      applicant_source: this.applicant_source,
      transfer_institution_type: this.transfer_institution_type,
      submitted_at: this.submitted_at,
      decided_at: this.decided_at,
      created_at: this.created_at,
    };
  }

  createPayload() {
    return {
      person_id: this.person_id,
      program_id: this.program_id,
      term_id: this.term_id,
      application_year: this.application_year,
      stage: this.stage,
      decision_code: this.decision_code,
      reply_code: this.reply_code,
      applicant_source: this.applicant_source,
      transfer_institution_type: this.transfer_institution_type,
      submitted_at: this.submitted_at,
      decided_at: this.decided_at,
    };
  }
}

export default Application;
