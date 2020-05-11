const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');

const clinicSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    county: { type: { id: Number, name: String, state_code: String }, required: true },
    city: { type: { id: Number, name: String }, required: true },
    dateCreated: { type: Date, default: Date.now },
    password: { type: String, required: true }

});
clinicSchema.methods.generateToken = function () {
    const token = jwt.sign({ _id: this._id, isClinic: true }, 'blabla');
    return token;
}
const Clinic = mongoose.model('Clinics', clinicSchema);

function validateClinic(clinic) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        name: Joi.string().required(),
        county: Joi.required(),
        city: Joi.required(),
        password: Joi.string().required(),
        repeatPassword: Joi.ref('password')
    });

    return schema.validate(clinic);
}

exports.Clinic = Clinic;
exports.validate = validateClinic;