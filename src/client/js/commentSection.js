import "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const commentContainer = document.getElementById("commentContainer");
const form = document.getElementById("commentForm");
const textbox = document.getElementById("add-comment__input");
const addCommentBtn = document.getElementById("add-comment__btn")
const cancelCommentBtn = document.getElementById("cancel-comment__btn")
let deleteIcons = document.querySelectorAll(".comment-display-deleteIcon");


// (시작) 코멘트 입력하는 칸 활성화 시 댓글 취소 버튼과 등록 버튼 보이게 하기 
const hideCommentBtn = () => {
  addCommentBtn.classList.add("no-display");
  cancelCommentBtn.classList.add("no-display");
  const textarea = document.getElementById("add-comment__input")
  textarea.value = "";
}
const showCommentBtn = () => {
  addCommentBtn.classList.remove("no-display");
  cancelCommentBtn.classList.remove("no-display");
}
textbox.addEventListener("focus",showCommentBtn);
if(cancelCommentBtn) {
cancelCommentBtn.addEventListener("click",hideCommentBtn);
}
// (끝) 코멘트 입력하는 칸 활성화 시 댓글 취소 버튼과 등록 버튼 보이게 하기 

const addComment = (text,id,commentOwner,avatarUrl) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  videoComments.prepend(newComment);

  const newCommentDisplay = document.createElement("div");
  newCommentDisplay.className="comment-display";
  newComment.appendChild(newCommentDisplay);

  const newCommentDisplayAvatar = document.createElement("div");
  newCommentDisplayAvatar.className="comment-display-avatar";
  newCommentDisplay.appendChild(newCommentDisplayAvatar);

  const newCommentDisplayText = document.createElement("div");
  newCommentDisplayText.className="comment-display-text";
  newCommentDisplay.appendChild(newCommentDisplayText);
  
  const avatarImg = document.createElement("img")
  avatarImg.src=avatarUrl;
  newCommentDisplayAvatar.appendChild(avatarImg);
  
  const owner = document.createElement("span");
  owner.innerText = ` ${commentOwner}`;
  owner.className = "comment-display-owner";
  newCommentDisplayText.appendChild(owner);

  const content = document.createElement("span");
  content.innerText = ` ${text}`;
  content.className = "comment-display-content";
  newCommentDisplayText.appendChild(content);
  
  const newCommentDisplayDelete = document.createElement("div");
  newCommentDisplayDelete.className="comment-display-deleteIcon";
  newCommentDisplayText.appendChild(newCommentDisplayDelete);

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-solid");
  deleteIcon.classList.add("fa-trash-can");
  newCommentDisplayDelete.appendChild(deleteIcon);
  deleteIcon.addEventListener("click", handleFakeCommentDelete);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  console.log("form", form);
  const textarea = document.getElementById("add-comment__input")
  const text = textarea.value;
  const videoId = videoContainer.dataset.videoid;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const commentInfo = await response.json();
    const commentId = commentInfo.newCommentId
    const commentAvatar = commentInfo.newCommentAvatarUrl
    const commentOwner = commentInfo.newCommentOwner
    addComment(text, commentId, commentOwner, commentAvatar);
  }
};

const handleFakeCommentDelete = async(event) => {
  const commentId = event.target.parentElement.parentElement.parentElement.parentElement.dataset.id; 
  const videoId = videoContainer.dataset.videoid;
  console.log("videoId",videoId);
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
    body: videoId,
  })
  if (response.status === 201) {
    event.target.parentElement.parentElement.parentElement.parentElement.remove();
  }
} 

const handleCommentDelete = async(event) => {
  const commentId = event.target.parentElement.parentElement.parentElement.parentElement.dataset.id; 
  const videoId = videoContainer.dataset.videoid;
  console.log("videoId",videoId);
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
    body: videoId,
  })
  if (response.status === 201) {
    event.target.parentElement.parentElement.parentElement.parentElement.remove();
  }
}

if (form) {
  form.addEventListener("submit", handleSubmit);
}
if (deleteIcons){
  deleteIcons.forEach(icon => icon.addEventListener("click", handleCommentDelete));
}