import jwt from 'jsonwebtoken';
import {User} from '../models/user.model.js';
import {ApiError} from '../utils/ApiError.js';
import {asyncHandler} from '../utils/asyncHandler.js';







export const verifyJWT=asyncHandler(async(req,res)=>{//next.
    try{
        const token=req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError("unauthorised token",401);
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        req.user=await User.findById(decodedToken?.id).select("-password -refreshToken");
        if(!req.user){
            throw new ApiError("invalid access token",401);
            
        }
        req.user=user;
        //next();
    }catch(error){
        throw new ApiError(error?.message||"invalid access token",401);
    }

    
})