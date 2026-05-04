const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = 3007;


app.use(express.json());

const Users = require("./models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { uploadImage } = require('./multerconfig')

mongoose.connect("mongodb://localhost:27017/assessment")
.then(() => console.log("Database connected successfully"))
.catch(err => console.log(err));


//Authentication middleware
const auth = (req,res,next)=>{
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) return res.status(401).json({mess : " token is not found"});

    try{
        const decode = jwt.verify(token,"nandani@123");
        req.user = decode;
        next();
    }
    catch(err){
        console.log(err);
        return res.status(400).json({mess : " Error"});
    }
    
}



//Authentication APIs
app.post("/api/auth/register",async(req,res)=>{
    try{

        const {name,email,password} = req.body;
        const newpassword = await bcrypt.hash(password,10);
        await Users.create({
            name,
            email,
            password : newpassword,
        })
        
        return res.status(200).json({message:"user inserted sucessfully"})
    }
        catch(err){
            console.log(err);
            return res.status(500).json({message:"An error occured"});
        }
})

app.post('/api/auth/login',async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user2 = await Users.findOne({email});
        if(!user2) return res.status(400).json({message : "Invalid email"});

        const result = await bcrypt.compare(password,user2.password);

        const token = await jwt.sign(
            {
                id : user2._id,
                role : user2.role
            },
            "nandani@123",
        );

        console.log(token);

        if(!result){
            return res.status(400).json({message : "Invalid password"});
             
        }
        
        return res.status(200).json({message : "Login successfully", token : token});
        

    }
    catch(err){
        console.log(err);
        return res.status(500).json({message : "An error occured"});
    }
})

app.get("/api/auth/me", auth, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
});




//User Management APIs
app.get('/api/users',async(req,res)=>{
    try{
        const users = await Users.find({});       
        return res.status(200).json({users : users});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message : "An error occured"});
    }


});

app.get('/api/users/:id', auth, async(req,res)=>{
    try{
        const id = req.params.id;
        const user2 = await Users.findById(id);
        if(!user2) return res.status(404).json({message : "User not found"});
        return res.status(200).json({user : user2});
    }

    catch(err){
        console.log(err);
        return res.status(500).json({message : "An error occured"});
    }
}) ;

app.delete('/api/users/:id', auth, async(req,res)=>{  
    try{
        const id = req.params.id;
        const user2 = await Users.findByIdAndDelete(id);
        if(!user2) return res.status(404).json({message : "User not found"});
        return res.status(200).json({message : "User deleted successfully"});
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message : "An error occured"});
    }
}) ;

app.put('/api/users/:id', auth, async(req,res)=>{ 
    try{
        const id = req.params.id;
        const {name,email} = req.body;
        const user2 = await Users.findByIdAndUpdate(id,{name,email},{new : true});
        if(!user2) return res.status(404).json({message : "User not found"});
        return res.status(200).json({message : "User updated successfully", user : user2});
    }       

    catch(err){
        console.log(err);
        return res.status(500).json({message : "An error occured"});
    }   
}) ;






// Profile picture upload route
app.post('/api/users/upload-profile', auth, uploadImage.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await Users.findByIdAndUpdate(
            req.user.id,
            { profilePic: req.file.path },
            { new: true }
        );

        res.status(200).json({ message: "Profile updated", user });
    } catch (err) {
        console.log("upload-profile error:", err);
        res.status(500).json({
            message: "Error uploading image",
            error: err,
        });
    }
});






app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
