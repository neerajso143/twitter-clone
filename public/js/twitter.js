const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const formComment = document.getElementById('sendComment');

const socket = io();

var userID, username;

//set userdetails of its ID and username on front side
socket.on("userdetails", message => {
  // console.log("userdetails", message)
  userID = message._id,
  username = message.username
})

//set all previous posts
socket.on("allpost", message => {
  // console.log(message)
  if (message && message.length) {
    for (let i = 0; i < message.length; i++) {
      let data = {
        username: message[i].postUser.username,
        text: message[i].text,
        postId: message[i]._id
      }
      // console.log(message[i])
      // console.log(data)
      outputMessage(data);

  let comments = message[i].comment;
  // console.log("comment",comments)
  for(let j = 0 ;j < comments.length; j++ ){
    let likes = message[i].likers
    for(let k = 0 ; k < likes.length; k ++){
      if(likes[k].toString() == userID.toString() ){
        let button = document.getElementById(message[i]._id).style.backgroundColor='#667aff';
        break;
        }
      }
    let div = document.getElementById("comment"+message[i]._id);
    const para = document.createElement('p');
    para.classList.add('text');
    let commentObj = comments[j]
    para.innerText =commentObj.user.username + ":"+ commentObj.text;
    div.appendChild(para)
      }
    }
  }
})

// Message from server
socket.on('message', message => {
  // console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});


socket.on('liked', (likers) => {
    userID = message.id,
    username = message.username
})

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // Get message text
  let msg = e.target.elements.msg.value;
  msg = msg.trim();
  if (!msg) {
    return false;
  }
  // console.log(msg)
  // Emit message to server
  let data = {
    userId: userID,
    message: msg,
    username: username
  }
  //emit message to server
  socket.emit('chatMessage', data);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

//Comment Submit
function sendCommentToserver(e) {
  e.preventDefault()
  // console.log("This is a comment");
  let textComment = e.target.elements.comment.value;
  let postId = e.target.elements.sendComment.value;
  textComment = textComment.trim();
  if (!textComment) {
    return false
  }
  // console.log(textComment);
  let data = {
    userID : userID,
    comment : textComment,
    postId: postId

  }
  socket.emit('chatComment', data);

  e.target.elements.comment.value = '';
  e.target.elements.msg.focus();
}

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  const button = document.createElement("button");
  button.setAttribute("id", message.postId);
  button.setAttribute("onclick", "sendLike(this.id)");
  button.innerHTML = "like";
  div.appendChild(button);
  const divcomment = document.createElement("div");
  const comment = document.createElement('div');

  var commentdiv = document.createElement('div');
  commentdiv.setAttribute('id',"comment"+message.postId);
  div.appendChild(commentdiv);

  var formComment = document.createElement('form');
  const input = document.createElement('input');
  var button1 = document.createElement('button');
  formComment.setAttribute("id","sendComment");
  formComment.setAttribute("onsubmit","sendCommentToserver(event)");
  input.setAttribute("id", "comment");
  button1.setAttribute("id","sendComment");
  button1.setAttribute("value",message.postId);
  button1.innerHTML = "comment";
  formComment.appendChild(input);
  formComment.appendChild(button1);
  div.appendChild(formComment);  
  document.querySelector('.chat-messages').appendChild(div);
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//user like post
function sendLike(id) {
  // console.log("yes you click on like button", id);
  let button = document.getElementById(id).style.backgroundColor='#667aff';
  let data = {
    'postId': id,
    'userID': userID
  }
  socket.emit("likePost", data);
}

//user comment on post
socket.on('comment',(comment)=>{
  let div = document.getElementById("comment"+comment.postId);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText =comment.username + ":"+ comment.comment;
  div.appendChild(para);
  // console.log("recevie comment",comment);
});