const fs=require("fs")
const incomingrequest=(req,res,next)=>{
    var ip=req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    fs.appendFileSync("log.txt",`${ip} ${req.method} ${req.url} ${new Date().toISOString()}\n`);
    next();
}

module.exports = {incomingrequest}