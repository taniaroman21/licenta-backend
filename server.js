const express = require("expresss");
let bodyParser = require('body-parser');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const apiRoutes = require("./api-routes");

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());

mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true });
var db = mongoose.connection;

if (!db)
    console.log("Error connecting db")
else
    console.log("Db connected successfully")


app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { email: req.email, firstName: req.fisrtName, lastName: req.lastName, password: hashedPassword }
    }
    catch{

    }
})
app.use('/api', apiRoutes);
app.listen(3000);