import "../scss/styles.scss"
import "regenerator-runtime";

console.log("hi! it's working");

const searchBtn = document.getElementById("searchBtn");
const uploadBtn = document.getElementById("uploadBtn");
const userEditBtn = document.getElementById("userEditBtn");
const logoutBtn = document.getElementById("logoutBtn");
const searchMsgBox = document.getElementById("hover-message-search")
const uploadMsgBox = document.getElementById("hover-message-upload")
const userEditMsgBox = document.getElementById("hover-message-edit")
const logoutMsgBox = document.getElementById("hover-message-logout")


const showSearchHoverMsg = ()=> {
    searchMsgBox.classList.remove("no-display");
}
const hideSearchHoverMsg = ()=> {
    searchMsgBox.classList.add("no-display");
}
const showUploadHoverMsg = ()=> {
    uploadMsgBox.classList.remove("no-display");
}
const hideUploadHoverMsg = ()=> {
    uploadMsgBox.classList.add("no-display");
}

const showEditHoverMsg = ()=> {
    userEditMsgBox.classList.remove("no-display");
}
const hideEditHoverMsg = ()=> {
    userEditMsgBox.classList.add("no-display");
}

const showLogoutHoverMsg = ()=> {
    logoutMsgBox.classList.remove("no-display");
}
const hideLogoutHoverMsg = ()=> {
    logoutMsgBox.classList.add("no-display");
}

searchBtn.addEventListener("mouseover",showSearchHoverMsg);
searchBtn.addEventListener("mouseout",hideSearchHoverMsg);
uploadBtn.addEventListener("mouseover",showUploadHoverMsg);
uploadBtn.addEventListener("mouseout",hideUploadHoverMsg);
userEditBtn.addEventListener("mouseover",showEditHoverMsg);
userEditBtn.addEventListener("mouseout",hideEditHoverMsg);
logoutBtn.addEventListener("mouseover",showLogoutHoverMsg);
logoutBtn.addEventListener("mouseout",hideLogoutHoverMsg);




