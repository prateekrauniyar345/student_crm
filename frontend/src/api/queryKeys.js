// src/api/queryKeys.js
export const queryKeys = {


  // User Profile for the current logged-in user
  me: () => ["auth", "me"],


  // Institution data
  institutions : {
    all : () => ["institutions"],
    detail : (id) => ["institutions", "detail", id]
  }, 


  memberships: {
    all: () => ["memberships"],
    list: (filters = {}) => ["memberships", "list", filters],
    detail: (institutionId, userId) => ["memberships", "detail", { institutionId, userId }],
    byUser: (userId) => ["memberships", "list", userId],
    byInstitution: (institutionId) => ["memberships", "list", { institution_id: institutionId }],
  },
  

};