const { body } = require('express-validator');

function SaveContactValidation() {
  return [
    body('email', 'Invalid email').isEmail().normalizeEmail().toLowerCase().exists(),
    body('name', 'Invalid password').notEmpty().exists(),
  ];
}

module.exports = SaveContactValidation;
