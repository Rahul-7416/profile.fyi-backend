import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken};

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token");
    }
}

// registering the user
const registerUser = asyncHandler(async (req, res) => {
    // get the user details from the frontend
    const { email, fullname, password } = req.body;

    // validation that the data is not empty
    if (
        [email, fullname, password].some(field => field && field?.trim() === "")
    ) {
        throw new ApiError(404, "All fields are required");
    }

    // check if the user with the same email already exists 
    const existingUser = await User.findOne({email});
    if (existingUser) {
        return res.status(409).json(
            new ApiResponse(409, {}, "User with the given email already exists")
        )
    }

    // create a new user
    const user = await User.create({
        email,
        password,
        fullname,
    });

    // check if the new user created or not
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user!");
    }
    
    // returning response
    return res.status(201).json(
        new ApiResponse(200, "User registered successfully")
    );
});

// login the user
const loginUser = asyncHandler(async (req, res) => {
    // data from the body
    const { email, password } = req.body;

    // validations
    if (!(email && password)) {
        throw new ApiError(400, "email and password is required")
    }

    // find the user -> using the email 
    const user = await User.findOne({email});

    // return a res if user doesn't exists
    if (!user) {
        return res.status(404).json(
            new ApiResponse(404, {}, "No such user exists!")
        );
    }

    // if user exists -> check the password
    const isPasswordValid = await user.isPasswordCorrect(password);

    // return a res if the password is invalid
    if (!isPasswordValid) {
        // throw new ApiError(401, "Password incorrect");
        return res.status(404).json(
            new ApiResponse(404, {}, "Password incorrect!")
        );
    }

    // generating accessToken and refreshToken
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    // remove password and the refreshToken from the user document which we are returning as response
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken ");

    // cookie options
    const options = {
        httpOnly: true,
        secure: true
    }

    // returning the response along with tokens as cookies
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
       new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "Logged in successfully"
       ) 
    );
});

// refresh the accessToken if it is expired -> by using the refreshToken 
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        // cookie config options
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken: newRefreshToken
                },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Error in refreshAccessToken");
    }
});

// logout the user
const logoutUser = asyncHandler(async (req, res) => {
    // find the user from the documents -> by using the user obj, we get from verifyJWT middleware -> as this controller is a part of secured route
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    // cookie config options
    const options = {
        httpOnly: true,
        secure: true,
    }

    // returning the res -> and clearing the cookies containing the access and refresh tokens
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "User logged out")
    );
});

export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
}