const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    dateCreated: { type: Date, default: Date.now },
    password: String,
    profileImage: { type: String, default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" },

});

userSchema.methods.getType = () => {
    return 'patient';
}

const User = mongoose.model('Users', userSchema);

function validateUser(user) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        password: Joi.string().required(),
        repeatPassword: Joi.ref('password')
    });

    return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;