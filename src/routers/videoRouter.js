import express from "express";
import {watch, getEdit, postEdit, getUpload, postUpload, deleteVideo}  from "../controllers/videoController"
import { protectorMiddleware, videoUploadHandler } from "../middlewares";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-z]{24})", watch);
videoRouter.route("/:id([0-9a-z]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
videoRouter.route("/upload")
    .all(protectorMiddleware)
    .get(getUpload)
    .post(videoUploadHandler,postUpload);
videoRouter.route("/:id([0-9a-z]{24})/delete").all(protectorMiddleware).get(deleteVideo);

export default videoRouter ; 