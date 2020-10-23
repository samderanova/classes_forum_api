const router = require('express').Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// a test get route to test if mongodb connection works
router.route('/').get((req, res) => {
    User.find()
        .then(user => res.json(user))
        .catch(err => res.status(400).json(`Error: ${err}`));
})

// when registering for an account 
router.route('/adduser').post((req, res) => {
    // taking the request body (which is in JSON) and then assigning value to variables
    const name = req.body.name;
    const email = req.body.email;
    var hashed = bcrypt.hashSync(req.body.password, 10) // hashes the password and sends this to the DB
    const password = hashed;
    const pic = req.body.pic == '' ? 'default img' : req.body.pic; // replace 'default img' with a url of a blank profile pic
    const major = req.body.major;
    const year = req.body.year;
    const classes = req.body.classes;
    const contacts = req.body.contacts;
    const newUser = new User({name, email, password, pic, major, year, classes, contacts});
    newUser.save()
        .then(_ => res.json("User added!" + " " + contacts))
        .catch(err => res.status(400).json(`Error: ${err}`));
})

// delete an account
// When adding users, MongoDB adds a unique id to each one. This finds a user by their MongoDB id and deletes them.
router.route('/deleteuser/:id').delete((req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then(_ => res.json('User deleted!'))
        .catch(err => res.status(400).json(`Error: ${err}`));
})

// updating profile info
router.route('/updateprofile/:id').put((req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body, {new: true})
        .catch(err => res.status(400).json(`Error: ${err}`))
})

// get profile info after finding by id
router.route('/getprofile/:id').get((req, res) => {
    User.findById(req.params.id)
    .then(user => res.json(user))
    .catch(err => res.status(400).json(`Error: ${err}`))
})

// get list of all users by class
router.route('/getusers/class/:class').get((req, res) => {
    User.find({ classes: req.params.class })
    .then(user => res.json(user))
    .catch(err => res.status(400).json(`Error: ${err}`))
})

// get list of all users by major
router.route('/getusers/major/:major').get((req, res) => {
    User.find({ major: req.params.major })
    .then(user => res.json(user))
    .catch(err => res.status(400).json(`Error: ${err}`))
})

router.route('/getclasses').get((req, response) => {
    axios.get('https://api.peterportal.org/rest/v0/courses/all')
    .then(res => {
        response.send(res.data.map(c => c.department + " " + c.number).sort())
    })
    .catch(err => res.json(err))
})

module.exports = router;