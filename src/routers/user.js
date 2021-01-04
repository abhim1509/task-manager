const express = require('express')
const { update } = require('../models/user')
const router = new express.Router()
const multer = require('multer')

const User = require('../models/user')
const auth = require("../middlewares/auth")

router.post('/users', async(req, res) => {
    try{
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
        
    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login', async(req, res) =>{
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }
    catch(e){
        res.status(400).send(e)
    }
})
router.get('/users', auth, async (req, res)=>{
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
        
        const user = await User.findById(req.params.id)

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

const upload = multer({
    dest: 'avatar',
    limits: {
        fileSize: 100000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error("Please upload word file."))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    req.user.avatar = req.file.buffer
    await req.user.save()
    res.status(200).send()
}, (error, req, res, next)=>{
   //Important to provide all four argument, so express knows to handle errors.
    res.status(400).send({error : error.message})
})

router.delete('/users/me/avatar', auth, async(req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('users/:id/avatar', async(req, res)=>{
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)        
    }
    catch(e){
        res.status(404).send()
    }
})

module.exports = router

//res.set("Content-tYpe" json) is already taken care by express.
//middleware upload.single
//fileName should match the key under form-data - request creation.
