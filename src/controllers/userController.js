import User from "../models/User"
import Video from "../models/Video"
import Comment from "../models/Comment"
import bcrypt from "bcrypt"
import fetch from "node-fetch"
import session from "express-session";
import req from "express/lib/request";
import { redirect } from "express/lib/response";

// import { ConfigurationServicePlaceholders } from "aws-sdk/lib/config_service_placeholders";

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
    console.log(username, password); 
    const user = await User.findOne({username});   
    console.log(user);
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
export const getUnlink = async(req,res) => {
    console.log(req.session.user);
    console.log(req.session.loggedInUser);
    if (req.session.loggedInUser.kakaoLoginOnly) {
        const baseUrl = "https://kapi.kakao.com/v1/user/unlink"; 
        const config = {
            target_id_type: "user_id",
            target_id: req.session.loggedInUser.kakaoId,
        };
        const ACCESS_TOKEN = req.session.loggedInUser.kakaoAccessToken ; 
        // const ACCESS_TOKEN = "bzFHjMUeluZu80UmV2P25cjvVlfOJmUHp00KFDkxCisM1AAAAYIc7dsN" ; 
        const params = new URLSearchParams(config).toString();
        const finalUrl= `${baseUrl}?${params}`;
        const unlinkRequest= await fetch(finalUrl, {
            method:"POST",
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`
            }
        });
        console.log("unlinkRequest",unlinkRequest);
    }
    if (req.session.loggedInUser.githubLoginOnly) {
        // 
    }

    req.session.user = null;
    req.session.loggedIn = false;
    res.locals.loggedInUser = req.session.user;
    res.locals.loggedIn = false;
    
    req.session.destroy();
    return res.redirect("/");


}

export const logout = async(req,res) => {

    req.session.user = null;
    req.session.loggedIn = false;
    res.locals.loggedInUser = req.session.user;
    res.locals.loggedIn = false;
    

    req.flash("info"," Bye! ");
	console.log("loggedInUser", res.locals);
    req.session.destroy();
    return res.redirect("/");
    
}
export const getEdit= (req,res) => {
    return res.render("edit-profile", {pageTitle:"Edit Profile" })
};
export const postEdit= async(req,res) => {
    const {
        session: {loggedInUser: {_id, avatarUrl}}, 
        body:{name, email, username, location}, 
        file
        } = req;
    const sessionUsername = req.session.loggedInUser.username;
    const sessionEmail = req.session.loggedInUser.email;
    let existingUsername, existingEmail = false
    if (sessionUsername!==username) {
        existingUsername = await User.exists({username});
    } else if (sessionEmail!==email) {
        existingEmail = await User.exists({email});
    } 
    if (existingUsername || existingEmail) {
        return res.status(400).render("edit-profile", {pageTitle: "Error", errorMessage:`Your username/email is already taken.`})
    } else {
    const updatedUser = await User.findByIdAndUpdate(
            _id, 
            {avatarUrl: file ? (res.locals.isHeroku? file.location : file.path) : avatarUrl, 
                name, 
                email, 
                username, 
                location}, 
            {new:true});
    req.session.loggedInUser = updatedUser;
    }
    return res.redirect("/users/edit")
};
export const getRemove= (req,res) => {
    return res.render("remove");
}; 
export const postRemove = async(req,res) => {
    const {username,kakaoLoginOnly,githubLoginOnly } = req.session.loggedInUser;
    const user = await User.findOne({username});

    if (!kakaoLoginOnly && !githubLoginOnly) {
        const {password} = req.body;
        const ok= await bcrypt.compare(password,user.password);
        if(!ok){
            return res.status(400).render("login",{pageTitle:"Login", errorMessage:"비밀번호가 틀립니다."})
        }
    }
    if (!user) {
        return res.status(400).render("remove",{pageTitle:"remove", errorMessage:"계정이 존재하지 않습니다."})
    }
    if(kakaoLoginOnly) {
        //kakao unlink
        const baseUrl = "https://kapi.kakao.com/v1/user/unlink"; 
        const config = {
            target_id_type: "user_id",
            target_id: user.kakaoId,
        };
        const params = new URLSearchParams(config).toString();
        const finalUrl= `${baseUrl}?${params}`;
        const unlinkRequest= await fetch(finalUrl, {
            method:"POST",
            headers: {
                Authorization: `KakaoAK ${process.env.KA_ADMIN_KEY}`
            }
        });
    }
    // 모르게따.. 깃헙 언링크는 ^^:;;;; 
    // if(user.githubLoginOnly) {
    //     //github unlink access token을 만료 시키자
        
    //     //Authentication

        
    //     const baseUrl = "https://github.com/login/oauth/access_token";
    //     const config = {
    //         client_id:process.env.GH_CLIENT,
    //         client_secret:process.env.GH_SECRET,
    //         code: req.query.code, 
    //     };
    //     const params = new URLSearchParams(config).toString();
    //     const finalUrl= `${baseUrl}?${params}`;
    //     console.log("finalUrl", finalUrl)
    //     const tokenRequest= await(await fetch(finalUrl, {
    //             method:"POST",
    //             headers: {
    //                 Accept:"application/json"
    //             }
    //     })).json();
    //     console.log("tokenRequest",tokenRequest);
    //     if("access_token" in tokenRequest) {
    //         const {access_token} = tokenRequest;
    //         const client_id = process.env.GH_CLIENT
    //         const apiUrl = "https://api.github.com"
    //         const userData = await(
    //             await fetch(`${apiUrl}/${client_id}/token`, { 
    //                 method: "DELETE",
    //                 headers: { 
    //                     Accept: "application/vnd.github+json",
    //                     Authorization: `token ${access_token}`
    //                 },
    //                  })).json();
    //         console.log("userData", userData);
    //         }
    // }

    const commentRemove = await Comment.deleteMany({owner: user._id});
    const videoRemove = await Video.deleteMany({owner: user._id});
    const userRemove = await User.findByIdAndRemove(user._id);

    req.session.user = null;
    req.session.loggedIn = false;

    res.locals.loggedInUser = req.session.user;
    res.locals.loggedIn = false;
    req.session.destroy();

    return res.redirect("/");
};

export const startGithubLogin =(req,res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id:process.env.GH_CLIENT,   
        allow_signup:false,
        scope:"read:user user:email"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl= `${baseUrl}?${params}`;
    res.redirect(finalUrl);
};
export const finishGithubLogin = async(req,res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id:process.env.GH_CLIENT,
        client_secret:process.env.GH_SECRET,
		code: req.query.code, //authorize 후 github에서 받은 temporary code. 이를 사용해서 access token  요청 
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl= `${baseUrl}?${params}`;
    console.log("finalUrl", finalUrl)
    const tokenRequest= await(await fetch(finalUrl, {
			method:"POST",
			headers: {
				Accept:"application/json"
			}
	})).json();
    console.log(tokenRequest);
    if("access_token" in tokenRequest) {
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com"
        const userData = await(
            await fetch(`${apiUrl}/user`, { 
                headers: { 
                    Authorization: `token ${access_token}`
                }
                 })).json();
        console.log("userData", userData);
        const emailData = await(
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`}
            })).json();
        console.log("emailData", emailData)
        const emailObj = emailData.find((email) => email.primary===true && email.verified===true); 
        if (!emailObj) {
            console.log("no email object");
            req.flash("error","gitHub에서 사용 가능한 이메일 정보가 없습니다. 일반 회원가입을 진행해주세요.");
            return res.status(400).redirect("/login");
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
    req.flash("error","문제가 발생하였습니다. 다시 시도해주세요.");
    console.log("no access_token");
    }          
}
export const getChangePassword = (req,res) => {
    res.render("change-password",{pageTitle: "Change Password"})
}
export const postChangePassword = async(req,res) => {
    const {oldPassword, newPassword, newPasswordConfirmation} = req.body;
    const {_id, password} = req.session.loggedInUser; 
    const ok = await bcrypt.compare(oldPassword,password)
    if(!ok){
        return res.status(400).render("change-password",{pageTitle:"Error", errorMessage:"Sorry, The old Password does not match your password."})
    }
    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).render("change-password",{pageTitle:"Error", errorMessage:"Sorry, The new Password and the new Password Confirmation don't match."})
    }
    const hashedNewPassword = await bcrypt.hash(newPassword,5);
    await User.findByIdAndUpdate(_id, {password:hashedNewPassword});
    req.session.destroy(); 
	return res.redirect("/login");
    //send notification
}
export const getProfile = async(req,res) => {
    const {id}= req.params;
    const user = await User.findById(id).populate("videos");
    res.render("profile",{pageTitle: user.username, user} )
}
export const startKakaoLogin= (req,res) => {
    const baseUrl = "https://kauth.kakao.com/oauth/authorize";  
    const config = {
        client_id:process.env.KA_CLIENT, 
        state:process.env.KA_STATE,
        redirect_uri: res.locals.isHeroku? "https://wetube-yoojinoh.herokuapp.com/users/kakao/finish": "http://localhost:4000/users/kakao/finish",
        response_type:"code"
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl= `${baseUrl}?${params}`;
    res.redirect(finalUrl);
};
export const finishKakaoLogin= async(req,res) => {
    let access_token ;
    let kakaoUserId ; 
    const baseUrl = "https://kauth.kakao.com/oauth/token"; 
    const config = {
        grant_type:"authorization_code", 
        client_id:process.env.KA_CLIENT, 
        redirect_uri: res.locals.isHeroku? "https://wetube-yoojinoh.herokuapp.com/users/kakao/finish": "http://localhost:4000/users/kakao/finish",
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
        access_token = tokenRequest.access_token;
        const apiUrl = "https://kapi.kakao.com/v2/user/me";
        const userData = await(
            await fetch(apiUrl, { 
                method: "GET",
                headers: { 
                    Authorization: `Bearer ${access_token}`
                }
                })).json();
        kakaoUserId = userData.id ; 
        console.log("userData", userData, "access_token", access_token, "kakaoUserId", kakaoUserId);
      
        // 이메일 동의 없는 경우 시작
        if (userData.kakao_account.email_needs_agreement) {
            const unlinkBaseUrl = "https://kapi.kakao.com/v1/user/unlink"; 
            const unlinkConfig = {
                target_id_type: "user_id",
                target_id: kakaoUserId,
            };
            const params = new URLSearchParams(unlinkConfig).toString();
            const finalUrl= `${unlinkBaseUrl}?${params}`;
            const unlinkRequest= await fetch(finalUrl, {
                method:"POST",
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            });
            console.log("unlinkRequest",unlinkRequest);
            req.flash("error","카카오 간편 로그인을 위해서는 이메일 제공에 동의해주세요.");
            return res.status(400).redirect("/login");
        }
        // 이메일 동의 없는 경우 끝

        let user = await User.findOne({email:userData.kakao_account.email});
        console.log("user",user)
        if(!user) { 
            user = await User.create({
                    avatarUrl: userData.properties.profile_image,
                    name: userData.properties.nickname, 
                    username: userData.properties.nickname, 
                    email: userData.kakao_account.email, 
                    password: "", 
                    location: "", 
                    githubLoginOnly: false,
                    kakaoLoginOnly : true,
                    kakaoId : kakaoUserId,
                })
        console.log("user is created!")
            }
        console.log(user.kakaoAccessToken);
        user = await User.findByIdAndUpdate(user._id, {kakaoAccessToken : access_token});
        
        console.log(user.kakaoAccessToken);
        req.session.loggedIn = true;
        req.session.loggedInUser = user;
        return res.redirect("/");  
    } else { 
    // error notification 
    console.log("no access_token")
    }   

};





