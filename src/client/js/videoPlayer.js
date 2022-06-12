const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteIcon = muteBtn.querySelector("i");
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullscreen");
const fullScreenIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControlers = document.getElementById("videoControlers");

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue =0.5
video.volume= volumeValue;

const handlePlayClick = (event) => {
    if(video.paused){
		video.play();
        playIcon.classList.remove("fa-play")
        playIcon.classList.add("fa-pause")
    } else {
		video.pause();
        playIcon.classList.remove("fa-pause")
        playIcon.classList.add("fa-play")
    }
}
const handleMute = (event) => {
	if(video.muted) {
		video.muted= false;
        muteIcon.classList.remove("fa-volume-xmark");
        muteIcon.classList.add("fa-volume-high");
	} else {
		video.muted= true;
        muteIcon.classList.remove("fa-volume-high");
        muteIcon.classList.add("fa-volume-xmark");

	}
	// muteBtn.innerText = video.muted ? "Unmute" : "Mute" ;
    volumeRange.value = video.muted ? "0" : volumeValue ; 
}
const handleVolumeChange = (event) =>  {ㄴ
	const {target: {value},
		}= event;	
	if (video.muted) {
		video.muted = false;
		muteBtn.innerText = "Mute";	
} 
	volumeValue = value;
	video.volume = value ;
}
const formatTime = (seconds) => {
	return new Date(seconds *1000).toISOString().substring(14,19);
}
const handleLoadedMetaData = (event) => {
	totalTime.innerText =	formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
}
const handleTimeUpdate = (event) => {
    currentTime.innerText =	formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
}
const handleTimelineChange = () => {
    video.currentTime = timeline.value ;
}
const handleFullScreen = () => {
    const fullscreen = document.fullscreenElement;
    if(fullscreen) { // 현재 fullscreen 모드라면 
        document.exitFullscreen();
        fullScreenIcon.classList.remove("fa-compress");
        fullScreenIcon.classList.add("fa-expand");
    } else { // fullscreen이 아니라면
        videoContainer.requestFullscreen();
        fullScreenIcon.classList.remove("fa-expand");
        fullScreenIcon.classList.add("fa-compress");
    }
}

const hideControls = () => videoControlers.classList.remove("showing");

const handleMouseMove = () => {
    if(controlsTimeout) {
        clearTimeout(controlsTimeout);
        controlsTimeout = null;
    }
    if(controlsMovementTimeout) {
        clearTimeout(controlsMovementTimeout) ; 
        controlsMovementTimeout = null ;
    }
    videoControlers.classList.add("showing");
    const controlsMovementTimeout = setTimeout(hideControls,3000);
}
const handleMouseLeave = () => {
    const controlsTimeout=  setTimeout(hideControls, 3000);
}

const shortcuts = (event) => {
    const {key, code} = event;
    if(key === "F"|| key ==="f") {
        handleFullScreen()
    } else if(key === "Escape") {
        console.log("escape!");
        const fullscreen = document.fullscreenElement;
        if(fullscreen) {
        document.exitFullscreen();
        fullScreenBtn.innerText= "Enter Full Screen"
        }
    } else if (key === " ") {    
        handlePlayClick();
    }
};

const handleEnded = () => {
    const id = videoContainer.dataset.videoid;
    fetch(`/api/videos/${id}/view`, {method:"POST"});
}

play.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click",handleMute );
volumeRange.addEventListener("input",handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreen);
video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
window.addEventListener("keydown", shortcuts);