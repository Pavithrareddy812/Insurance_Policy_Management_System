const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET || 'super_secret_jwt_key_987654321', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
