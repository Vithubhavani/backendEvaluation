const express=require("express");
const router=express.Router();
const bcrypt=require("bcrypt");
const jsonwebtoken=require("jsonwebtoken")
const {User}=require("../schema/user.schema")
const dotenv=require("dotenv");
dotenv.config();


router.post("/register",async(req,res)=>{
const{name,email,password}=req.body;
console.log(name,email,password)
const ifUserExists=await User.findOne({email});
if(ifUserExists){
    return res.status(400).json({message:"user already exists"});
}

const hashedPassword=await bcrypt.hash(password,10);
const user=new User({name,email,password:hashedPassword});
await user.save();
res.status(201).json({message:"user created successfully"})

})

router.get(("/"),async(req,res)=>{
    const users=await User.find().select("-password");
    res.status(200).json(users)
})

router.get("/:email",async(req,res)=>{
    const {email}=req.params;
    const user=await User.findOne({email});
    if(!user){
        return res.status(404).json({message:"user not found"})
    }
    res.status(200).json(user);
})

router.post("/login",async(req,res)=>{
    const{email,password}=req.body;
    const user=await User.findOne({email});
    if(!user){
        return res.status(400).json({message:"invalid credentials"})
    }
    const isPasswordCorrect=await bcrypt.compare(password,user.password);
    if(!isPasswordCorrect){
        return res.status(400).json({message:"invalid credentials"})
    }
    const payload={id:user._id};
    const token=jsonwebtoken.sign(payload,process.env.JWT_SECRET);
    res.status(200).json({message:"login successful",token})
})


    

module.exports=router