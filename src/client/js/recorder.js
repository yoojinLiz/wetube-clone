import {createFFmpeg, fetchFile} from "@ffmpeg/ffmpeg"

const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile; 

//오타의 가능성을 줄이기 위해 객체 생성! 
const files = {
    input: "recording.webm",
    output: "output.mp4",
    thumb: "thumbnail.jpg",
};

const makeDownload = (fileUrl, fileName) => {
    const a = document.createElement("a");
    a.href= fileUrl;
    a.download = fileName;
    document.body.appendChild(a);// 여기까지 하면 stop Recording까지 한 후 html에 아래와 같은 a태그가 생성되어 있음!  
    a.click();
};

const handleDownload = async() => {
    actionBtn.innerText = "Transcoding...";
    actionBtn.removeEventListener("click",handleDownload);
    actionBtn.disabled= true;
    
    const ffmpeg = createFFmpeg({
        corePath: '/ffmpeg/ffmpeg-core.js',
        log: true
        });
    console.log("ffmpeg is ready!")
    await ffmpeg.load();
    console.log("ffmpeg has been loaded!")
    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
    console.log("writeFile has been loaded!")

    await ffmpeg.run("-i", files.input, "-r","60",files.output)
    await ffmpeg.run("-i",files.input,"-ss","00:00:01","-frames:v","1",files.thumb)
    console.log("output file and thumbnail have been created!")
    const mp4File = ffmpeg.FS("readFile",files.output)
    const thumbFile = ffmpeg.FS("readFile",files.thumb)

    const mp4Blob = new Blob([mp4File.buffer], {type:"video/mp4"});
    const thumbBlob = new Blob([thumbFile.buffer], {type:"image/jpg"});

    const mp4Url = URL.createObjectURL(mp4Blob);
    const thumbUrl = URL.createObjectURL(thumbBlob);

    makeDownload(thumbUrl,"MyThumbnail.jpg")
    makeDownload(mp4Url,"MyRecording.mp4")
    
    // 다운 받고 난 후에도 만들어놓은 파일들을 계속 link하고 있으면 브라우저가 느려지기 때문에, unlink 해준다. 
    ffmpeg.FS("unlink",files.output);
    ffmpeg.FS("unlink",files.thumb);
    ffmpeg.FS("unlink",files.input); 
    URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumbUrl);

    actionBtn.innerText = "🔴 Start Recording";
    actionBtn.addEventListener("click",handleStartBtn);
    actionBtn.disabled = false; 
};


const handleStop = async() => {
    actionBtn.innerText = " ⬇️ Download Recording";
		actionBtn.removeEventListener("click",handleStop);
		actionBtn.addEventListener("click",handleDownload);
		recorder.stop()
}
const handleStartBtn = async() => {
    actionBtn.innerText = "Stop Recording";
    actionBtn.removeEventListener("click", handleStartBtn);
    actionBtn.addEventListener("click", handleStop);
    recorder= new MediaRecorder(stream,{mimeType:"video/webm"}) ;
		recorder.ondataavailable = (event) => {
			videoFile = URL.createObjectURL(event.data); 
			console.log("videoFile",videoFile); // -> 콘솔에 어떤 Url이 남겨진다! 
			video.srcObject = null;
			video.src = videoFile; // 이제 실제 비디오의 src가 해당 파일이 된다! 
            video.loop= true;
			video.play();
		}
    recorder.start();
}
const init = async() => {
    stream = await navigator.mediaDevices.getUserMedia({
        audio:false,
        video:{width:"1024", height:"576"},
    });
    video.srcObject = stream;
    video.play();   
}
init()

actionBtn.addEventListener("click", handleStartBtn);



