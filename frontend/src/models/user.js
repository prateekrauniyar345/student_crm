class User{

    constructor(
        id, 
        full_name, 
        preferred_first_name,
        email, 
        phone_number,
        is_active,
        user_timezone,
        created_at
    ){
        this.id = id;
        this.full_name = full_name;
        this.preferred_first_name = preferred_first_name;
        this.email = email;
        this.phone_number = phone_number;
        this.is_active = is_active;
        this.user_timezone = user_timezone;
        this.created_at = created_at;
    }

    static fromApiResponse(data){
        return new User(
            data.id,
            data.full_name,
            data.preferred_first_name,
            data.email,
            data.phone_number,
            data.is_active,
            data.user_timezone,
            data.created_at
        );
    }

    toJSON(){
        return {
            id: this.id,
            full_name: this.full_name,
            preferred_first_name: this.preferred_first_name,
            email: this.email,
            phone_number: this.phone_number,
            is_active: this.is_active,
            user_timezone: this.user_timezone,
            created_at: this.created_at
        };
    }


    createUserPayload() {
        const payload = {
            id: this.id,
            full_name: this.full_name,
            email: this.email
        };

        // Include optional fields only when they were actually supplied.
        // NULL is intentionally preserved.
        if (this.preferred_first_name !== undefined) {
            payload.preferred_first_name = this.preferred_first_name;
        }

        if (this.phone_number !== undefined) {
            payload.phone_number = this.phone_number;
        }

        if (this.is_active !== undefined) {
            payload.is_active = this.is_active;
        }

        if (this.user_timezone !== undefined) {
            payload.user_timezone = this.user_timezone;
        }

        return payload;
    }
}

export default User;