import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    text : {type:String, required:true},
    video: {type: mongoose.Schema.Types.ObjectId, ref:"Video",required:true},
    owner: {type: mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    createdAt: {type: Date, required:true, default: Date.now},
});

const Comment = mongoose.model("Comment",commentSchema);
export default Comment;