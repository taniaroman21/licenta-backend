const jwt = require('jsonwebtoken');
var _ = require('lodash');
const { User } = require('../models/user');
const { Clinic } = require('../models/clinic');
const { Doctor } = require('../models/doctor');
const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');
const { generateToken } = require('../utils/jwt');

const router = express.Router();
router.use(express.json());

router.post('/', async (req, res) => {
    let currentUser;
    const email = req.body.email;
    const { error } = validate(req.body);

    if (error) {
        res.sendStatus(400).send(result.error.details[0].message);
        return;
    }

    const user = await User.findOne({ email: email });
    currentUser = user;

    if (!user) {
        const clinic = await Clinic.findOne({ email: email });
        currentUser = clinic;
        if (!clinic) {
            const doctor = await Doctor.findOne({ email: email });
            currentUser = doctor;

            if (!doctor) return res.status(400).send("Invalid email or password");
        }
        
    }

    const validPassword = validatePassword(req.body.password, currentUser);
    
    if (!validPassword) return res.status(400).send("invalid username or password");
    const token = generateToken(currentUser.id, currentUser.getType());
    const { password, ...response } = currentUser._doc;
    res.send({ token: token, userType: currentUser.getType(), user: response });
});

function validate(req) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    return schema.validate(req);
}

async function validatePassword(password, object) {
    const validPassword = await bcrypt.compare(password, object.password);
    return validPassword;
}

module.exports = router;