class User{

    constructor(
        id, 
        full_name, 
        email, 
        created_at
    ){
        this.id = id;
        this.full_name = full_name;
        this.email = email;
        this.created_at = created_at;
    }

    static fromApiResponse(data){
        return new User(
            data.id,
            data.full_name,
            data.email,
            data.created_at
        );
    }

    toJSON(){
        return {
            id: this.id,
            full_name: this.full_name,
            email: this.email,
            created_at: this.created_at
        };
    }

}

export default User;