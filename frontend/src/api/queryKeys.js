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

};