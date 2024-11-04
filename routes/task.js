const express=require("express");
const router=express.Router();
const authMiddleware=require('../moddleware/auth')
const {Task}=require("../schema/task.schema")
const isauth=require('../utils/utils')
const {z}=require("zod")
const {validateRequest}=require('zod-express-middleware');
const {User}=require('../schema/user.schema')



router.post("/",authMiddleware,async(req,res)=>{
    try{
        const{title, priority, checklist, assignee,state, dueDate}=req.body;
        const {user}=req;
        const assigneeEmail=await User.findOne({ email: assignee })
        if (!assigneeEmail) {
            return res.status(404).json({ message: "Assignee not found" });
        }
        const task=new Task({title, priority, checklist,assignee:assigneeEmail._id,state,dueDate,creator:user})
        await task.save();
        res.status(200).json({message:'Task created successfully'})
    }
    catch(error){
        console.log(error);
        res.status(400).json({message:"Task not created"})
    }
})

router.get("/",authMiddleware,async(req,res)=>{
    try{
        const tasks = await Task.find({creator:req.user}).populate('assignee creator', 'email');
        res.status(200).json(tasks)
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"server error"})
    }
})

router.get("/assignees", authMiddleware, async (req, res) => {
    try {
        const assignees = await User.find({}, 'email'); // Fetch only email fields
        if (!assignees) {
            return res.status(404).json({ message: "No assignees found" });
        }
        res.status(200).json(assignees);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching assignees" });
    }
});


router.get("/:taskId", async(req,res)=>{
    const {taskId}=req.params;
    const task=await Task.findById(id);
    if(!task){
        return res.status(404).json({message:"Task not found"})

    }

    const taskWithoutAssignee={
        title:task.title,
        priority:task.priority,
        checklist:task.checklist,
        dueDate:task.dueDate
    }
    res.status(200).json(taskWithoutAssignee)
})



router.delete("/:id",authMiddleware,async(req,res)=>{
    const {id}=req.params;
    const task=await Task.findById(id);
    if(!task){
        return res.status(404).json({message:"Task not found"})

    }

    if(task.creator.toString()!=req.user.toString()){
        return res.status(401).json({message:"You are not authorized to delete this task"})
    }
    await Task.findByIdAndDelete(id)
    res.status(200).json({message:"Task deleted successfully"})
})

router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, priority, checklist,asignee,state,dueDate} = req.body;
      
        let task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.creator.toString() !== req.user.toString()) {
            return res.status(401).json({ message: "You are not authorized to update this job" });
        }
        task = await Task.findByIdAndUpdate(id,{title, priority, checklist,asignee,state,dueDate},{new:true});
      
        res.status(200).json(task);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ message: "Task not updated" });
    }

})




 

module.exports=router;