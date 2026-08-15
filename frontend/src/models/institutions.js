class Institutions {

    constructor(
        id, 
        name, 
        code, 
        timezone, 
        created_at
    ) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.timezone = timezone;
        this.created_at = created_at;
    }


    static fromApiResponse(data) {
        return new Institutions(
            data.id,
            data.name,
            data.code,
            data.timezone,
            data.created_at
        );
    }


    toJSON() {
        return {
            id: this.id,
            name: this.name,
            code: this.code,
            timezone: this.timezone,
            created_at: this.created_at
        }
    }

    institutionCreatePayload() {
        return {
            name: this.name,
            code: this.code,
            timezone: this.timezone
        }
    }


}