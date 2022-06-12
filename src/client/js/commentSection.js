import "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const commentContainer = document.getElementById("commentContainer");
const form = document.getElementById("commentForm");
const deleteIcon = document.querySelectorAll(".deleteIcon")
console.log(deleteIcon);

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const newCommentDisplay = document.createElement("div");
  const newCommentDisplayText = document.createElement("div");
  const newCommentDisplayDelete = document.createElement("div");
  newCommentDisplay.className="comment-display";
  newCommentDisplayText.className="comment-display-text";
  newCommentDisplayDelete.className="comment-display-deleteIcon";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = "❌";
  newComment.appendChild(newCommentDisplay);
  newCommentDisplay.appendChild(newCommentDisplayText);
  newCommentDisplay.appendChild(newCommentDisplayDelete);
  newCommentDisplayText.appendChild(icon);
  newCommentDisplayText.appendChild(span);
  newCommentDisplayDelete.appendChild(span2);
  videoComments.prepend(newComment);
  console.log("refresh?");
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.videoid;
  if (text === "") {
    return;
  }
  //   div#videoContainer(data-videoId=video._id)
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    const { newCommentId } = await response.json();
    addComment(text, newCommentId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}

const handleCommentDelete = async(event) => {
  console.log(event)
  const commentId = commentContainer.dataset.id;
  const videoId = videoContainer.dataset.videoid;
  console.log("commentId",commentId)
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commentId, videoId }),
  });
  console.log("resonse", response)
  if (response.status === 201) {
      event.target.parentNode.parentNode.parentNode.remove();
    }
  }

if (deleteIcon){
  deleteIcon.forEach((btn) => btn.addEventListener("click", handleCommentDelete));
}
