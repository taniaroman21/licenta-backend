const jwt = require('jsonwebtoken');
var _ = require('lodash');
const { User } = require('../models/user');
const { Clinic } = require('../models/clinic');
const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');

const router = express.Router();
router.use(express.json());

router.post('/', async (req, res) => {
    let isClinic = false;
    let clinic;
    const { error } = validate(req.body);
    if (error) {
        res.sendStatus(400).send(result.error.details[0].message);
        return;
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
        clinic = await Clinic.findOne({ email: req.body.email });
        if (!clinic) return res.status(400).send("Invalid email or password");
        else isClinic = true;
    }
    const validPassword = isClinic ? await bcrypt.compare(req.body.password, clinic.password) : await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send("invalid username or password");
    const token = isClinic ? clinic.generateToken() : user.generateToken();
    res.send({ token: token, isClinic: isClinic });
})
function validate(req) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    return schema.validate(req);
}

module.exports = router;