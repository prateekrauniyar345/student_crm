// src/models/academicTerm.js

class AcademicTerm {
  constructor(
    id,
    institution_id,
    code,
    name,
    start_date,
    end_date,
    application_year,
    created_at
  ) {
    this.id = id;
    this.institution_id = institution_id;
    this.code = code;
    this.name = name;
    this.start_date = start_date;
    this.end_date = end_date;
    this.application_year = application_year;
    this.created_at = created_at;
  }

  // Helper getters for camelCase compatibility
  get startDate() {
    return this.start_date;
  }

  get endDate() {
    return this.end_date;
  }

  get applicationYear() {
    return this.application_year;
  }

  get institutionId() {
    return this.institution_id;
  }

  static fromApiResponse(data) {
    if (!data) return null;
    return new AcademicTerm(
      data.id,
      data.institution_id ?? data.institutionId,
      data.code,
      data.name,
      data.start_date ?? data.startDate,
      data.end_date ?? data.endDate,
      data.application_year ?? data.applicationYear,
      data.created_at ?? data.createdAt
    );
  }

  toJSON() {
    return {
      id: this.id,
      institution_id: this.institution_id,
      code: this.code,
      name: this.name,
      start_date: this.start_date,
      end_date: this.end_date,
      application_year: this.application_year,
      created_at: this.created_at,
    };
  }

  createAcademicTermPayload() {
    return {
      institution_id: this.institution_id,
      code: this.code,
      name: this.name,
      start_date: this.start_date,
      end_date: this.end_date,
      application_year: this.application_year,
    };
  }

  updateAcademicTermPayload() {
    return {
      code: this.code,
      name: this.name,
      start_date: this.start_date,
      end_date: this.end_date,
      application_year: this.application_year,
    };
  }
}

export default AcademicTerm;
