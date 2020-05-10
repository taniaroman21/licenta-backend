var _ = require('lodash');
const { User, validate } = require('../models/user');
const express = require('express');
const bcrypt = require('bcrypt');
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

router.post('/register', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.sendStatus(400).send(result.error.details[0].message);
        return;
    }
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

router.get('/me', auth, async (req, res) => {
    const user = User.findById(req.user._id).select("-password");
    res.send(user);
})

module.exports = router;