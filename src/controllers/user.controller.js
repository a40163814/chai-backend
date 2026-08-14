import {asyncHandler} from '../utils/asyncHandler.js';
import{ApiError} from '../utils/apiError.js';
import {uploadOncloudinary} from '../utils/cloudinary.js';
import {User} from '../models/user.model.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import bcrypt from 'bcrypt.js';
import jwt from 'jsonwebtoken.js';
const generateAccessAndReferenceTokens=async(userId) =>{
    try{
        const user=await User.findById(userId)
        const accessToken=  user.generateAccessToken();
        const refreshToken=  user.generateRefreshToken();

       user.refreshToken=refreshToken;
       await user.save({validateBeforeSave:false});
       return {accessToken,refreshToken};

    }catch(error){
        throw new ApiError(500,"something went wrong while generating tokens");
    }
}
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
    const {fullName ,username,email,password} = req.body
    console.log("email:",email);
    if([fullName,username,email,password].some((field)=>field?.trim()==="")){
        throw new ApiError("please fill all fields",400);

    }
    const existedUser=  await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError("user with this username or email already exists",409);
    }
    console.log(req.files);
       const avatarLocalPath= req.files?.avatar[0]?.path;
       const coverImageLocalPath= req.files?.coverImage[0]?.path;
       // if coverimage not upload on postman give error  solution is 
       //let coverImagePath;
       //if(req.files&& Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
       //coverImageLocalPath=req.files.coverImage[0].path;}
       if(!avatarLocalPath ){
        throw new ApiError("please upload avatar ",400);
       }
       const avatar= await uploadOncloudinary(avatarLocalPath);
       const coverImage= await uploadOncloudinary(coverImageLocalPath);
       if(!avatar ){
        throw new ApiError("please upload avatar ",400);
       }
        const user= await User.create({
        fullName,
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
    })
      const loginUser= asyncHandler(async(req,res)=>{
        // req body se data le aao
        // ysername or email
        // find the user
        // check password
        // create token both 
      //  send cookies
        // return response
        const{username,email,password}=req.body
        if(!username &&!email){
            throw new ApiError("please fill username or email",400);
            //if(!(username || email)){} ek chahiye to
        }
        const user= await User.findOne({
            $or:[{username},{email}]
        })
        if(!user){
            throw new ApiError("user not found",404);
        }
        const isPasswordCorrect= await user.isPasswordCorrect(password);
        if(!isPasswordCorrect){
            throw new ApiError("password is incorrect",400);
        }
        const {accessToken,refreshToken}= await generateAccessAndReferenceTokens(user._id);
        const loggedInUser =await User.findByIdAndUpdate(user._id).
        select("-password -refreshToken");
        const options={
            httpOnly:true,
            secure:true,
            
        }
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"user login successfully"));

        })
        const logoutUser=asyncHandler(async(req,res)=>{
           
            const user= await User.findByIdAndUpdate(req.user._id,{$set:{refreshToken:"undefined"}},{new:true})
            const options={
            httpOnly:true,
            secure:true,
            
        };
            return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).
            json(new ApiResponse(200,{},"user logout successfully"));

        })
        
        
   
    // if(fullname===""){
    //     throw new ApiError("fullname is required",400);

    // }
    const refreshAccessToken=asyncHandler(async(req,res)=>{
        const incomingrefreshToken= req.cookies.refreshToken || req.body.refreshToken;
        if(!incomingrefreshToken){
            throw new ApiError("unauthorised request",401);
        }
       try{
        const decodedToken= jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user= await User.findById(decodedToken?._id);
        if(!user){
            throw new ApiError("invalid refresh token",401);
        }
        if(user?.refreshToken!==incomingrefreshToken){
            throw new ApiError(" refresh token is expired or used",401);
        }
        // cookies ke liye 
        const options={
            httpOnly:true,
            secure:true,
        }
        const {accessToken,newrefreshToken}= await generateAccessAndReferenceTokens(user._id);
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newrefreshToken,options).json(new ApiResponse(200,
            {accessToken, refreshToken: newrefreshToken},"user login successfully"));
       }
       catch(error){
       
        throw new ApiError(error?.message||"invalid refresh token",401);
       }


    })

    const changeCurrentPassword=asyncHandler(async(req,res)=>{
        const {oldPassword,newPassword}=req.body;
        

        // if(!oldPassword || !newPassword){
        //     throw new ApiError("please fill old password and new password",400);
        // }
        const user= await User.findById(req.user?._id);
        if(!user){
            throw new ApiError("user not found",404);
        }
         const isPasswordCorrect= await user.isPasswordCorrect(oldPassword);
         if(!isPasswordCorrect){
             throw new ApiError("old password is incorrect",400);
        }
         user.password=   newPassword //await user.encryptPassword(newPassword);
        await user.save({validateBeforeSave:false});
        return res.status(200).json(new ApiResponse(200,{},"password changed successfully"));
    })
    const getCurrentUser=asyncHandler(async(req,res)=>{
        // const user= await User.findById(req.user?._id).select("-password -refreshToken");
        // if(!user){
        //     throw new ApiError("user not found",404);
        // }
        return res.status(200).json(new ApiResponse(200,req.user," current user fetch   successfully"));
        
    })
    const updateAccountDetails=asyncHandler(async(req,res)=>{
        const {fullName,email}=req.body;
        if(!fullName || !email){
            throw new ApiError("please fill full name and email",400);
        }
        const user= await User.findByIdAndUpdate(req.user?._id,{$set:{fullName,email}}, {new:true}).select("-password ");
        return res.status(200).json(new ApiResponse(200,user,"user account details updated successfully"));


    })
    const updateUserAvatar=asyncHandler(async(req,res)=>{
        const avatarLocalpath=req.file?.path;
        if(!avatarLocalpath){
            throw new ApiError("please upload avatar",400);
        }
        const avatar=await uploadOncloudinary(avatarLocalPath)
        if(!avatar.url){
            throw new ApiError(" error while uploading avatar ",400);
        }
        const user= await User.findByIdAndUpdate(req.user?._id,{$set:{avatar:avatarLocalpath}}, {new:true}).select("-password ");
        return res.status(200).json(new ApiResponse(200,user,"user avatar updated successfully"));


    })
    const updateUserCoverImage=asyncHandler(async(req,res)=>{
        const coverImageLocalpath=req.file?.path;
        if(!coverImageLocalpath){
            throw new ApiError("please upload cover image",400);
        }
        const coverImage=await uploadOncloudinary(coverImageLocalPath)
        if(!coverImage.url){
            throw new ApiError(" error while uploading cover image ",400);
        }
        const user= await User.findByIdAndUpdate(req.user?._id,{$set:{coverImage:coverImage.url}}, {new:true}).select("-password ");
        return res.status(200).json(new ApiResponse(200,user,"user coverimage updated successfully"));


    })
export {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage};