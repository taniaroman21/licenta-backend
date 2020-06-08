const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const { types } = require('../utils/appointment');

const reviewSchema = new mongoose.Schema({
  user: {
    type: { name: String, id: String }
  },
  clinic: {
    type: { name: String, id: String }
  },
  description: String,
  dateCreated: { type: Date, default: Date.now },
  stars: Number
});

const Review = mongoose.model('Reviews', reviewSchema);

function validateReview(review) {
  const schema = Joi.object({
    userId: Joi.string().required(),
    clinicId: Joi.string().required(),
    description: Joi.string().allow(''),
    stars: Joi.number().required()
  })

  return schema.validate(review);
}

exports.Review = Review;
exports.validate = validateReview;