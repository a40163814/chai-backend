import { Router} from "express";
import {registerUser,loginUser, updateAccountDetails} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import {refreshAccessToken,changeCurrentPassword,changeNewPassword,getCurrentUser,updateUserAvatar,updateUserCoverImage,getUserProfile,getWatchHistory,getUserChannelProfile,logoutUser} from '../controllers/user.controller.js';
import jwt from "jsonwebtoken";
const router=Router();
router.route("/register").post( upload.fields([{name:"avatar",maxCount:1},{name:"coverImage",maxCount:1}]),registerUser);
router.route("/login").post(loginUser);
// secure routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refreshAccessToken").post(refreshAccessToken);
router.route ("/change-Password").post(verifyJWT,changeCurrentPassword);

router.route("/current-user").get(verifyJWT,getCurrentUser);
router.route("/update-account").post(verifyJWT,updateAccountDetails);
router.route("/avatar").patch(verifyJWT, upload.single("avatar"),updateUserAvatar);
router.route("/coverImage").patch(verifyJWT, upload.single("/coverImage"),updateUserCoverImage);
router.route("/c/:username").get(verifyJWT,getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatchHistory);
export  default router;
