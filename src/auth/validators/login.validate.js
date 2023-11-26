const { body } = require('express-validator');

function UserLoginValidation() {
  return [
    body('email', 'Invalid email').isEmail().normalizeEmail().toLowerCase().exists(),
    body('password', 'Invalid password').exists(),
  ];
}

module.exports = UserLoginValidation;
