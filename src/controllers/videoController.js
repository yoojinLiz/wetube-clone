import Video from "../models/Video"

export const trending = async(req,res)=> {
	const videos = await Video.find({});
	return res.render("home", {pageTitle:"Home", videos});
};

export const watch = async(req,res) => {
    const {id}= req.params;
	const video = await Video.findById(id);
    if(video===null) {
        return res.status(404).render("404", {pageTitle: "Video Not Found"});
    }
    return res.render("watch",{pageTitle:`Watching : ${video.title}`, video});
};

export const getEdit =async(req,res) => {
    const {id}= req.params;
    const video = await Video.findById(id);
    if(video===null) {
        return res.render("404", {pageTitle: "Video Not Found"});
    }
    return res.render("edit",{pageTitle:`Editing : ${video.title}`, video});
};

export const postEdit = async(req,res) => {
    const {id}= req.params;
    const {title, description, hashtags} = req.body;
    const video = await Video.findById(id);
    if(video===null) {
        return res.render("404", {pageTitle: "Video Not Found"});
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
    const {title, description, hashtags} = req.body;
    try{
        await Video.create({
            title,
            description,
            hashtags: Video.hashtagFormatting(hashtags),
        });
        return res.redirect("/");
    } catch(error) {  
        return res.render("upload", { pageTitle: "Upload Video", errorMessage: error._message,})
    }
}

export const deleteVideo = async(req,res) => {
    const {id}=req.params;
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}

export const search = async(req,res) => {
    const {keyword}=req.query;
    let videos = [];
    if(keyword) {
        videos = await Video.find({title: keyword});
	 }
    res.render("search",{pageTitle:"Search Video", videos});
} 

export const upload =(req,res) => res.render("upload");