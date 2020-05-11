const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const express = require("express");
let bodyParser = require('body-parser');
const users = require("./routes/users");
const clinics = require("./routes/clinics");
const auth = require("./routes/auth");

const app = express();
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(helmet());
if (app.get('env') == 'development') {
    app.use(morgan('tiny'));
}
mongoose.connect('mongodb://localhost/MedCareDB', { useNewUrlParser: true })
    .then(() => console.log("Database connected"))
    .catch(() => console.error("Error connecting to Database"))

app.use('/api/users', users);
app.use('/api/clinics', clinics);
app.use('/api/auth', auth);

const port = process.env.PORT || 3000;
app.listen(port); 