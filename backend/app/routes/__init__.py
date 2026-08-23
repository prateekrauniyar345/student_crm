# backend/app/routes/__init__.py

from .default import default_routes
from .users import user_routes
from .auth import auth_routes
from .institutions import institution_routes
from .institution_memberships import institution_membership_routes
from .programs import program_routes
from .academic_terms import academic_term_routes
from .people import people_routes
from .applications import application_routes
from .students_profile import student_profile_routes
from .student_term_records import student_term_record_routes

__all__= [
    "default_routes", 
    "user_routes",
    "auth_routes",
    "institution_routes", 
    "institution_membership_routes",
    "program_routes",
    "academic_term_routes",
    "people_routes",
    "application_routes",
    "student_profile_routes",
    "student_term_record_routes",
]