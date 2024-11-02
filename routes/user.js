const express=require("express");
const router=express.Router();
const bcrypt=require("bcrypt");
const jsonwebtoken=require("jsonwebtoken")
const {User}=require("../schema/user.schema")
const dotenv=require("dotenv");
dotenv.config();
const {body,validationResult} =require('express-validator')


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

const checkUserExists = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id); // Assuming req.user.id is set from authentication middleware
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        req.user = user; // Attach user to the request object
        next();
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};


router.put('/update',
    [
        // Email validation
        body('email').optional().isEmail().withMessage('Please enter a valid email'),
        // Password length validation
        body('newPassword').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    checkUserExists,
    async (req, res) => {
        const { name, email, oldPassword, newPassword } = req.body;
        const errors = validationResult(req);

        // Handle validation errors
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const user = req.user;
        let forceLogout = false; 

        // If the user wants to update the password
        if (oldPassword && newPassword) {
            // Check if the old password matches
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect old password" });
            }
            // Hash the new password and update it
            user.password = await bcrypt.hash(newPassword, 10);
            forceLogout = true; // Force logout if the password is changed
        }

        // Update email if provided
        if (email && email !== user.email) {
            user.email = email;
            forceLogout = true; // Force logout if the email is changed
        }

        // Update name if provided
        if (name) {
            user.name = name;
        }

        try {
            await user.save();
            res.json({ message: "User updated successfully", forceLogout });
        } catch (err) {
            res.status(500).json({ message: "Error updating user" });
        }
    }
);






  


    

module.exports=router