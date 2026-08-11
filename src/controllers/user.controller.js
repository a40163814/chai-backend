import {asyncHandler} from '../utils/asyncHandler.js';
import{ApiError} from '../utils/apiError.js';
import {uploadOncloudinary} from '../utils/cloudinary.js';
import {User} from '../models/user.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
const registerUser=asyncHandler(async (req,res)=>{
    // get user detail from frontend
    // validation-not empty
    // check if user already exists:username,email
    //check for images and avatar means files
    // upload them to cloudinary,avatar
    // create user object - create entry in db
    // remove password and  refresh token  fieldfrom response user object
    // check for user creation
    // return response
    const {fullname ,username,email,password} = req.body
    console.log("email:",email);
    if([fullname,username,email,password].some((field)=>field?.trim()==="")){
        throw new ApiError("please fill all fields",400);

    }
    const existedUser=  User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError("user with this username or email already exists",409);
    }
       const avatarLocalPath= req.files?.avatar[0]?.path;
       const coverImageLocalPath= req.files?.coverImage[0]?.path;
       if(!avatarLocalPath ){
        throw new ApiError("please upload avatar ",400);
       }
       const avatar= await uploadOncloudinary(avatarLocalPath);
       const coverImage= await uploadOncloudinary(coverImageLocalPath);
       if(!avatar ){
        throw new ApiError("please upload avatar ",400);
       }
        const user= await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        username : username.toLowerCase(),
        email,
        password,
       })
      const createdUser= await User.findById(user._id).select("-password -refreshToken");
      if(!createdUser){
        throw new ApiError("user not found while registering",500);
      }
      return res.status(201).json(new ApiResponse(200,createdUser,"user register successfully"));
    // if(fullname===""){
    //     throw new ApiError("fullname is required",400);

    // }
})
export {registerUser}