const express = require("express");
const mongoose=require('mongoose');
const dotenv = require("dotenv");
// const fs = require("fs");
const bodyparser=require("body-parser")
const {incomingrequest}=require('./moddleware/index')
const cors=require("cors")

dotenv.config();
const app = express();
app.use(cors({
    origin: 'https://frontend-final-evaluation.vercel.app', 
    methods: 'GET, POST, PUT, DELETE',
    credentials: true,  
}));

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}));

const indexRouter=require('./routes/index');
const userRouter=require('./routes/user');
const taskRouter=require('./routes/task')
const {header}=require("express-validator")



app.use(incomingrequest);
app.use("/api/s1",indexRouter);
app.use("/api/s1/user",userRouter);
app.use("/api/s1/task",taskRouter);


app.listen(process.env.PORT,()=>{
    console.log("server started on port 3000");
    mongoose.connect(process.env.MONGOOSE_URI_STRING,{

    });
    mongoose.connection.on('error',err=>{
        console.log('Database connection error:', err);
    });
    
});