const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const User = require('../models/user')

router.post('/tasks', async(req, res)=>{
    try{
        const task = new Task(req.body)
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
        
})

// GET /tasks?completed=true
// GET /tasks?sortBy:createdAt=desc
router.get('/tasks', async(req, res)=>{    
    const match = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'?-1:1
    }
    try{
        await req.user.populate({
            path:'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        const task = await Task.find()
        res.status(200).send(task)        
    }catch(e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', async (req, res)=>{
    try{
        const _id= req.params.id
        const task = await Task.findById(_id)
        if(!task) 
            return res.status(404).send(e)
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates=['description', 'completed']
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })//called for every item.

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'})
    }

    try{
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}) 
        //3rd param: options, the original user with updates applied, runs validator to check the validations.
        if(!task){
            return res.status(404).send()
        }
        res.status(200).send(task)
    }   catch(e){ //reach to catch when exceptional case runs.
        res.status(404).send(e)
    }
})

router.delete('tasks/:id', async(req, res)=>{
    try{
        const task = await User.findByIdAndDelete(req.params.id)
        if(!task) {
            return res.status(404).send()
        }
        res.status(204).send()
    }   catch(e){ //reach to catch when exceptional case runs.
        res.status(404).send(e)
    }
})


module.exports = router
