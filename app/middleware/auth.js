const jwt = require('jsonwebtoken');
const { UserModel } = require('../models/userModel');

async function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token)
    return res.status(403).send({
      error: {
        message: 'Access denied. No token provided!'
      }
    });
  try {
    const decoded = jwt.verify(token, 'yoursecretkey');
    req.user = decoded;
    const users = await UserModel.findById(req.user._id);
    if (!users)
      return res.status(403).send({
        error: {
          message: 'Access denied. User not found!'
        }
      });
    next();
  } catch (ex) {
    return res.status(403).send({
      error: {
        message: 'Access denied. Token invalid!'
      }
    });
  }
}

module.exports = auth;
