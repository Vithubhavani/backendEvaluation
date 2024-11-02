const dotenv=require("dotenv")
const jwt=require("jsonwebtoken")
dotenv.config()

const isauth=(req)=>{
    const token=req.headers.authorization;
    if(!token){
        return false;
    }

    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        return true;
    }
    catch(error){
        return false;
    }
}

module.exports=isauth