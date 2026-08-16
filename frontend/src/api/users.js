import apiClient from "../lib/apiClient";
import User  from "../models/user";

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
        const { data } = await apiClient.get(`/users?${urlParam.toString()}`);
        if (data && Array.isArray(data)) {
            return data.map((item) => User.fromApiResponse(item));
        }
        return [];
    } catch (err) {
        console.error(err);
        throw err;
    }
};


// get user by ID
export const getUserById = async(userID) =>{
    if (!userID) {
        throw new Error("User ID is required to fetch user details");
    }
    try{
        const { data } = await apiClient.get(`/users?id=${userID}`);
        if (data && Array.isArray(data) && data.length > 0) {
            return User.fromApiResponse(data[0]);
        }
        throw new Error("User not found"); 
    } catch (err) {
        console.error(err);
        throw err;
    }
};


//get all users
export const getAllUsers = async() =>{
    try{
        const { data } = await apiClient.get(`/users`);
        if (data && Array.isArray(data)) {
            return data.map((item) => User.fromApiResponse(item));
        }
        return [];
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
        const { data } = await apiClient.post("/users", createUserPayload);
        return User.fromApiResponse(data);
    } catch (err) {
        console.error("Failed to create user:", err);
        throw err;
    }
};


// function to update an existing user
export const updateUser = async (userID, userUpdatePayload) => {

  console.log("Updating user with ID:", userID, "with payload:", userUpdatePayload);
  if (!userUpdatePayload || typeof userUpdatePayload !== "object") {
    throw new Error("Invalid payload provided for updating user");
  }
  if (!userID) {
    throw new Error("Missing required user id field");
  }

  if (userUpdatePayload.full_name && userUpdatePayload.full_name.trim() == ""){
    throw new Error("Full name cannot be empty");
  }

  const payload = {};

  if (userUpdatePayload.full_name !== undefined && userUpdatePayload.full_name.trim() !== "") {
    payload.full_name = userUpdatePayload.full_name.trim();
  }
  if (userUpdatePayload.preferred_first_name !== undefined) {
    payload.preferred_first_name = userUpdatePayload.preferred_first_name;
  }
  if (userUpdatePayload.phone_number !== undefined) {
    payload.phone_number = userUpdatePayload.phone_number;
  }

  try {
    const { data } = await apiClient.patch(`/users/${userID}`, payload);
    return User.fromApiResponse(data);
  } catch (err) {
    console.error("Failed to update user:", err);
    throw err;
  }
};




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

