class Default{

    constructor(
        message, 
        status, 
        version, 
        date, 
        version_tag,
        docs_url
    ){
        this.message = message;
        this.status = status;
        this.version = version;
        this.date = date;
        this.version_tag = version_tag;
        this.docs_url = docs_url;
    }


    static getDefaultData(){
        return {
            version: "",
            message: "",
            status: "",
            date: "",
            version_tag: "",
            docs_url: ""
        }
    }
}

export default Default;