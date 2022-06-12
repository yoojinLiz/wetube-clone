import multer from "multer";

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

export const avatarUpload = multer({
	dest:"uploads/avatars", 
	limits : {
		filesize: 3000000, //단위는 byte (= 3MB)
	}
});
export const videoUpload = multer({
	dest:"uploads/videos", 
	limits : {
		filesize: 10000, //단위는 byte (= 10MB)
}
});