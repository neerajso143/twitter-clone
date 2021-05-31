const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/twitterRegistration',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
}).then(()=>{
    console.log('connected with database');
}).catch((e)=>{
    console.log('No database connection');
})
mongoose.set('debug',true);
module.exports = mongoose;