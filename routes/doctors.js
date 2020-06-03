var _ = require('lodash');
const { Doctor, validate } = require('../models/doctor');
const { Clinic } = require("../models/clinic");
const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(express.json());

router.post('/register', auth,  async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        res.sendStatus(400).send(error.details[0].message + "The object you are sending is not valid");
        return;
    }
  if (req.user._id != req.body.clinicId) return res.status(401);
  let clinic = await Clinic.findById(req.user._id);
  let doctor = await Doctor.findOne({ email: req.body.email });
  if (doctor) {
    try {
      if (doctor.clinics.includes(req.body.clinicId)) return res.send("This clinic already has a doctor with this email address");
      doctor.clinics.push({ id: clinic._id, name: clinic.name });
      await doctor.save();
      doctor.fields.forEach(field => {
        if (!clinic.fields.includes(field)) {
          clinic.fields.push(field);
        }        
        });
      await clinic.save();
      res.send(_.pick(doctor, ["_id", "email", "firstName", "lastName", "fields", "clinicIds", "profileImage"]));
    }
    catch (err) {
      res.status(500).send(err.message);
    }
  }
  else {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      let doctor = new Doctor({ email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName, password: hashedPassword, fields: [req.body.field], clinics: [{ id: clinic._id, name: clinic.name }] });
      await doctor.save();
      doctor.fields.forEach(field => {
        if (!clinic.fields.includes(field)) {
          clinic.fields.push(field);
        }
      });
      await clinic.save();

      res.send(_.pick(doctor, ["_id", "email", "firstName", "lastName", "fields", "clinicIds", "profileImage"]));
    }
    catch (err) {
      res.status(500).send(err.message);

    }
  }
});

router.get('/me', auth, async (req, res) => {
  const doctor = await Doctor.findById(req.doctor._id).select("-password");
  res.send(doctor);
});
router.get('/', async (req, res) => {
  const regex = new RegExp(`.*${req.query.filter}.*`, 'i');
  const counter = await Doctor.find().or([{ firstName: regex }, { lastName: regex }, { "clinics.name":  regex  }]).count();
  const doctors = await Doctor.find().or([{ firstName: regex }, { lastName: regex }, { "clinics.name": regex }]).skip(req.query.pageSize * req.query.page).limit(parseInt(req.query.pageSize));
  res.send({ doctors: doctors, count: counter });
});
router.get('/clinic/:id', async (req, res) => {
  
  const doctors = await Doctor.find({ clinicIds: req.params.clinicId });
  res.send(doctors);
})

module.exports = router;