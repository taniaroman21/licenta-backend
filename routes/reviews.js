var _ = require('lodash');
const { Clinic } = require('../models/clinic');
const { User } = require('../models/user');
const { Appointment } = require('../models/appointment');
const { Review, validate } = require('../models/review');
const express = require('express');
const auth = require('../middleware/auth');
const { validateId } = require('../utils/validations');
const nodemailer = require('nodemailer');

const router = express.Router();
router.use(express.json());

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    
    return res.status(400).send(error.details[0].message); 
  }
 
  try {
    await validateId(Clinic, req.body.clinicId);
  } catch (error) {
    return res.status(400).send(error.message);
   
  }
  
  let clinic;
  let user;
  
  if (req.user._id !== req.body.userId) return res.status(401).send("Unauthorized");
  
  try {
     clinic = await Clinic.findById(req.body.clinicId);
     user = await User.findById(req.body.userId);
  } catch (err) {
    return res.send(err.message);
  }
  if (!clinic) return res.status(400);
  try {
    const appointment = await Appointment.find({ 'user.id': req.userId, 'clinic.id': req.clinicId });
    if (!appointment) return res.status(401).send("You are  not allowed to review this clinic yet");
  } catch (error) {
    res.status(500).send(error);
  }

  try {
    clinic.reviews.totalReviews = clinic.reviews.totalReviews + 1;
    console.log(clinic.reviews.stars, clinic.reviews.totalReviews, req.body.stars );
    clinic.reviews.stars = ((clinic.reviews.stars * (clinic.reviews.totalReviews - 1)) + req.body.stars) / clinic.reviews.totalReviews;
    clinic.reviews.stars = Math.round(clinic.reviews.stars * 10) / 10;
    console.log(clinic.reviews.stars);
    clinic.markModified('reviews.stars');
    clinic.markModified('reviews.totalReviews');
    const review = new Review({
      user: { name: user.firstName + ' ' + user.lastName, id: req.user._id},
      clinic: { name: clinic.name, id: req.body.clinicId },
      description:  req.body.description,
      stars: req.body.stars
    });
    await clinic.save();
    const result = await review.save();
    // let transport = nodemailer.createTransport({
    //   service: "Gmail",
    //   auth: {
    //     user: "mockedemailfortesting@gmail.com",
    //     pass: "fortesting"
    //   }
    // });
    // const message = {
    //   from: '', // Sender address
    //   to: 'to@email.com',         // List of recipients
    //   subject: 'New Review', // Subject line
    //   text: `Dear ${clinic.name}, You received a review of ${review.stars} stars` // Plain text body
    // };
    // transport.sendMail(message, function (err, info) {
    //   if (err) {
    //     console.log(err)
    //   } else {
    //     console.log(info);
    //   }
    // });
    res.send(result);
  } catch (error) {
    res.send(error.message);
   
  }

});

router.get('/clinic/:id', async (req, res) => {

  try {
    const count = await Review.find({ 'clinic.id': req.params.id }).count();
    const reviews = await Review.find({ 'clinic.id': req.params.id}).skip(parseInt(req.query.pageSize * req.query.page)).limit(parseInt(req.query.pageSize)).sort({dateCreated: -1});
    res.send({ reviews: reviews, count: count });
  } catch (error) {
    console.log(error)
    res.status(500).send(error);
  }
});



module.exports = router;