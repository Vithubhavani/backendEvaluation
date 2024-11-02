const mongoose=require('mongoose')
const {User}=require('./user.schema')

const taskSchema=new mongoose.Schema({
   title:{
    type:String,
    required:true
   },
   priority:{
    type:String,
    enum:['Lowpriority','Highpriority','Moderatepriority'],
    required:true
   },
   checklist:[
    {
        type:String
    }
   ],
   assignee:{
    type:mongoose.Schema.Types.ObjectId,
    ref:User,
    required:true
   },

 state: {
    type: String,
    enum: ['backlog', 'inprogress', 'todo', 'done'], 
    default: 'backlog', 
    required: true
 },
 dueDate: {
    type: Date,
    default:null,
    required: true
   
 },

   creator:{
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true
   },
   createdAt:{
    type:Date,
    default:Date.now
   }
});

const Task=mongoose.model("Task",taskSchema)

module.exports={Task}