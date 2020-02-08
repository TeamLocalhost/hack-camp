const express = require('express')
const app = express()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const db_uri = "mongodb+srv://user:mongodb@mymongo-mwtdo.mongodb.net/localhost?retryWrites=true&w=majority"
mongoose.connect(db_uri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

app.use(express.json())

const router = require('express').Router()
const bcrypt = require('bcryptjs')
let User = require('../authentication/user.models.js')

const connection = mongoose.connection

connection.once('open', () => {
    console.log('MongoDB connected ')
})
// get all users for debug
router.route('/all').get((req, res) => {
    User.find().select({ "_id": 0, "username": 1 })
        .then(users => res.json(users))
        .catch(err => res.status(400).json("error: " + err))
})

// validate a login event
app.post('/login', (req, res) => {

    User.findOne({ username: req.body.username }, (err, record) => {
        try {
            bcrypt.compare(req.body.password, record.password, (err, status) => {
                if (err)
                    res.status(400).send({ status: "password not supplied" })
                else {
                    if (status == true) {
                        let token = jwt.sign({userid:req.body.username},'frontendsucks')
                        res.status(200).send({ status:"success",auth_token: token })
                    }

                    else
                        res.status(300).send({ status: "fail" })
                }
            })
        }
        catch (err) {
            res.send({ status: "user does not exist" })
        }
    })

})


app.post('/signup', (req, res) => {
    const username = req.body.username
    const password_intial = req.body.password
    if (password_intial.length >= 4) {
        bcrypt.hash(password_intial, 4, (err, password) => {
            if (err)
                res.status(400).send({ status: "failed to create account" })
            else {
                const newUser = new User({ username, password })

                newUser.save()
                    .then(() => res.status(200).send({ status: "created" }))
                    .catch((err) => res.status(400).send({ status: "username taken" }))
            }

        })
    }
    else {
        res.status(300).send({ status: "failed to create account. password lesser than 4 characters" })
    }

})

app.listen(8888, () => {
    console.log('created..')
})