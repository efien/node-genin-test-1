const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { validate, UserModel } = require('../models/userModel');

const router = express.Router();

router.get('/me',[auth], async (req, res) => {
    const user = await UserModel.findById(req.user._id).select(
      '-password -__v'
    );
    res.send({ message: 'success', data: user });
});

router.put('/me', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await UserModel.findOne({ _id: req.user._id });
  if (user)
    return res.status(400).send({
      error: {
        message: 'Failed Update. Email already registered by another account'
      }
    });

  if (mongoose.Types.ObjectId.isValid(req.user._id)) {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    user = await UserModel.findByIdAndUpdate(
      req.user._id,
      {
        userName: req.body.userName,
        accountNumber: req.body.accountNumber,
        emailAddress: req.body.emailAddress,
        indentityNumber: req.body.indentityNumber,
        password: password,
      },
      {
        new: true
      }
    ).select('-password, -__v');
    if (!user)
      return res.status(400).send({
        error: {
          message: 'The user with the given ID was not found'
        }
      });
    res.send(user);
  } else {
    return res.status(400).send({
      error: {
        message: 'The user with the given ID was not found'
      }
    });
  }
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send({ error: error.details[0].message });

  let user = await UserModel.findOne({ emailAddress: req.body.emailAddress });
  if (user)
    return res.status(400).send({
      error: {
        message: 'User already registered'
      }
    });

  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash(req.body.password, salt);

  user = new UserModel({
    userName: req.body.userName,
    accountNumber: req.body.accountNumber,
    emailAddress: req.body.emailAddress,
    indentityNumber: req.body.indentityNumber,
    password: password,
    isAdmin: req.body.isAdmin
  });

  await user.save();
  const data = {
    userName: user.userName,
    accountNumber: user.accountNumber,
    emailAddress: user.emailAddress,
    indentityNumber: user.indentityNumber,
    isAdmin: user.isAdmin
  };

  res.send({ message: 'success', data: data });
});

router.get('/', async (req, res) => {
  if (!req.query.page || req.query.page <= 0) req.query.page = 1;
  const totalFeed = await UserModel.countDocuments();
  const limit = 20;
  const page = limit * (req.query.page - 1);
  const users = await UserModel.find()
    .limit(limit)
    .skip(page)
    .select('-password  -__v');

  const result = {
    page: req.query.page,
    totalPage: Math.ceil(totalFeed / limit),
    perPage: limit,
    dataCount: users.length,
    totalData: totalFeed,
    data: users.map(user => {
      return {
        id: user._id,
        userName: user.userName,
        accountNumber: user.accountNumber,
        emailAddress: user.emailAddress,
        indentityNumber: user.indentityNumber,
        isAdmin: user.isAdmin
      };
    })
  };
  res.send(result);
});

router.put('/:id', [auth, role], async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-_id -password -__v');
    if (!user)
      return res.status(400).send({
        error: {
          message: 'The user with the given ID was not found'
        }
      });
    res.send({ message: 'success', data: user });
  } else {
    return res.status(400).send({
      error: {
        message: 'The user with the given ID was not found'
      }
    });
  }
});

router.patch('/:id', [auth, role], async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    const fieldToPatch = Object.keys(req.body);
    const { error } = validate(req.body, fieldToPatch);

    if (error) return res.status(400).send(error.details[0].message);

    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-_id -password -__v');
    if (!user)
      return res.status(400).send({
        error: {
          message: 'The user with the given ID was not found'
        }
      });
    res.send({ message: 'success', data: user });
  } else {
    return res.status(400).send({
      error: {
        message: 'The user with the given ID was not found'
      }
    });
  }
});

router.delete('/:id', [auth, role], async (req, res) => {
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    const user = await UserModel.findByIdAndDelete(req.params.id).select(
      '-password -__v'
    );
    if (!user)
      return res.status(400).send({
        error: {
          message: 'The user with the given ID was not found'
        }
      });
    res.send(user);
  } else {
    return res.status(400).send({
      error: {
        message: 'The user with the given ID was not found'
      }
    });
  }
});

module.exports = router;
