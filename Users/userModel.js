const mongoose = require('mongoose');
var userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    firsttName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    create_date: {
        type: Date,
        default: Date.now
    }
});
// Export Contact model
var User = module.exports = mongoose.model('users', userSchema);
module.exports.get = function (callback, limit) {
    User.find(callback).limit(limit);
}
module.exports.post = function (callback, limit) {
    Contact.find(callback).limit(limit);

}