import express from "express";
import {logout, getEdit, postEdit, getChangePassword, postChangePassword, getProfile, startGithubLogin, finishGithubLogin, startKakaoLogin, finishKakaoLogin, getRemove, postRemove, getUnlink} from "../controllers/userController"
import { protectorMiddleware, publicOnlyMiddleware, avatarUploadHandler} from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout",protectorMiddleware, logout);
userRouter.route("/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    // .post(avatarUpload.single("avatar"), postEdit);
    .post(avatarUploadHandler, postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
// userRouter.route("/unlink").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.route("/unlink").get(getUnlink);
// userRouter.route("/remove").all(protectorMiddleware).get(getRemove).post(postRemove);
userRouter.route("/remove").get(getRemove).post(postRemove);
userRouter.get("/:id",getProfile);
userRouter.get("/github/start",publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish",publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/kakao/start",publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/finish",finishKakaoLogin);





export default userRouter ; 

