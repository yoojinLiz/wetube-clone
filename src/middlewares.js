export const localsMiddleware = (req,res,next) => {
    res.locals.loggedIn= Boolean(req.session.loggedIn);
    res.locals.loggedInUser= req.session.loggedInUser;
    res.locals.siteName= "Wetube";
    console.log(req.session.loggedInUser);
    console.log(res.locals);
    next();
}

export const protectorMiddleware = (req,res,next) => {
	if(req.session.loggedIn) {
		return next();
	} else {
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