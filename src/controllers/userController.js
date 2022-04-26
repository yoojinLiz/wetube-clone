import User from "../models/User"
import bcrypt from "bcrypt"
import fetch from "node-fetch"

export const getJoin = (req,res) => res.render("join",{pageTitle: "Create Account"});
export const postJoin = async(req,res) => {
    const {name, email, username, password, password2, location }= req.body;
    if (password !== password2) {
        return res.status(400).render("join", {pageTitle: "Error", errorMessage:"Your password confirmation does not match."})
    }
    const existing = await User.exists({$or: [{username},{email}] })
    if (existing) {
        return res.status(400).render("join", {pageTitle: "Error", errorMessage:"Your email/username is already taken."})
    }
    try{
        await User.create({
            name,
            email,
            username,
            password,
            location
        });
        return res.redirect("/login");
    } catch(error) {
        res.render("join",{pageTitle:"Error", errorMessage:error._message})
    }
};
export const getLogin = (req,res) => res.render("login",{pageTitle:"Login"});
export const postLogin = async(req,res) => {
    const {username, password} = req.body;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(400).render("login",{pageTitle:"Login", errorMessage:"Sorry, the account with this username does not exist."})
    }
    
    const ok= await bcrypt.compare(password,user.password)
    if(!ok){
        return res.status(400).render("login",{pageTitle:"Login", errorMessage:"Sorry, Wrong password."})
    }
    req.session.loggedIn = true;
    req.session.loggedInUser = user;
    console.log("LOG USER IN!")
    return res.redirect("/");
};
export const logout = (req,res) => {
	req.session.destroy(); // 세션 끊기
	return res.redirect("/");
}
export const getEdit= (req,res) => {
    return res.render("edit-profile", {pageTitle:"Edit Profile" })
};
export const postEdit= async(req,res) => {
    const {session: {loggedInUser: {_id}}, body:{name, email, username, location}} = req;
    const sessionUsername = req.session.loggedInUser.username;
    const sessionEmail = req.session.loggedInUser.email;
    let existingUsername, existingEmail = false
    if (!sessionUsername===username) {
        existingUsername = await User.exists({username});
    } else if (!sessionEmail===email) {
        existingEmail = await User.exists({email});
    } 
    if (existingUsername || existingEmail) {
        return res.status(400).render("edit-profile", {pageTitle: "Error", errorMessage:`Your username/email is already taken.`})
    } else {
    const updatedUser = await User.findByIdAndUpdate(_id, {name, email, username, location}, {new:true});
    req.session.loggedInUser = updatedUser;
    }   





    
    return res.redirect("/users/edit")
};
export const remove = (req,res) => res.render("remove");

export const startGithubLogin =(req,res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id:process.env.GH_CLIENT,   
        allow_signup:false,
        scope:"read:user read:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl= `${baseUrl}?${params}`;
    res.redirect(finalUrl);
}
export const finishGithubLogin = async(req,res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id:process.env.GH_CLIENT,
        client_secret:process.env.GH_SECRET,
		code: req.query.code, 
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl= `${baseUrl}?${params}`;
    const tokenRequest= await(await fetch(finalUrl, {
			method:"POST",
			headers: {
				Accept:"application/json"
			}
	})).json();
    if("access_token" in tokenRequest) {
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await(
             await fetch(`${apiUrl}/user`, { 
                headers: { Authorization: `token ${access_token}` }
                 })).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                },
            })
        ).json();
        const emailObj = emailData.find((email) => email.primary===true && email.verified===true); 
        if (!emailObj) {
        //error notification
        console.log("no email object");
        }
        let user = await User.findOne({email:emailObj.email});
        console.log("this is the existing user info", user);
        if(!user) { 
            user = await User.create({
                    avatarUrl: userData.avatar_url,
                    name: userData.name, 
                    username: userData.login, 
                    email: emailObj.email, 
                    password: "", 
                    location: userData.location, 
                    githubLoginOnly: true})
            console.log("this is new user information" , user);
        }
        req.session.loggedIn = true;
        req.session.loggedInUser = user;

        return res.redirect("/");        
    } else { 
    // error notification 
    console.log("no access_token")
    }
           
}


