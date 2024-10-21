const express = require("express");
const fs=require("fs");
const router = express.Router();

router.get("/p",(req,res)=>{
    res.send("hello");   
 })

module.exports = router;