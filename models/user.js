const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:3,
        maxlength:50
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true

    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    profilePic : {
        type : String
    }
    },{timestamps:true});

const user=mongoose.model("User",userSchema);
module.exports=user;