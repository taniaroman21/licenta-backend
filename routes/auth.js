const jwt = require('jsonwebtoken');
var _ = require('lodash');
const { User: UserRegister } = require('../models/user');
const express = require('express');
const bcrypt = require('bcrypt');
const Joi = require('@hapi/joi');
const auth = require('../middleware/auth');


const router = express.Router();
router.use(express.json());
router.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.sendStatus(400).send(result.error.details[0].message);
        return;
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email or password");
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) return res.status(400).send("invalid username or password");
    const token = user.generateToken();
    res.send({ token: token });
})
function validate(req) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });

    return schema.validate(req);
}

module.exports = router;