# Pydantic v2 Response Models
# These models are used for API request/response validation

from .user import UserBase, UserCreate, UserUpdate, UserResponse
from .institution import (
    InstitutionBase,
    InstitutionCreate,
    InstitutionUpdate,
    InstitutionResponse,
)
from .institution_membership import (
    InstitutionMembershipBase,
    InstitutionMembershipCreate,
    InstitutionMembershipUpdate,
    InstitutionMembershipResponse,
    InstitutionRole,
)
from .program import (
    ProgramBase,
    ProgramCreate,
    ProgramUpdate,
    ProgramResponse,
)
from .academic_term import (
    AcademicTermBase,
    AcademicTermCreate,
    AcademicTermUpdate,
    AcademicTermResponse,
)
from .people import (
    PeopleBase,
    PeopleCreate,
    PeopleUpdate,
    PeopleResponse,
    LifecycleStage,
)
from .student_profile import (
    StudentProfileBase,
    StudentProfileCreate,
    StudentProfileUpdate,
    StudentProfileResponse,
    StudentStatus,
)
from .application import (
    ApplicationBase,
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationStage,
    DecisionCode,
    ReplyCode,
    TransferInstitutionType,
)
from .student_term_record import (
    StudentTermRecordBase,
    StudentTermRecordCreate,
    StudentTermRecordUpdate,
    StudentTermRecordResponse,
    AcademicStanding,
)
from .interaction import (
    InteractionBase,
    InteractionCreate,
    InteractionUpdate,
    InteractionResponse,
    InteractionType,
    InteractionDirection,
)

__all__ = [
    # User models
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    # Institution models
    "InstitutionBase",
    "InstitutionCreate",
    "InstitutionUpdate",
    "InstitutionResponse",
    # Institution Membership models
    "InstitutionMembershipBase",
    "InstitutionMembershipCreate",
    "InstitutionMembershipUpdate",
    "InstitutionMembershipResponse",
    "InstitutionRole",
    # Program models
    "ProgramBase",
    "ProgramCreate",
    "ProgramUpdate",
    "ProgramResponse",
    # Academic Term models
    "AcademicTermBase",
    "AcademicTermCreate",
    "AcademicTermUpdate",
    "AcademicTermResponse",
    # People models
    "PeopleBase",
    "PeopleCreate",
    "PeopleUpdate",
    "PeopleResponse",
    "LifecycleStage",
    # Student Profile models
    "StudentProfileBase",
    "StudentProfileCreate",
    "StudentProfileUpdate",
    "StudentProfileResponse",
    "StudentStatus",
    # Application models
    "ApplicationBase",
    "ApplicationCreate",
    "ApplicationUpdate",
    "ApplicationResponse",
    "ApplicationStage",
    "DecisionCode",
    "ReplyCode",
    "TransferInstitutionType",
    # Student Term Record models
    "StudentTermRecordBase",
    "StudentTermRecordCreate",
    "StudentTermRecordUpdate",
    "StudentTermRecordResponse",
    "AcademicStanding",
    # Interaction models
    "InteractionBase",
    "InteractionCreate",
    "InteractionUpdate",
    "InteractionResponse",
    "InteractionType",
    "InteractionDirection",
]
