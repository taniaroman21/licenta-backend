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
    res.sendStatus(400).send(error.details[0].message);
    return;
  }

  try {
    await validateId(Clinic, req.body.clinicId);
  } catch (error) {
    res.status(400).send(error.message);
    return;
  }
  
  if (req.user._id !== req.body.userId) return res.status(401);
  const clinic = await Clinic.findById(req.body.clinicId);
  // const doctor = await Doctor.findById(req.body.doctorId);
  const patient = await User.findById(req.body.userId);
  if (!clinic) return res.status(400);

  try {
    const appointment = new Appointment({
      user: { name: patient.firstName + ' '+ patient.lastName, id: req.body.userId },
      clinic: {name: clinic.name, id: req.body.clinicId},
      doctor: {name:  "Nume Doctor", id: req.body.doctorId},
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
  if (req.user._id !== req.params.id) return res.status(401);

  const appointments = await Appointment.find({ 'user.id': req.params.id });
  res.send(appointments);

});

router.get('/clinic/:id', auth, async (req, res) => {
  if (req.user._id !== req.params.id) return res.status(401);
  try {
    const appointments = req.query.date ? await Appointment.find({ 'clinic.id': req.params.id, date: req.query.date }) : await Appointment.find({ 'clinic.id': req.params.id});
    res.send(appointments);
  } catch (error) {
    res.send(error);
  }
});

router.get('/doctor/:id', auth, async (req, res) => {
  if (req.user._id !== req.params.id) return res.status(401);

  const appointments = await Appointment.find({ doctorId: req.params.id });
  res.send(appointments);
});

module.exports = router;