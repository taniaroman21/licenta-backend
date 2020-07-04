const s3 = require('./s3.service');
const mongoose = require('mongoose');
const { User } = require('../models/user');
const { Doctor } = require('../models/doctor');
const { Clinic } = require('../models/clinic');
const { Appointment } = require('../models/appointment');
const fs = require('fs');
const multer = require('multer');


function getByteArray(filePath) {
  console.log(filePath);
  let fileData = fs.readFileSync(filePath).toString('hex');
  let result = []
  for (var i = 0; i < fileData.length; i += 2)
    result.push('0x' + fileData[i] + '' + fileData[i + 1]);
  console.log("done");
  return result;
}

const ResourceService = {

  uploadUserProfileImage: async (req,res)=> {
    const file = req.body.file;
    const userId = req.user._id;
    try { 
      const user = await User.findById(userId);
      if (!user) return res.status(404).send("User not found");
    
      
      const base64Data = new Buffer(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');    
      const type = file.split(';')[0].split('/')[1];
      const filename = `${req.body.name}.${req.body.extension}`
      const params = {
        Bucket: 'licenta-images',
        Key: `patients/${userId}-${filename}`,
        Body: base64Data,
        ContentEncoding: 'base64', 
        ContentType: `image/${type}`   
      };
      
      s3.upload(params, async (error, data) => {
        if (error) res.status(500).send(error);
        user.profileImage = data.Location;
        const response = await user.save();
        res.send(response);
      });
      
    } catch (error) {
      res.status(500).send("Eroare");
    }
    
    
  },
  
  uploadDoctorProfileImage: async (req, res) => {
    const file = req.body.file;
    const userId = req.user._id;
    try {
      const user = await Doctor.findById(userId);
      if (!user) return res.status(404).send("User not found");
      

      const base64Data = new Buffer(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      const type = file.split(';')[0].split('/')[1];
      const filename = `${req.body.name}.${req.body.extension}`
      const params = {
        Bucket: 'licenta-images',
        Key: `doctors/${userId}-${filename}`,
        Body: base64Data,
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
      };

      s3.upload(params, async (error, data) => {
        if (error) res.status(500).send(error);
        user.profileImage = data.Location;
        const response = await user.save();
        res.send(response);
      });

    } catch (error) {
      res.status(500).send("Eroare");
    }
  },
  uploadClinicProfileImage: async (req, res) => {
    const file = req.body.file;
    const userId = req.user._id;
    try {
      const user = await Clinic.findById(userId);
      if (!user) return res.status(404).send("User not found");

      const base64Data = new Buffer(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      const type = file.split(';')[0].split('/')[1];
      const filename = `${req.body.name}.${req.body.extension}`
      const params = {
        Bucket: 'licenta-images',
        Key: `clinics/${userId}-${filename}`,
        Body: base64Data,
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
      };

      s3.upload(params, async (error, data) => {
        if (error) res.status(500).send(error);
        user.profileImage = data.Location;
        const response = await user.save();
        res.send(response);
      });

    } catch (error) {
      res.status(500).send("Eroare");
    }


  },
  uploadAppointmentDocs: async (req, res) => {
    const file = req.files[0];
    const appointmentId = req.params.id;
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) return res.status(404).send("Appointment doesn't exist");

      const params = {
        Bucket: 'licenta-images',
        Key: `appointments/${appointmentId}-${file.originalname}`,
        Body: file.buffer,   
      };

      s3.upload(params, async (error, data) => {
        if (error) res.status(500).send(error);
        let docs = appointment.resultDocs;
        docs.push({ name:file.originalname,file:data.Location });
        try {
          const response = await appointment.update({'resultDocs': docs});
          res.send(response);
        } catch (error) {
          res.status(500).send(error);
        }
      });

    } catch (error) {
      res.status(500).send("Eroare");
    }
 }
}
module.exports = ResourceService;