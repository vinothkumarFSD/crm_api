const { body } = require('express-validator');

function UserRegisterValidation() {
  return [
    body('email', 'Invalid email').isEmail().normalizeEmail().toLowerCase().exists(),
    body('mobile', 'Invalid mobile number').exists(),
    body('password', 'Invalid password').exists(),
  ];
}

module.exports = UserRegisterValidation;
