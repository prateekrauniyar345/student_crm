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



// function to post a new user




// function to update an extsing user
export const updateUser = async({full_name, preferred_first_name}) =>{
    try{
        const payload = {}; 
        
        if (full_name && full_name.trim() !== "" && full_name !== undefined) {
            payload.full_name = full_name;
        }
        if (preferred_first_name && preferred_first_name.trim() !== "" && preferred_first_name !== undefined) {
            payload.preferred_first_name = preferred_first_name;
        }

        const response = await apiClient.patch("/users", payload);
        return response.data;
    } catch (err){
        console.error(err);
        throw err;
    }
}






// function delete an existing user