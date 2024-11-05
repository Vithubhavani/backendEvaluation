const express=require("express");
const router=express.Router();
const bcryptjs=require("bcryptjs");
const jsonwebtoken=require("jsonwebtoken")
const {User}=require("../schema/user.schema")
const dotenv=require("dotenv");
dotenv.config();
const {body,validationResult} =require('express-validator')
const authMiddleware=require('../moddleware/auth')
const checkUserExist=require('../moddleware/checkUseExist')


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

router.get(("/"),authMiddleware,async(req,res)=>{

    try{
    const user=await User.findById(req.user)

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user)}
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
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

router.put("/update", [
   
    body('email').optional().isEmail().withMessage('Please enter a valid email'),
    body('newPassword').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('oldPassword').exists().withMessage('Old password is required to update password')
], authMiddleware,  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user); 

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (oldPassword) {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }
    }

    const updateData = {};
    if (newPassword) {
        updateData.password = await bcrypt.hash(newPassword, 10); // Hash the new password
    }
    if (name) {
        updateData.name = name;
    }
    if (email && email !== user.email) {
        updateData.email = email;
    }
 
    const updateCount = Object.keys(updateData).length;
    if (updateCount > 1) {
        return res.status(400).json({ message: "You can only update one detail at a time (name, email, or password)." });
    }

    try {
        await User.findByIdAndUpdate(user._id, updateData, { new: true });
        res.status(200).json({ message: "User updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error, unable to update user" });
    }
});




  


    

module.exports=router