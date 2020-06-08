const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { types } = require('../utils/appointment');
const Schema = mongoose.Schema;

const appointmentSchema = new mongoose.Schema({
  user: {
    type: { name: { type: Schema.Types.ObjectId, ref: 'User' }, id: String }
  },
  clinic: {
    type: { name: String, id: String }
  },
  doctor: {
    type: { name: String, id: String }
  },
  dateCreated: { type: Date, default: Date.now },
  date: {
    type: Date, validate: {
      validator: (date) => {
        now = new Date();
        if (date.getTime() < now.getTime()) {
          throw new Error('Appointment date cannot be earlier than the current date')
        }
        return true;
      }
  }},
  type: {
    type: String, validate: {
      validator: (type) => {
        if (!types.includes(type)) {
          throw new Error('Consultation type is not valid');
        }
        return true;
      }
    }
  },
  hour: String,
  field: String,
  result: {type:{diagnosis: String, prescription: String}}
});

const Appointment = mongoose.model('Appointments', appointmentSchema);

function validateAppointment(appointment) {
  const schema = Joi.object({
    userId: Joi.string().required(),
    clinicId: Joi.string().required(),
    doctorId: Joi.string().required(),
    date: Joi.required(),
    type: Joi.string().required(),
    hour: Joi.string().required(),
    field: Joi.string().required()
  });

  return schema.validate(appointment);
}

exports.Appointment = Appointment;
exports.validate = validateAppointment;