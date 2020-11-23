const express = require('express')
const { update } = require('../models/user')
const router = new express.Router()
const User = require('../models/user')

router.post('/users', async(req, res) => {
    try{
        const user = new User(req.body)
        await user.save()
        res.status(201).send(user)
        
    }catch(e){
        res.status(400).send(e)
    }
})

router.get('/users', async (req, res)=>{
    try{
        const users = await User.find({})
        res.status(200).send(users)
           
    }catch(e){
        res.status(500).send(e)
    }
})

router.get('/users/:id', async(req, res)=>{
    try{
        const _id= req.params.id
        user = await User.findById(_id)
        if(!user){
            return res.status(404).send(e)
        } 
        
        res.send(user)
    }catch(e){
        res.status(500).send(e)
    }
})

//not working, results not coming in response.
router.patch('/users/:id', async (req, res)=>{
    const updates = Object.keys(req.body)
    const allowedUpdates=['name', 'email','password','age']
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update)
    })//called for every item.

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid updates'})
    }

    try{
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true}) 
        //3rd param: options, the original user with updates applied, runs validator to check the validations.
        if(!user){
            return res.status(404).send()
        }
        res.status(200).send(user)

    }   catch(e){ //reach to catch when exceptional case runs.
        res.status(404).send(e)
    }
})

router.delete('users/:id', async(req, res)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user) return res.status(404).send()
        res.send(user)
    }   catch(e){ //reach to catch when exceptional case runs.
        res.status(404).send(e)
    }
})


module.exports = router