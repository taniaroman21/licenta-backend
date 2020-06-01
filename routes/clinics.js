var _ = require('lodash');
const { Clinic, validate } = require('../models/clinic');
const { User } = require('../models/user');
const { Doctor } = require('../models/doctor');
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

    const exstingUser = await Clinic.findOne({ email: req.body.email }) ||
        await User.findOne({ email: req.body.email }) ||
        await Doctor.findOne({ email: req.body.email });
    if (exstingUser) return res.status(400).send("A user with this email address already exists");

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const clinic = new Clinic({ isClinic: req.body.isClinic, email: req.body.email, name: req.body.name, county: req.body.county, city: req.body.city, password: hashedPassword });
        await clinic.save();

        res.send(_.pick(clinic, ["email", "name", "county", "city"]));
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/:id', async (req, res) => {
    const clinic = await Clinic.findById(req.params.id).select("-password");
    res.send(clinic);
});

router.get('/', async (req, res) => {
    const clinics = await Clinic.find().select('-password');
    res.send(clinics);

});

router.put('/update', auth, async (req, res) => {
    if (req.user._id == req.body._id) {
        let clinic = await Clinic.findById(req.body._id);
        if (!clinic) res.status(404).send("Clinic with this id does not exist");
        try {
            clinic.set({
                description: req.body.description,
                workingHours: req.body.workingHours,
            })
            const result = await clinic.save();
            const { password, ...updatedClient } = result._doc;
            res.send(updatedClient);
        } catch (error) {
            res.send(error);
            console.log(error)
        
        }
    }
    else res.status(401).send("Unauthorized");
});



module.exports = router;