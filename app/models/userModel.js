const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    maxlength: 30,
    minlength: 2
  },
  accountNumber: {
    type: String,
    required: true,
    maxlength: 30,
    minlength: 2
  },
  emailAddress: {
    type: String,
    required: true,
    maxlength: 30,
    minlength: 2
  },
  password: {
    type: String,
    required: true,
    maxlength: 1024,
    minlength: 6
  },
  indentityNumber: {
    type: String,
    required: true,
    maxlength: 30,
    minlength: 2
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    'yoursecretkey'
  );
  return token;
};

const UserModel = mongoose.model('User', userSchema);

const validateUser = (user, field = null) => {
  const joiSchema = {
    userName: Joi.string()
      .min(2)
      .max(30)
      .required(),
    accountNumber: Joi.string()
      .min(2)
      .max(30)
      .required(),
    emailAddress: Joi.string()
      .min(2)
      .max(30)
      .required(),
    password: Joi.string()
      .min(6)
      .max(1024)
      .required(),
    indentityNumber: Joi.string()
      .min(2)
      .max(30)
      .required(),
    isAdmin: Joi.boolean()
  };
  if (!field) {
    return Joi.validate(user, joiSchema);
  } else {
    const dynamicSchema = Object.keys(joiSchema)
      .filter(key => field.includes(key))
      .reduce((obj, key) => {
        obj[key] = joiSchema[key];
        return obj;
      }, {});

    return Joi.validate(user, dynamicSchema);
  }
};

exports.UserModel = UserModel;
exports.validate = validateUser;
exports.userSchema = userSchema;
