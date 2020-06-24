var _ = require('lodash');
const { Doctor, validate } = require('../models/doctor');
const { Clinic } = require("../models/clinic");
const { User } = require("../models/user");
const { Appointment } = require("../models/appointment");
const express = require('express');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const ResourcesService = require('../services/resources.service');

const router = express.Router();
router.use(express.json());

router.post('/register', auth,  async (req, res) => {
    const { error } = validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message + "The object you are sending is not valid");       
    }
  if (req.user._id != req.body.clinicId) return res.status(401).send("Unauthorized");
  let clinic = await Clinic.findById(req.user._id);
  let doctor = await Doctor.findOne({ email: req.body.email });
  if (doctor) {
    try {
      if (!doctor.fields.includes(req.body.field)) return res.status(401).send("This doctor doesn't have this specialization.");
      let ids = doctor.clinics.map((clinic) => clinic.id);
      if (ids.includes(req.body.clinicId) && clinic.fields.includes(req.body.field)) {
        return res.status(400).send("This clinic already has a doctor with this email address and this specialization");
      } else if (!clinic.fields.includes(req.body.field)) {
        clinic.fields.push(req.body.field);
        if (!ids.includes(req.body.clinicId)) {
          doctor.clinics.push({ id: clinic._id, name: clinic.name });
        }
      }


      await doctor.save();
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
      let doctor = new Doctor({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
        fields: [req.body.field],
        clinics: [{ id: clinic._id, name: clinic.name }]
      });
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

router.get('/:id', auth, async (req, res) => {
  try {
    if (mongoose.Types.ObjectId.isValid(req.params.id) && /^[0-9a-fA-F]{24}/.test(req.params.id)) {
      const doctor = await Doctor.findById(req.params.id).select("-password");
      console.log("hereee");
      res.send(doctor);
    } else {
      const doctor = await Doctor.find({ email: req.params.id }).select("-password");
      res.send(doctor);
    }
  }
  catch (error) {
    res.status(500).send(error);
  }
});

router.get('/', async (req, res) => {
  const regex = new RegExp(`.*${req.query.filter}.*`, 'i');
  const counter = await Doctor.find().or([{ firstName: regex }, { lastName: regex }, { "clinics.name":  regex  }]).count();
  const doctors = await Doctor.find().or([{ firstName: regex }, { lastName: regex }, { "clinics.name": regex }]).skip(req.query.pageSize * req.query.page).limit(parseInt(req.query.pageSize));
  res.send({ doctors: doctors, count: counter });
});
router.get('/clinic/:id', async (req, res) => {
  const doctors = await Doctor.find({ 'clinics.id': req.params.id });
  res.send(doctors);
});

router.get('/:id/patients', auth, async (req, res) => {
  try {
     await Appointment.find({ 'doctor.id': req.params.id }, async (err, docs) => {
      let ids = docs.map((doc) => doc.user.id);
      const patients = await User.find({ _id: { $in: ids } }).select("-password");
      res.send(patients);
    });
  } catch (error) {
    res.status(500).send(error);
  }
  
  
})
router.put('/update', auth, async (req, res) => {
  console.log(req.user._id, req.body.id)
  if (req.user._id !== req.body.id) return res.status(401).send("Unauthorized");
    let doctor = await Doctor.findById(req.body.id);
    if (!doctor) res.status(404).send("Doctor with this id does not exist");
    try {
      doctor.set({
        phone: req.body.phone,
        fields: req.body.fields
      })
      const result = await doctor.save();
      const { password, ...updatedDoctor } = result._doc;
      res.send(updatedDoctor);
    } catch (error) {
      res.send(error);
      console.log(error)

    }
});
router.put('/:id/upload', auth, async (req, res) => {
  if (req.user._id !== req.params.id) res.status(401).send("Not allowed");
  try {
    await ResourcesService.uploadDoctorProfileImage(req, res);
  } catch (error) {
    res.status(500).send(error);
  }

})

module.exports = router;