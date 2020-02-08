const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = Schema({
    username:{type:String,unique:true,required:true,trim:true},
    password:{type:String,required:true,trim:true}
})

const User = mongoose.model('User',userSchema)

module.exports = User