var _ = require('lodash');
const { User, validate } = require('../models/user');
const { Clinic } = require('../models/clinic');
const { Doctor } = require('../models/doctor');
const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const ResourcesService = require('../services/resources.service');
const multer = require('multer');

const router = express.Router();
router.use(express.json());

router.post('/register', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.sendStatus(400).send(error.details[0].message + "The object you are is not valid");
        return;
    }
    const exstingUser = await Clinic.findOne({ email: req.body.email }) ||
        await User.findOne({ email: req.body.email }) ||
        await Doctor.findOne({ email: req.body.email });
    if (exstingUser) return res.status(400).send("A user with this email address already exists");

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let user = new User({ email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName, password: hashedPassword });
        await user.save();

        res.send(_.pick(user, ["email", "firstName", "lastName"]));
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/:id', auth, async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    res.send(user);
});

router.put('/:id', auth, async (req, res) => {
    if (req.user._id != req.params.id) return res.status(401).send("Unauthorized");
    try {
        const user = await User.findById(req.params.id);
        user.set('phone', req.body.phone);
        const response = await user.save();
        res.send(response);
    } catch (error) {
        res.status(500).send(error);
    }
    

});
router.put('/:id/upload', auth, async (req, res) => {
    if (req.user._id !== req.params.id) res.status(401).send("Not allowed");
    try {
       await ResourcesService.uploadUserProfileImage(req, res);
    } catch (error) {
        res.status(500).send(error);
    }

})


module.exports = router;