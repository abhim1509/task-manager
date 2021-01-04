const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [
        {
         type: String,
         required: true       
        }
    ],
    avatar: {
        type : Buffer
    }
},
    {
        timestamps: true
    }
)

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({ _id : user._id.toString()},"thisismywebtoken")
    user.tokens.push(token)

    
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error("Unable to login");
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error("Unable to login") //providing single type of error message, thus not providing too much info related to creds.
    }
    return user
}

userSchema.pre('save', async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User

//middleware is way to customise behavious of mongoose model
//mongoose converts the second object to schema.
//We will create schema and pass it 
//This binding issues with arrow function.
//Attaching something to userSchema.statistics can directly use it on model.
//email unique property, creates indexes in db. (need to wipe db and recreate, so index can be setup)
//signup and login routes are public remainig all require authentication.
//Statistics methods work upon models, methods are instance methods.
//Middlewares kept separate.
//Timestamps create two columns createdAt, updatedAt; by default timestamp is false. need to update in model schema.
//Sorting desc = -1, asc =1
