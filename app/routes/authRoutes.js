const Joi = require('joi');
const bcrypt = require('bcrypt');
const { UserModel } = require('../models/userModel');
const express = require('express');

const router = express.Router();

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await UserModel.findOne({ emailAddress: req.body.emailAddress });
  if (!user)
    return res.status(400).send({
      error: {
        message: 'Email not valid'
      }
    });

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword)
    return res.status(400).send({
      error: {
        message: 'Password not valid'
      }
    });
  const token = user.generateAuthToken();
  const result = {
    message: 'Login success',
    'x-auth-token': token
  };
  res.send(result);
});

const validate = user => {
  const schema = {
    emailAddress: Joi.string()
      .min(5)
      .max(50)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(30)
      .required()
  };
  return Joi.validate(user, schema);
};

module.exports = router;
