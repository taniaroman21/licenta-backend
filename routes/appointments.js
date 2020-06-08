var _ = require('lodash');
const { Clinic } = require('../models/clinic');
const { User } = require('../models/user');
const { Doctor } = require('../models/doctor');
const { Appointment, validate } = require('../models/appointment');
const express = require('express');
const auth = require('../middleware/auth');
const { validateId } = require('../utils/validations');

const router = express.Router();
router.use(express.json());

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  try {
    await validateId(Clinic, req.body.clinicId);
  } catch (error) {
    res.status(400).send(error.message);
    return;
  }
  
  if (req.user._id !== req.body.userId) return res.status(401).send("Unauthorized");
  const clinic = await Clinic.findById(req.body.clinicId);
  const doctor = await Doctor.findById(req.body.doctorId);
  const patient = await User.findById(req.body.userId);
  if (!clinic) return res.status(400);

  try {
    const appointment = new Appointment({
      user: { name: patient.firstName + ' '+ patient.lastName, id: req.body.userId },
      clinic: {name: clinic.name, id: req.body.clinicId},
      doctor: {name:  doctor.firstName+ ' ' + doctor.lastName, id: req.body.doctorId},
      date: req.body.date,
      type: req.body.type,
      hour: req.body.hour,
      field: req.body.field
    });
    const result = await appointment.save();
    res.send(result);
  } catch (error) {
     res.send(error.message);
  }

});

router.get('/patient/:id', auth, async(req, res) => {
  if (req.user._id !== req.params.id && req.user._id !== req.query.doctorId) return res.status(401).send("Unauthorized");
  let query = {
    'user.id': req.params.id,
    'clinic.id': req.query.clinicId,
    'doctor.id':req.query.doctorId,
    'date': req.query.date
  };
  Object.keys(query).forEach(key => {
    console.log(key);
    if (!query[key]) {
      delete query[key];
    }
  });
  try {
    const appointments = await Appointment.find(query);
    res.send(appointments);
  } catch (error) {
    res.status(500);
  }

});

router.get('/clinic/:id', async (req, res) => {
  // if (req.user._id !== req.params.id) return res.status(401);
  try {
    const appointments = req.query.date ? await Appointment.find({ 'clinic.id': req.params.id, date: req.query.date }) : await Appointment.find({ 'clinic.id': req.params.id});
    res.send(appointments);
  } catch (error) {
    res.send(error);
  }
});

router.get('/doctor/:id', auth, async (req, res) => {
  
  let query = {
    'doctor.id': req.params.id,
    'patient.id': req.query.patientId,
    'clinic.id': req.query.clinicId,
    'date': req.query.date
  };
  Object.keys(query).forEach(key => {
    console.log(key);
    if (!query[key]) {
      delete query[key];     
    }
  });
  

  try {
    const appointments = await Appointment.find(query);
    res.send(appointments);
  } catch (error) {
    res.send(error);
  }
});

router.put('/:id', auth, async (req, res) => {
  let appointment = await Appointment.findById(req.params.id);
  if (!appointment) return res.status(404).send("Appointment doesn't exist");
  if (appointment.doctor.id != req.user._id) return res.status(401).send("You're not allowed to leave a result  on this appointment");
  let now = new Date();
  // if (appointment.date.getTime() > now.getTime()) return res.status(401).send("You can't set the results before the appointment");
  try {
    appointment.set({
      'result.diagnosis' : req.body.diagnosis,
      'result.prescription':req.body.prescription
    });
    const result = await appointment.save();
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
})
module.exports = router;