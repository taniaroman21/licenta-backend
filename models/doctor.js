const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');

const doctorSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  dateCreated: { type: Date, default: Date.now },
  password: String,
  fields: [String],
  clinicIds: [String],
  profileImage: { type: String, default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" }
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
    fields: Joi.array().items(Joi.string()),
    clinicId: Joi.string()
  });

  return schema.validate(doctor);
}

exports.Doctor = Doctor;
exports.validate = validateDoctor;