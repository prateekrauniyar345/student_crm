import apiClient from "../lib/apiClient";
import User from "../models/user";


export const getUsers = async ({
    id,
    full_name,
    email,
    preferred_first_name,
    phone_number,
    is_active,
    user_timezone
} = {}) => {
    try {
        const urlParam = new URLSearchParams();
        if (id) {
            urlParam.append("id", id);
        }
        if (full_name) {
            urlParam.append("full_name", full_name);
        }
        if (email) {
            urlParam.append("email", email);
        }
        if (preferred_first_name) {
            urlParam.append(
                "preferred_first_name",
                preferred_first_name
            );
        }
        if (phone_number) {
            urlParam.append(
                "phone_number",
                phone_number
            );
        }
        // false is a valid value, so don't use:
        // if (is_active)
        if (is_active !== undefined && is_active !== null) {
            urlParam.append(
                "is_active",
                String(is_active)
            );
        }
        if (user_timezone) {
            urlParam.append(
                "user_timezone",
                user_timezone
            );
        }
        const query = urlParam.toString();
        const { data } = await apiClient.get(query ? `/users/?${query}` : "/users/");
        if (Array.isArray(data)) {
            return data.map(
                (item) => User.fromApiResponse(item)
            );
        }
        return [];
    } catch (err) {
        console.error("Failed to fetch users:", err);
        throw err;
    }
};



export const getUserById = async (userID) => {
    if (!userID) {
        throw new Error(
            "User ID is required to fetch user details"
        );
    }
    try {
        const params = new URLSearchParams();
        params.append("id", userID);
        const { data } = await apiClient.get(
            `/users/?${params.toString()}`
        );
        if (Array.isArray(data) && data.length > 0) {
            return User.fromApiResponse(data[0]);
        }
        throw new Error("User not found");
    } catch (err) {
        console.error("Failed to fetch user:", err);
        throw err;
    }
};


export const getAllUsers = async () => {
    try {
        const { data } = await apiClient.get("/users/");
        if (Array.isArray(data)) {
            return data.map(
                (item) => User.fromApiResponse(item)
            );
        }
        return [];
    } catch (err) {
        console.error("Failed to fetch all users:", err);
        throw err;
    }
};



export const createUser = async (createUserPayload) => {
    if ( !createUserPayload || typeof createUserPayload !== "object") {
        throw new Error(
            "Invalid payload provided for creating user"
        );
    }
    // These are the required fields.
    if (!createUserPayload.id) {
        throw new Error("User ID is required");
    }
    if (!createUserPayload.email) {
        throw new Error("Email is required");
    }
    if ( !createUserPayload.full_name || createUserPayload.full_name.trim() === "") {
        throw new Error("Full name is required");
    }

    try {
        const { data } = await apiClient.post("/users/",createUserPayload);
        return User.fromApiResponse(data);
    } catch (err) {
        console.error("Failed to create user:",err);
        throw err;
    }
};




export const updateUser = async ( userID, userUpdatePayload) => {
    console.log("Updating user with ID:", userID, "with payload:", userUpdatePayload);

    if (!userID) {
        throw new Error("Missing required user id field");
    }

    if (!userUpdatePayload || typeof userUpdatePayload !== "object") {
        throw new Error("Invalid payload provided for updating user");
    }

    /*
     * full_name is NOT NULL in db.
     *
     * Therefore:
     * full_name = null   X
     * full_name = ""     X
     */
    if (userUpdatePayload.full_name !== undefined) {
        if (
            userUpdatePayload.full_name === null ||
            typeof userUpdatePayload.full_name !== "string" ||
            userUpdatePayload.full_name.trim() === ""
        ) {
            throw new Error("Full name cannot be empty or null");
        }
    }
    const payload = {};
    // ---------------------
    // full_name
    // ---------------------
    if (userUpdatePayload.full_name !== undefined) {
        payload.full_name = userUpdatePayload.full_name.trim();
    }

    // ---------------------
    // preferred_first_name
    // NULL is allowed
    // ---------------------
    if (userUpdatePayload.preferred_first_name !== undefined) {
        payload.preferred_first_name = userUpdatePayload.preferred_first_name;
    }

    // ---------------------
    // phone_number
    // NULL is allowed
    // ---------------------
    if (userUpdatePayload.phone_number !== undefined) {
        payload.phone_number = userUpdatePayload.phone_number;
    }

    // ---------------------
    // is_active
    //
    // true  allowed
    // false allowed
    // null  allowed
    // ---------------------
    if (userUpdatePayload.is_active !== undefined) {
        payload.is_active = userUpdatePayload.is_active;
    }

    // ---------------------
    // user_timezone
    //
    // timezone string allowed
    // null allowed
    // ---------------------
    if (userUpdatePayload.user_timezone !== undefined) {
        payload.user_timezone = userUpdatePayload.user_timezone;
    }

    // Nothing actually changed
    if (Object.keys(payload).length === 0) {
        throw new Error("No fields were provided for update");
    }

    try {
        const { data } = await apiClient.patch(`/users/${userID}`,payload);
        return User.fromApiResponse(data);
    } catch (err) {
        console.error("Failed to update user:",err);
        throw err;
    }
};




export const deleteUser = async (email = null, id = null ) => {
    if (!email && !id) {
        throw new Error("Email or ID is required for deleting the user");
    }

    const param = new URLSearchParams();
    if (email) {
        param.append("email", email);
    }
    if (id) {
        param.append("user_id", id);
    }
    try {
        const response = await apiClient.delete(`/users/?${param.toString()}`);
        return response.data;
    } catch (err) {
        console.error("Failed to delete user:",err);
        throw err;
    }
};

