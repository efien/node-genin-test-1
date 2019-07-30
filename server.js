const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require ("mongoose");
const users = require('./app/routes/userRoutes');
const auth = require('./app/routes/authRoutes');
const app = express();


app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', users);
app.use('/api/auth', auth);

mongoose
  .connect('mongodb://localhost:27017/user_data', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false 
  })
  .then(() => console.log('Mongodb Connected'))
  .catch(err => console.log("Can't connect to database"));

app.get('/', (req,res) => {
    res.send({"message": "CRUD operation and store in database (mongodb) for user data"});
});


app.listen(3000, () =>{
    console.log("Server is listening on port 3000");
});