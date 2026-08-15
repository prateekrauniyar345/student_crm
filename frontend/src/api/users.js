import apiClient from "../lib/apiClient";


// function to get users with optional query parameters
export const getUsers = async({full_name, email, preferred_first_name}) =>{
    try{
        const urlParam = new URLSearchParams(); 
        if (full_name) {
            urlParam.append("full_name", full_name);
        }
        if (email) {
            urlParam.append("email", email);
        }
        if (preferred_first_name) {
            urlParam.append("preferred_first_name", preferred_first_name);
        }
        const response = await apiClient.get(`/users?${urlParam.toString()}`);
        return response.data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};




// create user function
export const createUser = async(createUserPayload) =>{
    if(!createUserPayload || typeof createUserPayload !== 'object') {
        throw new Error("Invalid payload provided for creating user");
    }
    if(!createUserPayload.id || !createUserPayload.email) {
        throw new Error("Missing required user fields");
    }
    try {
        const response = await apiClient.post("/users", createUserPayload);
        return response.data;
    } catch (err) {
        console.error("Failed to create user:", err);
        throw err;
    }
};


// function to update an extsing user
export const updateUser = async(userUpdatePayload) =>{
    if(!userUpdatePayload || typeof userUpdatePayload !== 'object') {
        throw new Error("Invalid payload provided for updating user");
    }
    if(!userUpdatePayload.id) {
        throw new Error("Missing required user id field");
    }

    const payload  = {}; 
    if (userUpdatePayload.full_name && userUpdatePayload.full_name.trim() !== "" && userUpdatePayload.full_name !== undefined) {
            payload.full_name = userUpdatePayload.full_name;
    }
    if (userUpdatePayload.preferred_first_name && userUpdatePayload.preferred_first_name.trim() !== "" && userUpdatePayload.preferred_first_name !== undefined) {
        payload.preferred_first_name = userUpdatePayload.preferred_first_name;
    }
    if (userUpdatePayload.phone_number && userUpdatePayload.phone_number.trim() !== "" && userUpdatePayload.phone_number !== undefined) {
        payload.phone_number = userUpdatePayload.phone_number;
    }
    try{
        const response = await apiClient.patch("/users/me", payload);
        return response.data;
    } catch (err){
        console.error(err);
        throw err;
    }
}




// function to delete the user account - by email
export const deleteUser = async(email = null, id = null) =>{
    if (!email && !id) {
        throw new Error("Email or Id is required for deleting the user");
    }

    const pram = new URLSearchParams();
    if (email) {
        pram.append("email", email);
    }
    if (id) {
        pram.append("id", id);
    }

    try{
        const response = await apiClient.delete(`/users?${pram.toString()}`);
        return response.data;
    } catch (err) {
        console.error(err);
        throw err;      
    }
};

