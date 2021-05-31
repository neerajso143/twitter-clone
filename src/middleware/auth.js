const jwt = require('jsonwebtoken');
const Register = require("../models/registration.js");

const auth = async (req,res,next) =>{
    // console.log("hello")
    try{
        const token = req.cookies.jwt;
        // console.log(req.cookies.jwt)
        const verifyUser = jwt.verify(token,process.env.SECRET_KEY);
        // console.log(verifyUser);

        const user = await Register.findOne({_id:verifyUser._id})
        // console.log(user);
        next();
    }catch (error){
        // console.log('error')
        res.status(401).send(error);
    }
}

module.exports = auth;