const mongoose = require('mongoose');
const Schema = mongoose.Schema
const userSchema = new mongoose.Schema({
    text:{
        type:String
    },
    postUser:{type:Schema.Types.ObjectId,
        ref:'Register'},
    likers:[{type:Schema.Types.ObjectId,
    ref:'Register'}],
    comment:[{
        text:{type:String},
        user:{type:Schema.Types.ObjectId,
        ref:'Register'}
    }]

})
const Post = mongoose.model("Post",userSchema);

exports.Post = Post;