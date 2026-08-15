class InstitutionMembership {
    constructor(
        institutionId, 
        userId, 
        role, 
        department, 
        createdAt
    ) {
        this.institutionId = institutionId;
        this.userId = userId;
        this.role = role;
        this.department = department;
        this.createdAt = createdAt;
    }

    static fromApiResponse(data) {
        return new InstitutionMembership(
            data.institution_id,
            data.user_id,
            data.role,
            data.department,
            data.created_at
        );
    }

    toJSON() {
        return {
            institution_id: this.institutionId,
            user_id: this.userId,
            role: this.role,
            department: this.department,
            created_at: this.createdAt
        };
    }       
}