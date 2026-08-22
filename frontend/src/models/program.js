// src/models/program.js

class Program {
  constructor(
    id,
    institution_id,
    code,
    name,
    degree_level,
    is_active,
    created_at
  ) {
    this.id = id;
    this.institution_id = institution_id;
    this.code = code;
    this.name = name;
    this.degree_level = degree_level;
    this.is_active = is_active;
    this.created_at = created_at;
  }

  static fromApiResponse(data) {
    return new Program(
      data.id,
      data.institution_id,
      data.code,
      data.name,
      data.degree_level,
      data.is_active,
      data.created_at
    );
  }

  toJSON() {
    return {
      id: this.id,
      institution_id: this.institution_id,
      code: this.code,
      name: this.name,
      degree_level: this.degree_level,
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }

  createProgramPayload() {
    return {
      institution_id: this.institution_id,
      code: this.code,
      name: this.name,
      degree_level: this.degree_level,
      is_active: this.is_active,
    };
  }

  updateProgramPayload() {
    return {
      code: this.code,
      name: this.name,
      degree_level: this.degree_level,
      is_active: this.is_active,
    };
  }
}

export default Program;
