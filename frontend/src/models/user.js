class User{

    constructor(
        id, 
        full_name, 
        preferred_first_name,
        email, 
        phone_number,
        created_at
    ){
        this.id = id;
        this.full_name = full_name;
        this.preferred_first_name = preferred_first_name;
        this.email = email;
        this.phone_number = phone_number;
        this.created_at = created_at;
    }

    static fromApiResponse(data){
        return new User(
            data.id,
            data.full_name,
            data.preferred_first_name,
            data.email,
            data.phone_number,
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
            created_at: this.created_at
        };
    }


    createUserPayload(){
        return {
            id: this.id,
            full_name: this.full_name,
            preferred_first_name: this.preferred_first_name,
            email: this.email,
            phone_number: this.phone_number
        }; 
    }

}

export default User;