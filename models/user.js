const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: String,
    firstName: String,
    lastName: String,
    dateCreated: { type: Date, default: Date.now },
    password: String

});
userSchema.methods.generateToken = function () {
    const token = jwt.sign({ _id: this._id }, 'blabla');
    return token;
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