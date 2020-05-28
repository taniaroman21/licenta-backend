const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const clinicSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    county: { type: { id: Number, name: String, state_code: String }, required: true },
    city: { type: { id: Number, name: String }, required: true },
    dateCreated: { type: Date, default: Date.now },
    password: { type: String, required: true },
    fields: { type: Array({ id: String }), default: [] },
    reviews: { type: { stars: Number, totalReviews: Number }, default: { stars: 0, totalReviews: 0 } },
    profileImage: { type: String, default: null },
    description: { type: String, default: '' }

});
clinicSchema.methods.getType = () => {
    return 'clinic';
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