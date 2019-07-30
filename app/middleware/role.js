module.exports = function role(req, res, next) {
  if (!req.user.isAdmin)
    return res.status(403).send({
      error: {
        message: 'Access denied. Your account has no role for Administration action'
      }
    });
  next();
};
