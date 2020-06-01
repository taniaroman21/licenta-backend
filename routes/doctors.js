var _ = require('lodash');
const { Doctor, validate } = require('../models/doctor');
const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(express.json());

router.post('/register', async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.sendStatus(400).send(error.details[0].message + "The object you are sending is not valid");
        return;
    }
  let doctor = await Doctor.findOne({ email: req.body.email });
  if (doctor) {
    try {
      doctor.clinicIds.push(req.body.clinicId);
      await doctor.save();

      res.send(_.pick(doctor, ["_id", "email", "firstName", "lastName", "fields", "clinicIds"]));
    }
    catch (err) {
      res.status(500).send(error.details[0].message);
    }
  }
  else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let doctor = new Doctor({ email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName, password: hashedPassword,fields: req.body.fields, clinicIds: [req.body.clinicId] });
      await doctor.save();

      res.send(_.pick(user, ["_id", "email", "firstName", "lastName", "fields", "clinicIds"]));
    }
    catch (err) {
      res.status(500).send(err);

    }
  }
});

router.get('/me', auth, async (req, res) => {
  const doctor = await Doctor.findById(req.doctor._id).select("-password");
  res.send(doctor);
});
router.get('/', auth, async (req, res) => {
  const doctors = await Doctor.find({clinicIds : req.query.clinicId});
  res.send(doctors);
})

module.exports = router;