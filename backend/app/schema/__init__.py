# backend/app/schema/__init__.py


from .user import User
from .institutions import Institution
from .institution_memberships import InstitutionMembership
from .programs import Program
from .academic_terms import AcademicTerm
from .applications import Application
from .interactions import Interaction
from .people import People
from .student_term_records import StudentTermRecord
from .students_profile import StudentProfile

__all__ = [
    "User", 
    "Institution",
    "InstitutionMembership",
    "Program",
    "AcademicTerm",
    "Application",
    "Interaction",
    "People",
    "StudentTermRecord",
    "StudentProfile"
]