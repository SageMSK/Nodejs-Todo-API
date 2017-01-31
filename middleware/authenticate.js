const User = require('./../models/user');

const authenticate = (req, res, next) => {
  let token = req.header('x-auth') || req.token || req.body.token;

  User.findByToken(token).then(user => {
    if (!user) {
      return Promise.reject({
        // have token but unable to find user because the token has been removed/expired
        message: "Unable to find user's token. Please log-in."
      });
    }

    req.user = user;
    req.token = token;
    next();
  }).catch(e => res.status(401).json(e));
};

module.exports = authenticate;