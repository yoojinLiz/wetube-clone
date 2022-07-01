import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3 ({
credentials: {
	accessKeyId : process.env.AWS_ID,
	secretAccessKey: process.env.AWS_SECRET
}
})

const multerUploader = multerS3 ({
	s3:s3,
	bucket: "wetube-yoojinoh",
	acl: "public-read",
})

// localsMiddleware는 server.js에서 app.use로 사용된다! 
export const localsMiddleware = (req,res,next) => {
    res.locals.loggedIn= Boolean(req.session.loggedIn);
    res.locals.loggedInUser= req.session.loggedInUser || {};
    res.locals.siteName= "Wetube";
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

// export const avatarUpload = multer({
// 	dest:"uploads/avatars", 
// 	limits : {
// 		filesize: 3000000, //단위는 byte (= 3MB)
// 	},
// 	storage: multerUploader,
// });


export const avatarUploadHandler= (req, res, next) => {
    const avatarUpload = multer({
		dest:"uploads/avatars", 
		limits : {
			fileSize: 3000000, //단위는 byte (= 3MB)
		},
		storage: multerUploader,
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


// export const videoUpload = multer({
// 	dest:"uploads/videos", 
// 	limits : {
// 		filesize: 10000, //단위는 byte (= 10MB)
// },
// 	storage: multerUploader
// });

export const videoUploadHandler= (req, res, next) => {
    const videoUpload = multer({
		dest:"uploads/videos", 
		limits : {
			fileSize: 1000000000000000, //단위는 byte (= 10MB)  
		},
		storage: multerUploader,
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
