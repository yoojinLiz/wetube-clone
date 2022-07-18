import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const isHeroku = process.env.NODE_ENV === "production" ;

const s3 = new aws.S3 ({
credentials: {
	accessKeyId : process.env.AWS_ID,
	secretAccessKey: process.env.AWS_SECRET
}
})

const s3imageUploader = multerS3 ({
	s3:s3,
	bucket: "wetube-yoojinoh/images", // image 디렉토리로 지정 
	acl: "public-read",// ACL(객체에 대한 접근 권한). public-read로 전달해야 files are publicly-read. 
	contentType: multerS3.AUTO_CONTENT_TYPE,
})
const s3videoUploader = multerS3 ({
	s3:s3,
	bucket: "wetube-yoojinoh/videos", // videos 디렉토리로 지정 
	acl: "public-read",// ACL(객체에 대한 접근 권한). public-read로 전달해야 files are publicly-read. 
	contentType: multerS3.AUTO_CONTENT_TYPE,
})

// localsMiddleware는 server.js에서 app.use로 사용된다! 
export const localsMiddleware = (req,res,next) => {
    res.locals.loggedIn= Boolean(req.session.loggedIn);
    res.locals.loggedInUser= req.session.loggedInUser || {};
    res.locals.siteName= "Wetube";
	res.locals.isHeroku = isHeroku ;
    next();
} 

export const protectorMiddleware = (req,res,next) => {
	if(req.session.loggedIn) {
		return next();
	} else {
		req.flash("error","Login First");
		return res.redirect("/login");
	}
};

export const publicOnlyMiddleware = (req,res,next) => {
	if(!req.session.loggedIn) {
		return next();
	} else {
		return res.redirect("/");
	}
}

export const avatarUploadHandler= (req, res, next) => {
    const avatarUpload = multer({
		dest:"uploads/avatars", 
		limits : {
			fileSize: 3000000, //단위는 byte (= 3MB)
		},
		storage: isHeroku? s3imageUploader : undefined,
	}).single('avatar');
    avatarUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.render(
				"edit-profile",
				{pageTitle: "Error", errorMessage:"Your file is too big. Please use the file less than 3MB"}
				)			// A Multer error occurred when uploading.
        } else if (err) {
			return res.render(
				"edit-profile",
				{pageTitle: "Error", errorMessage:"Unknown Error. Sorry."}
				)            // An unknown error occurred when uploading.
        }
        next()
    })
}


export const videoUploadHandler= (req, res, next) => {
    const videoUpload = multer({
		dest:"uploads/videos", 
		limits : {
			fileSize: 1000000000000000, //단위는 byte (= 10MB)  
		},
		storage: isHeroku? s3videoUploader : undefined,
	}).fields([
		{ name: "video", maxCount:1 },
		{ name: "thumb", maxCount:1 },
	 ]);
    videoUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.render(
				"upload",
				{pageTitle: "Error", errorMessage:"Your file is too big. Please use the file less than 10MB"}
				)			// A Multer error occurred when uploading.
        } else if (err) {
			return res.render(
				"upload",
				{pageTitle: "Error", errorMessage:"Unknown Error. Sorry."}
				)            // An unknown error occurred when uploading.
        }
        next()
    })
}

export const cors = (req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
    };

	// app.use((req, res, next) => {
	// 	res.setHeader("Access-Control-Allow-Origin", "*");
	// 	res.header(
	// 	"Access-Control-Allow-Headers",
	// 	"Origin, X-Requested-With, Content-Type, Accept"
	// 	);
	// 	next();
	// 	});