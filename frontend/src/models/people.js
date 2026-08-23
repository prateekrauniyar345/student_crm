// src/models/people.js

class People {
  constructor(
    id,
    institution_id,
    external_reference,
    first_name,
    last_name,
    preferred_name,
    email,
    phone,
    date_of_birth,
    lifecycle_stage,
    attributes,
    created_at,
    updated_at
  ) {
    this.id = id;
    this.institution_id = institution_id;
    this.external_reference = external_reference;
    this.first_name = first_name;
    this.last_name = last_name;
    this.preferred_name = preferred_name;
    this.email = email;
    this.phone = phone;
    this.date_of_birth = date_of_birth;
    this.lifecycle_stage = lifecycle_stage;
    this.attributes = attributes;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Helper getters
  get fullName() {
    return `${this.first_name} ${this.last_name}`;
  }

  get displayName() {
    return this.preferred_name || this.fullName;
  }

  get institutionId() {
    return this.institution_id;
  }

  static fromApiResponse(data) {
    if (!data) return null;
    return new People(
      data.id,
      data.institution_id ?? data.institutionId,
      data.external_reference,
      data.first_name,
      data.last_name,
      data.preferred_name,
      data.email,
      data.phone,
      data.date_of_birth ?? data.dateOfBirth,
      data.lifecycle_stage ?? data.lifecycleStage,
      data.attributes,
      data.created_at ?? data.createdAt,
      data.updated_at ?? data.updatedAt
    );
  }

  toJSON() {
    return {
      id: this.id,
      institution_id: this.institution_id,
      external_reference: this.external_reference,
      first_name: this.first_name,
      last_name: this.last_name,
      preferred_name: this.preferred_name,
      email: this.email,
      phone: this.phone,
      date_of_birth: this.date_of_birth,
      lifecycle_stage: this.lifecycle_stage,
      attributes: this.attributes,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  createPayload() {
    return {
      institution_id: this.institution_id,
      external_reference: this.external_reference,
      first_name: this.first_name,
      last_name: this.last_name,
      preferred_name: this.preferred_name,
      email: this.email,
      phone: this.phone,
      date_of_birth: this.date_of_birth,
      lifecycle_stage: this.lifecycle_stage,
      attributes: this.attributes,
    };
  }
}

export default People;
