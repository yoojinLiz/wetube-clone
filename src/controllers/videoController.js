import Video from "../models/Video"
import User from "../models/User"

export const trending = async(req,res)=> {
	const videos = await Video.find({}).sort({createdAt:"desc"}).populate("owner");
	return res.render("home", {pageTitle:"Home", videos});
};

export const watch = async(req,res) => {
    const {id}= req.params;
	const video = await Video.findById(id).populate("owner");
    if(video===null) {
        return res.status(404).render("404", {pageTitle: "Video Not Found"});
    }
    return res.render("watch",{pageTitle:`Watching : ${video.title}`, video});
};

export const getEdit =async(req,res) => {
    const {id}= req.params;
    const {loggedInUser : {_id}}= req.session;
    const video = await Video.findById(id);
    if(video===null) {
        return res.render("404", {pageTitle: "Video Not Found"});
    }
    if (String(video.owner) !== String(_id)) { 
        return res.status(403).redirect("/");
    }
    return res.render("edit",{pageTitle:`Editing : ${video.title}`, video});
};

export const postEdit = async(req,res) => {
    const {id}= req.params;
    const {loggedInUser : {_id}}= req.session;
    const {title, description, hashtags} = req.body;
    const video = await Video.findById(id);
    if(video===null) {
        return res.render("404", {pageTitle: "Video Not Found"});
    }
    if (String(video.owner) !== String(_id)) { 
        return res.status(403).redirect("/");
    }
    try { 
        await Video.findByIdAndUpdate(id, {title, description, hashtags:Video.hashtagFormatting(hashtags)})
        return res.redirect("/");            
    } catch(error) {  
     return res.render("upload", { pageTitle: "Upload Video", errorMessage: error._message,})
    }
};

export const getUpload = (req, res) => {
    return res.render("upload",{pageTitle: "Upload Video"})
}; 

export const postUpload = async (req, res) => {
    const { session: {loggedInUser: {_id} }, file: {path} , body: {title, description, hashtags}} = req;
    try{
        const newVideo = await Video.create({
            title,
            description,
            hashtags: Video.hashtagFormatting(hashtags),
            fileUrl:path,
            owner: _id
        });
        const user = await User.findById(_id);
        await user.videos.push(newVideo._id);
        await user.save();
        return res.redirect("/");
    } catch(error) {  
        return res.render("upload", { pageTitle: "Upload Video", errorMessage: error._message,})
    }
}

export const deleteVideo = async(req,res) => {
    const {id}=req.params;
    const {loggedInUser : {_id}}= req.session;
    const video = await Video.findById(id);
    if(!video) {
        return res.render("404", {pageTitle: "Video Not Found"});
    }
    if (String(video.owner) !== String(_id)) { 
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}

export const search = async(req,res) => {
    const {keyword}=req.query;
    let videos = [];
    if(keyword) {
        videos = await Video.find({title: keyword}).populate("owner");
	 }
    res.render("search",{pageTitle:"Search Video", videos});
} 
