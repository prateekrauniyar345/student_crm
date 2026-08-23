// src/api/queryKeys.js
export const queryKeys = {


  // User Profile for the current logged-in user
  me: () => ["auth", "me"],


  // User data
  users : {
    all : () => ["users"],
    detail : (id) => ["users", "detail", id],
    list : (filters = {}) => ["users", "list", filters],
  },


  // Institution data
  institutions : {
    all : () => ["institutions"],
    detail : (id) => ["institutions", "detail", id]
  }, 


  // Users and Institutions Memberships
  memberships: {
    all: () => ["memberships"],
    list: (filters = {}) => ["memberships", "list", filters],
    detail: (institutionId, userId) => ["memberships", "detail", { institutionId, userId }],
    byUser: (userId) => ["memberships", "list", userId],
    byInstitution: (institutionId) => ["memberships", "list", { institution_id: institutionId }],
  },

  // Programs data
  programs: {
    all: () => ["programs"],
    list: (filters = {}) => ["programs", "list", filters],
    byInstitution: (institutionId) => ["programs", "list", { institution_id: institutionId }],
  },

  // Academic Terms data
  academicTerms: {
    all: () => ["academic-terms"],
    list: (filters = {}) => ["academic-terms", "list", filters],
    byInstitution: (institutionId) => ["academic-terms", "list", { institution_id: institutionId }],
    byYear: (applicationYear) => ["academic-terms", "list", { application_year: applicationYear }],
  },

  // People data (CRM contacts)
  people: {
    all: () => ["people"],
    detail: (id) => ["people", "detail", id],
    list: (filters = {}) => ["people", "list", filters],
    byInstitution: (institutionId) => ["people", "list", { institution_id: institutionId }],
    byLifecycleStage: (stage) => ["people", "list", { lifecycle_stage: stage }],
  },

  // Student Profiles data
  studentProfiles: {
    all: () => ["student-profiles"],
    detail: (personId) => ["student-profiles", "detail", personId],
    list: (filters = {}) => ["student-profiles", "list", filters],
    byPersonId: (personId) => ["student-profiles", "list", { person_id: personId }],
  },

  // Applications data
  applications: {
    all: () => ["applications"],
    detail: (id) => ["applications", "detail", id],
    list: (filters = {}) => ["applications", "list", filters],
    byPersonId: (personId) => ["applications", "list", { person_id: personId }],
    byProgramId: (programId) => ["applications", "list", { program_id: programId }],
    byStage: (stage) => ["applications", "list", { stage: stage }],
  },

  // Student Term Records data
  studentTermRecords: {
    all: () => ["student-term-records"],
    detail: (id) => ["student-term-records", "detail", id],
    list: (filters = {}) => ["student-term-records", "list", filters],
    byPersonId: (personId) => ["student-term-records", "list", { person_id: personId }],
    byTermId: (termId) => ["student-term-records", "list", { term_id: termId }],
  },

};