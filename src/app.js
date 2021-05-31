require('dotenv').config();
const config = require("config");
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
require("./database/connection");
const Register = require("./models/registration");
const { Post } = require("./models/post");


const socketio = require('socket.io');
const http = require('http');
const server= http.createServer(app);
const io = socketio(server);

var user ;
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname,'../public')));//Set static folder

app.post("/register", async(req,res)=>{
    try{
            const registerUser = new Register({
                fullname: req.body.fullname,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
            })
           const registered = await registerUser.save();
               res.sendFile(path.join(__dirname,"../public/index.html"))
    }catch(error){
        console.log(error)
        res.status(400).send(error);
    }
})

app.post("/login", async(req,res)=>{
  try{
        // console.log(req.body);
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});
        const token = await useremail.generateAuthToken();

        res.cookie("jwt",token,{
          expires:new Date(Date.now() + 60000),
          httpOnly:true,

        })
        // console.log("---");
        if(password === useremail.password){
          user = useremail
            res.sendFile(path.join(__dirname,"../public/twitter.html"))
            return
        }
        
        res.send("Invalid Login Details");
      }catch (error){
        res.status(400).send("Invalid Login Details")
    }
})

//Get all Posts
app.get("/allpost",async(req,res)=>{
  let allpost = await Post.find().populate({path:"postUser",select:"fullname email username"});
  res.send(allpost)
})

//Runs when client connected
io.on('connection',async socket => {
   //console.log("New user connected",socket.id);

  // welcome current user 
  socket.emit("userdetails",user);
  let allpost = await Post.find().populate({path:"postUser",select:"username"}).populate('comment.user','username');
  
  //send post data
  socket.emit("allpost",allpost);
  
  //listen for chatMessage
  socket.on('chatMessage',async (msg)=>{
    // console.log(msg)
    let post = new Post({
      text:msg.message,
      likers:[],
      comment:[],
      postUser:msg.userId
    })
    await post.save()
    let data = {
      username:msg.username,
      text:msg.message,
      postId:post._id
    }
    io.emit('message',data);
  })
  
  //likes store in database
  socket.on("likePost", async (message)=>{
    // console.log("likePost",message)
    let postUpdate = await Post.findOneAndUpdate({_id:message.postId},{$push:{likers:message.userID}})
    // console.log(postUpdate);
  })
  
  //comments store in database
  socket.on("chatComment", async(message)=>{
    //  console.log("chatComment",message)
    let comment = {
      text  : message.comment,
      user : message.userID
    }
    let commentUpdate = await Post.findOneAndUpdate({_id:message.postId},{$push:{'comment': comment}})
    //  console.log(commentUpdate);
    let userObject = await Register.findOne({_id:message.userID}).select('username')
    // console.log(userObject);
    let data = {
      postId : message.postId,
      userId : message.userID,
      comment: message.comment,
      username : userObject.username
    }
    io.emit('comment',data);
  })
})

//server running on port
let port = 3001 || process.env.PORT ;
server.listen(port,()=>{
    console.log(`Server running on port: ${port}`);
})