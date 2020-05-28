const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');

const doctorSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  dateCreated: { type: Date, default: Date.now },
  password: String,
  fileds: [String],
  clinicIds: [String]
});
doctorSchema.methods.getType = () => {
  return "doctor";
}
const Doctor = mongoose.model('Doctors', doctorSchema);

function validateDoctor(doctor) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    password: Joi.string().required(),
    repeatPassword: Joi.ref('password'),
    fileds: Joi.array().items(Joi.string()),
    clinicIds: Joi.string()
  });

  return schema.validate(user);
}

exports.Doctor = Doctor;
exports.validate = validateDoctor;