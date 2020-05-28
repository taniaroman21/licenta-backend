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
      doctor.clinicIds.push(req.body.clinicIds);
      await doctor.save();

      res.send(_.pick(doctor, ["email", "firstName", "lasName", "field"]));
    }
    catch (err) {
      res.status(500).send(error.details[0].message);
    }
  }
  else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let doctor = new Doctor({ email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName, password: hashedPassword, clinicIds: [req.body.clinicIds] });
      await doctor.save();

      res.send(_.pick(user, ["email", "firstName", "lastName", "field"]));
    }
    catch (err) {
      res.status(500).send(error.details[0].message);
    }
  }
});

router.get('/me', auth, async (req, res) => {
    const doctor = await Doctor.findById(req.doctor._id).select("-password");
    res.send(doctor);
})

module.exports = router;