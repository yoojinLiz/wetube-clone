import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
	email : {type:String, required: true, unique: true, uppercase:true, trim:true},
	username : {type:String, required: true, unique: true, uppercase:true, trim:true},
	password : {type:String},
	name : {type:String, required: true, uppercase:true, trim:true},
	location : {type: String, uppercase:true, trim:true},
	avatarUrl: {type: String, default: "https://wetube-yoojinoh.s3.ap-northeast-2.amazonaws.com/7f86aebc4f4caa0bac277b58db89a4a6" },
	githubLoginOnly:{type: Boolean, default: false },
	kakaoLoginOnly: {type: Boolean, default: false },
	kakaoId: {type: Number, default: false },
	videos: [{type: mongoose.Schema.Types.ObjectId, ref:"Video",required:true}]
});

userSchema.pre("save", async function(){
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password,5); // this= user 라고 이해하면 됨
	}})

const User = mongoose.model("User",userSchema);
export default User;