var _ = require('lodash');
const { Clinic, validate } = require('../models/clinic');
const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(express.json());

router.post('/register', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.sendStatus(400).send(error.details[0].message);
        return;
    }
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        let clinic = new Clinic({ isClinic: req.body.isClinic, email: req.body.email, name: req.body.name, county: req.body.county, city: req.body.city, password: hashedPassword });
        await clinic.save();

        res.send(_.pick(clinic, ["email", "name", "county", "city"]));
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/me', auth, async (req, res) => {
    const clinic = await Clinic.findById(req.clinic._id).select("-password");
    res.send(clinic);
})
router.get('/', async (req, res) => {
    const clinics = await Clinic.find().select('-password');
    res.send( clinics);

 })

module.exports = router;