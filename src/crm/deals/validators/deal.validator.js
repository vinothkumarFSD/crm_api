const { body } = require('express-validator');

function SaveContactValidation() {
  return [
    body('name', 'Invalid name').notEmpty().exists(),
    body('price', 'Invalid price').notEmpty().exists(),
    body('quantity', 'Invalid quantity').notEmpty().exists(),
  ];
}

module.exports = SaveContactValidation;
