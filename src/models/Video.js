import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({  //schema 메서드로 새로운 스키마 객체를 생성 
	title: {type: String, required:true, trim:true, maxLength:80},
	fileUrl: {type: String, required: true},
	description: {type: String, required:true, trim:true, minLength:5},
	createdAt: {type: Date, required:true, default: Date.now},
	hashtags: [{type: String, trim: true}], //string이 배열의 첫 요소로 저장됨 
    meta: {
		views: {type: Number, default:0, required:true},
		rating: {type: Number, default:0, required:true},
    },
	owner: {type: mongoose.Schema.Types.ObjectId, ref:"User",required:true},
});

videoSchema.static('hashtagFormatting', function(hashtags){   //videoschema를 사용한 모델은 hashtagFormatting이라는 메서드를 가짐 
	return hashtags.split(",").map((word) => (word.startsWith("#") ? word :`#${word.trim()}`))
})

const movieModel = mongoose.model("Video",videoSchema);
export default movieModel; 
  
  